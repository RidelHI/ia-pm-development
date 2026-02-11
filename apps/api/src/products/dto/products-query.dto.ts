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
import { PRODUCT_STATUSES, type ProductStatus } from '../product.types';
import { trimOptionalString } from './transforms';

export class ProductsQueryDto {
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @Transform(({ value }) =>
    value === undefined ? undefined : Number.parseInt(String(value), 10),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @Transform(({ value }) =>
    value === undefined ? undefined : Number.parseInt(String(value), 10),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
