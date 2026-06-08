import { Module } from '@nestjs/common';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';
import { GeoIpService } from '../common/utils/geoip.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [VisitsController],
  providers: [VisitsService, GeoIpService],
  exports: [VisitsService],
})
export class VisitsModule {}
