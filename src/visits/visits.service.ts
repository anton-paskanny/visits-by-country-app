import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { VisitResponseDto, StatsResponseDto } from './dto/visit-response.dto';

/**
 * Service for managing visit statistics by country
 * Handles all business logic for tracking and retrieving visit data
 */
@Injectable()
export class VisitsService {
  private readonly logger = new Logger(VisitsService.name);
  private readonly VISITS_KEY = 'visits:by_country';

  constructor(private readonly redisService: RedisService) {}

  /**
   * Increment visit count for a specific country
   * Uses Redis HINCRBY for atomic increment (thread-safe)
   *
   * @param countryCode - ISO 3166-1 alpha-2 country code (lowercase)
   * @returns Visit response with country code and new count
   * @throws ServiceUnavailableException if Redis operation fails
   */
  async incrementVisit(countryCode: string): Promise<VisitResponseDto> {
    try {
      const client = this.redisService.getClient();
      const newCount = await client.hIncrBy(this.VISITS_KEY, countryCode, 1);

      return {
        country: countryCode,
        count: newCount,
      };
    } catch (error) {
      this.logger.error(`Error incrementing visit for ${countryCode}:`, error);
      throw new ServiceUnavailableException(
        'Failed to update visit statistics',
      );
    }
  }

  /**
   * Get visit statistics for all countries
   *
   * @returns Object with country codes as keys and visit counts as values
   * @throws ServiceUnavailableException if Redis operation fails
   */
  async getAllStats(): Promise<StatsResponseDto> {
    try {
      const client = this.redisService.getClient();
      const stats = await client.hGetAll(this.VISITS_KEY);

      // Convert string values to numbers
      const formattedStats: StatsResponseDto = {};
      for (const [country, count] of Object.entries(stats)) {
        formattedStats[country] = parseInt(count, 10);
      }

      return formattedStats;
    } catch (error) {
      this.logger.error('Error fetching visit statistics:', error);
      throw new ServiceUnavailableException(
        'Failed to retrieve visit statistics',
      );
    }
  }

  /**
   * Get visit count for a specific country
   *
   * @param countryCode - ISO 3166-1 alpha-2 country code
   * @returns Visit count (0 if no visits recorded)
   * @throws ServiceUnavailableException if Redis operation fails
   */
  async getCountryStats(countryCode: string): Promise<number> {
    try {
      const client = this.redisService.getClient();
      const count = await client.hGet(this.VISITS_KEY, countryCode);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      this.logger.error(`Error fetching stats for ${countryCode}:`, error);
      throw new ServiceUnavailableException(
        'Failed to retrieve country statistics',
      );
    }
  }

  /**
   * Reset all visit statistics
   * Useful for testing and maintenance
   *
   * @returns True if successful
   * @throws ServiceUnavailableException if Redis operation fails
   */
  async resetStats(): Promise<boolean> {
    try {
      const client = this.redisService.getClient();
      await client.del(this.VISITS_KEY);
      return true;
    } catch (error) {
      this.logger.error('Error resetting statistics:', error);
      throw new ServiceUnavailableException('Failed to reset statistics');
    }
  }
}
