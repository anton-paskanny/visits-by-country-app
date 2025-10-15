import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { RedisService } from '../redis/redis.service';
import { GeoIpService } from '../common/utils/geoip.service';
import { CreateVisitDto } from './dto/create-visit.dto';

describe('VisitsController', () => {
  let controller: VisitsController;
  let visitsService: VisitsService;
  let redisService: RedisService;

  beforeEach(async () => {
    const mockVisitsService = {
      incrementVisit: jest.fn(),
      getAllStats: jest.fn(),
    };

    const mockRedisService = {
      isConnected: jest.fn(),
    };

    const mockGeoIpService = {
      extractIp: jest.fn(),
      getCountryFromIp: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VisitsController],
      providers: [
        {
          provide: VisitsService,
          useValue: mockVisitsService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: GeoIpService,
          useValue: mockGeoIpService,
        },
      ],
    }).compile();

    controller = module.get<VisitsController>(VisitsController);
    visitsService = module.get<VisitsService>(VisitsService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVisit', () => {
    it('should increment visit for a country', async () => {
      const dto: CreateVisitDto = { country: 'us' };
      const mockReq = {} as Request;
      const expectedResult = { country: 'us', count: 5 };

      jest
        .spyOn(visitsService, 'incrementVisit')
        .mockResolvedValue(expectedResult);

      const result = await controller.createVisit(mockReq, dto);

      expect(result).toEqual(expectedResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(visitsService.incrementVisit).toHaveBeenCalledWith('us');
    });

    it('should handle normalized country code', async () => {
      const dto: CreateVisitDto = { country: 'ru' };
      const mockReq = {} as Request;
      const expectedResult = { country: 'ru', count: 1 };

      jest
        .spyOn(visitsService, 'incrementVisit')
        .mockResolvedValue(expectedResult);

      await controller.createVisit(mockReq, dto);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(visitsService.incrementVisit).toHaveBeenCalledWith('ru');
    });
  });

  describe('getStats', () => {
    it('should return all statistics', async () => {
      const expectedStats = {
        us: 10,
        ru: 5,
        it: 3,
      };

      jest.spyOn(visitsService, 'getAllStats').mockResolvedValue(expectedStats);

      const result = await controller.getStats();

      expect(result).toEqual(expectedStats);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(visitsService.getAllStats).toHaveBeenCalled();
    });

    it('should return empty object when no stats', async () => {
      jest.spyOn(visitsService, 'getAllStats').mockResolvedValue({});

      const result = await controller.getStats();

      expect(result).toEqual({});
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status when Redis is connected', () => {
      jest.spyOn(redisService, 'isConnected').mockReturnValue(true);

      const result = controller.healthCheck();

      expect(result.status).toBe('healthy');
      expect(result.services.redis).toBe('connected');
      expect(result.timestamp).toBeDefined();
    });

    it('should return degraded status when Redis is disconnected', () => {
      jest.spyOn(redisService, 'isConnected').mockReturnValue(false);

      const result = controller.healthCheck();

      expect(result.status).toBe('degraded');
      expect(result.services.redis).toBe('disconnected');
    });
  });
});
