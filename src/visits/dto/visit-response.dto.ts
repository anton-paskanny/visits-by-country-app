/**
 * Response DTO for a single visit record
 */
export class VisitResponseDto {
  country: string;
  count: number;
}

/**
 * Response DTO for statistics (all countries)
 */
export class StatsResponseDto {
  [countryCode: string]: number;
}

/**
 * Response DTO for health check
 */
export class HealthResponseDto {
  status: string;
  timestamp: string;
  services: {
    redis: string;
  };
}
