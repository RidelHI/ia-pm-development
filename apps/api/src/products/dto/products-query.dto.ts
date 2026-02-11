import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PRODUCT_STATUSES, type ProductStatus } from '../product.types';
import { trimOptionalString } from './transforms';

export class ProductsQueryDto {
  @ApiPropertyOptional({ maxLength: 120, example: 'apple' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({ enum: PRODUCT_STATUSES, example: 'active' })
  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @ApiPropertyOptional({ minimum: 1, example: 1 })
  @Transform(({ value }) =>
    value === undefined ? undefined : Number.parseInt(String(value), 10),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, example: 20 })
  @Transform(({ value }) =>
    value === undefined ? undefined : Number.parseInt(String(value), 10),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
