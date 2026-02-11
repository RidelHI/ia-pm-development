import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PRODUCT_STATUSES, type ProductStatus } from '../product.types';
import { trimOptionalString } from './transforms';

export class UpdateProductDto {
  @ApiPropertyOptional({
    minLength: 3,
    maxLength: 64,
    example: 'SKU-APPLE-001',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  sku?: string;

  @ApiPropertyOptional({
    minLength: 3,
    maxLength: 120,
    example: 'Apple Box',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ minimum: 0, example: 40 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @ApiPropertyOptional({ minimum: 0, example: 599 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  unitPriceCents?: number;

  @ApiPropertyOptional({ enum: PRODUCT_STATUSES, example: 'active' })
  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @ApiPropertyOptional({ maxLength: 64, example: 'A-01' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  location?: string;
}
