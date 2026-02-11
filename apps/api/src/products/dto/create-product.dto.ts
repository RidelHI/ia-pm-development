import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PRODUCT_STATUSES, type ProductStatus } from '../product.types';
import { trimOptionalString, trimString } from './transforms';

export class CreateProductDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  sku!: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  unitPriceCents!: number;

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  location?: string;
}
