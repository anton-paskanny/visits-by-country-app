import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { RedisService } from '../src/redis/redis.service';

interface HealthResponse {
  status: string;
  timestamp: string;
  services: { redis: string };
}

interface VisitResponse {
  country: string;
  count: number;
}

interface StatsResponse {
  [country: string]: number;
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
}

describe('Visits API (e2e)', () => {
  let app: INestApplication;
  let redisService: RedisService;
  let httpServer: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same validation pipe as in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    redisService = app.get<RedisService>(RedisService);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Reset statistics before each test
    const client = redisService.getClient();
    await client.del('visits:by_country');
  });

  describe('/api/health (GET)', () => {
    it('should return healthy status', () => {
      return request(httpServer)
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          const body = res.body as HealthResponse;
          expect(body.status).toBe('healthy');
          expect(body.services.redis).toBe('connected');
          expect(body.timestamp).toBeDefined();
        });
    });
  });

  describe('/api/visits (POST)', () => {
    it('should increment visit count for valid country code', () => {
      return request(httpServer)
        .post('/api/visits')
        .send({ country: 'us' })
        .expect(200)
        .expect((res) => {
          const body = res.body as VisitResponse;
          expect(body.country).toBe('us');
          expect(body.count).toBe(1);
        });
    });

    it('should normalize country code to lowercase', () => {
      return request(httpServer)
        .post('/api/visits')
        .send({ country: 'US' })
        .expect(200)
        .expect((res) => {
          const body = res.body as VisitResponse;
          expect(body.country).toBe('us');
        });
    });

    it('should handle multiple visits to same country', async () => {
      await request(httpServer).post('/api/visits').send({ country: 'ru' });

      await request(httpServer).post('/api/visits').send({ country: 'ru' });

      return request(httpServer)
        .post('/api/visits')
        .send({ country: 'ru' })
        .expect(200)
        .expect((res) => {
          const body = res.body as VisitResponse;
          expect(body.count).toBe(3);
        });
    });

    it('should reject invalid country code (too long)', () => {
      return request(httpServer)
        .post('/api/visits')
        .send({ country: 'usa' })
        .expect(400)
        .expect((res) => {
          const body = res.body as ErrorResponse;
          expect(body.statusCode).toBe(400);
          expect(body.message).toBeDefined();
        });
    });

    it('should reject invalid country code (too short)', () => {
      return request(httpServer)
        .post('/api/visits')
        .send({ country: 'u' })
        .expect(400);
    });

    it('should reject missing country code', () => {
      return request(httpServer).post('/api/visits').send({}).expect(400);
    });

    it('should reject non-string country code', () => {
      return request(httpServer)
        .post('/api/visits')
        .send({ country: 123 })
        .expect(400);
    });

    it('should reject country code with numbers', () => {
      return request(httpServer)
        .post('/api/visits')
        .send({ country: 'u1' })
        .expect(400);
    });

    it('should handle concurrent requests correctly', async () => {
      const requests = Array(20)
        .fill(null)
        .map(() =>
          request(httpServer).post('/api/visits').send({ country: 'it' }),
        );

      await Promise.all(requests);

      return request(httpServer)
        .get('/api/stats')
        .expect(200)
        .expect((res) => {
          const body = res.body as StatsResponse;
          expect(body.it).toBe(20);
        });
    });
  });

  describe('/api/stats (GET)', () => {
    it('should return empty object when no visits', () => {
      return request(httpServer)
        .get('/api/stats')
        .expect(200)
        .expect((res) => {
          const body = res.body as StatsResponse;
          expect(body).toEqual({});
        });
    });

    it('should return all country statistics', async () => {
      await request(httpServer).post('/api/visits').send({ country: 'us' });
      await request(httpServer).post('/api/visits').send({ country: 'us' });
      await request(httpServer).post('/api/visits').send({ country: 'ru' });
      await request(httpServer).post('/api/visits').send({ country: 'it' });
      await request(httpServer).post('/api/visits').send({ country: 'it' });
      await request(httpServer).post('/api/visits').send({ country: 'it' });

      return request(httpServer)
        .get('/api/stats')
        .expect(200)
        .expect((res) => {
          const body = res.body as StatsResponse;
          expect(body.us).toBe(2);
          expect(body.ru).toBe(1);
          expect(body.it).toBe(3);
        });
    });

    it('should return numbers not strings', async () => {
      await request(httpServer).post('/api/visits').send({ country: 'fr' });

      return request(httpServer)
        .get('/api/stats')
        .expect(200)
        .expect((res) => {
          const body = res.body as StatsResponse;
          expect(typeof body.fr).toBe('number');
          expect(body.fr).toBe(1);
        });
    });
  });
});
