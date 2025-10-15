import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { VisitsService } from './visits.service';
import { CreateVisitDto } from './dto/create-visit.dto';
import {
  VisitResponseDto,
  StatsResponseDto,
  HealthResponseDto,
} from './dto/visit-response.dto';
import { RedisService } from '../redis/redis.service';
import { GeoIpService } from '../common/utils/geoip.service';

/**
 * Controller for visit tracking endpoints
 * Handles HTTP requests for recording visits and retrieving statistics
 */
@Controller()
export class VisitsController {
  constructor(
    private readonly visitsService: VisitsService,
    private readonly redisService: RedisService,
    private readonly geoIpService: GeoIpService,
  ) {}

  /**
   * POST /api/visits
   * Record a visit - country is detected from IP address if not provided
   *
   * @param req - Express request object (for IP extraction)
   * @param createVisitDto - Optional DTO containing country code
   * @returns Visit response with country and updated count
   */
  @Post('visits')
  @HttpCode(HttpStatus.OK)
  async createVisit(
    @Req() req: Request,
    @Body() createVisitDto: CreateVisitDto,
  ): Promise<VisitResponseDto> {
    let country = createVisitDto.country;

    // If country not provided in body, detect from IP
    if (!country) {
      const ip = this.geoIpService.extractIp(
        req.headers as Record<string, string | string[]>,
        req.ip || req.socket.remoteAddress || '',
      );

      const detectedCountry = this.geoIpService.getCountryFromIp(ip);

      if (!detectedCountry) {
        throw new BadRequestException(
          'Unable to detect country from IP address',
        );
      }

      country = detectedCountry;
    }

    return this.visitsService.incrementVisit(country);
  }

  /**
   * GET /api/stats
   * Retrieve visit statistics for all countries
   *
   * @returns Object with country codes and their visit counts
   */
  @Get('stats')
  async getStats(): Promise<StatsResponseDto> {
    return this.visitsService.getAllStats();
  }

  /**
   * GET /api/health
   * Health check endpoint for monitoring
   *
   * @returns Health status with service availability
   */
  @Get('health')
  healthCheck(): HealthResponseDto {
    const redisOk = this.redisService.isConnected();

    return {
      status: redisOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        redis: redisOk ? 'connected' : 'disconnected',
      },
    };
  }
}
