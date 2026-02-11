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
import { PRODUCT_STATUSES, type ProductStatus } from '../product.types';
import { trimOptionalString } from './transforms';

export class UpdateProductDto {
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  sku?: string;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  name?: string;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  unitPriceCents?: number;

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  location?: string;
}
