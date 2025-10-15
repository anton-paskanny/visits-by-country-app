import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import configuration from './config/configuration';
import { RedisModule } from './redis/redis.module';
import { VisitsModule } from './visits/visits.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

/**
 * Root application module
 * Configures all modules, providers, and global settings
 */
@Module({
  imports: [
    // Global configuration module
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    // Rate limiting - 1500 requests per minute per IP (supports 1000/min with buffer)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 1500, // 1500 requests per minute (25 req/s)
      },
    ]),
    // Core modules
    RedisModule,
    VisitsModule,
  ],
  providers: [
    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
