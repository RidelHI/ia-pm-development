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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PRODUCT_STATUSES, type ProductStatus } from '../product.types';
import { trimOptionalString, trimString } from './transforms';

export class CreateProductDto {
  @ApiProperty({ minLength: 3, maxLength: 64, example: 'SKU-APPLE-001' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  sku!: string;

  @ApiProperty({ minLength: 3, maxLength: 120, example: 'Apple Box' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ minimum: 0, example: 40 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiProperty({ minimum: 0, example: 599 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  unitPriceCents!: number;

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
