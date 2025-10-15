import { IsString, Matches, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a visit record
 * Country code is optional - if not provided, it will be detected from IP
 */
export class CreateVisitDto {
  @IsOptional()
  @IsString({ message: 'Country code must be a string' })
  @Matches(/^[a-z]{2}$/i, {
    message:
      'Country code must be a 2-letter ISO 3166-1 alpha-2 code (e.g., us, ru, it)',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase().trim() : '',
  )
  country?: string;
}
