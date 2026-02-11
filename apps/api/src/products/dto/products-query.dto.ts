import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
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
}
