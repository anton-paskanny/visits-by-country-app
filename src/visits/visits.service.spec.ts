import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { RedisService } from '../redis/redis.service';

describe('VisitsService', () => {
  let service: VisitsService;
  let mockRedisClient: {
    hIncrBy: jest.Mock;
    hGetAll: jest.Mock;
    hGet: jest.Mock;
    del: jest.Mock;
  };

  beforeEach(async () => {
    // Mock Redis client
    mockRedisClient = {
      hIncrBy: jest.fn(),
      hGetAll: jest.fn(),
      hGet: jest.fn(),
      del: jest.fn(),
    };

    // Mock Redis service
    const mockRedisService = {
      getClient: jest.fn().mockReturnValue(mockRedisClient),
      isConnected: jest.fn().mockReturnValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisitsService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<VisitsService>(VisitsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('incrementVisit', () => {
    it('should increment visit count for a country', async () => {
      const countryCode = 'us';
      const expectedCount = 5;
      mockRedisClient.hIncrBy.mockResolvedValue(expectedCount);

      const result = await service.incrementVisit(countryCode);

      expect(result).toEqual({ country: countryCode, count: expectedCount });
      expect(mockRedisClient.hIncrBy).toHaveBeenCalledWith(
        'visits:by_country',
        countryCode,
        1,
      );
    });

    it('should throw ServiceUnavailableException on Redis error', async () => {
      mockRedisClient.hIncrBy.mockRejectedValue(new Error('Redis error'));

      await expect(service.incrementVisit('us')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should handle multiple countries independently', async () => {
      mockRedisClient.hIncrBy
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(1)
        .mockResolvedValueOnce(2);

      await service.incrementVisit('us');
      await service.incrementVisit('ru');
      const result = await service.incrementVisit('us');

      expect(result.count).toBe(2);
    });
  });

  describe('getAllStats', () => {
    it('should return empty object when no visits', async () => {
      mockRedisClient.hGetAll.mockResolvedValue({});

      const result = await service.getAllStats();

      expect(result).toEqual({});
    });

    it('should return all country statistics', async () => {
      const mockData = {
        us: '10',
        ru: '5',
        it: '3',
      };
      mockRedisClient.hGetAll.mockResolvedValue(mockData);

      const result = await service.getAllStats();

      expect(result).toEqual({
        us: 10,
        ru: 5,
        it: 3,
      });
    });

    it('should convert string counts to numbers', async () => {
      mockRedisClient.hGetAll.mockResolvedValue({ us: '100' });

      const result = await service.getAllStats();

      expect(result.us).toBe(100);
      expect(typeof result.us).toBe('number');
    });

    it('should throw ServiceUnavailableException on Redis error', async () => {
      mockRedisClient.hGetAll.mockRejectedValue(new Error('Redis error'));

      await expect(service.getAllStats()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('getCountryStats', () => {
    it('should return count for existing country', async () => {
      mockRedisClient.hGet.mockResolvedValue('42');

      const result = await service.getCountryStats('us');

      expect(result).toBe(42);
    });

    it('should return 0 for non-existing country', async () => {
      mockRedisClient.hGet.mockResolvedValue(null);

      const result = await service.getCountryStats('xx');

      expect(result).toBe(0);
    });

    it('should throw ServiceUnavailableException on Redis error', async () => {
      mockRedisClient.hGet.mockRejectedValue(new Error('Redis error'));

      await expect(service.getCountryStats('us')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('resetStats', () => {
    it('should reset all statistics', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await service.resetStats();

      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith('visits:by_country');
    });

    it('should throw ServiceUnavailableException on Redis error', async () => {
      mockRedisClient.del.mockRejectedValue(new Error('Redis error'));

      await expect(service.resetStats()).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
