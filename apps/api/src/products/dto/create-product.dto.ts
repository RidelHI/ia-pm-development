import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  Matches,
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

const MAX_IMAGE_URL_LENGTH = 8_000_000;

export class CreateProductDto {
  @ApiProperty({ minLength: 3, maxLength: 64, example: 'SKU-APPLE-001' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  sku!: string;

  @ApiPropertyOptional({
    minLength: 3,
    maxLength: 64,
    example: '7501234567890',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  barcode?: string;

  @ApiProperty({ minLength: 3, maxLength: 120, example: 'Apple Box' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ maxLength: 80, example: 'Bebidas' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ maxLength: 80, example: 'Marca Norte' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  brand?: string;

  @ApiProperty({ minimum: 0, example: 40 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @ApiPropertyOptional({ minimum: 0, example: 10 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  minimumStock?: number;

  @ApiProperty({ minimum: 0, example: 599 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  unitPriceCents!: number;

  @ApiPropertyOptional({
    maxLength: MAX_IMAGE_URL_LENGTH,
    example: 'https://images.example.com/products/apple-box.jpg',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(MAX_IMAGE_URL_LENGTH)
  @Matches(/^(https?:\/\/|data:image\/)/i, {
    message: 'imageUrl must start with http(s):// or data:image/',
  })
  imageUrl?: string;

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

  @ApiPropertyOptional({
    maxLength: 500,
    example: 'Mantener alejado del calor.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
