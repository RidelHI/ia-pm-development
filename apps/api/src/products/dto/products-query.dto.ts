import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PRODUCT_STATUSES, type ProductStatus } from '../product.types';
import { trimOptionalString } from './transforms';

function parseOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.parseInt(value.toString(), 10);
  }

  if (typeof value !== 'string') {
    return Number.NaN;
  }

  return Number.parseInt(value, 10);
}

function IsGreaterThanOrEqualField(
  fieldName: string,
  validationOptions?: ValidationOptions,
) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isGreaterThanOrEqualField',
      target: object.constructor,
      propertyName,
      constraints: [fieldName],
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (value === undefined) {
            return true;
          }

          const constraints = args.constraints as unknown[];
          const relatedFieldName = constraints[0];

          if (typeof relatedFieldName !== 'string') {
            return false;
          }

          const object = args.object as Record<string, unknown>;
          const relatedValue = object[relatedFieldName];

          if (relatedValue === undefined) {
            return true;
          }

          if (typeof value !== 'number' || typeof relatedValue !== 'number') {
            return false;
          }

          return value >= relatedValue;
        },
      },
    });
  };
}

export class ProductsQueryDto {
  @ApiPropertyOptional({ maxLength: 120, example: 'apple' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({ maxLength: 64, example: 'SKU-APPLE-001' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sku?: string;

  @ApiPropertyOptional({ maxLength: 120, example: 'Apple Box' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ maxLength: 64, example: 'A-01' })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(64)
  location?: string;

  @ApiPropertyOptional({ enum: PRODUCT_STATUSES, example: 'active' })
  @IsOptional()
  @IsIn(PRODUCT_STATUSES)
  status?: ProductStatus;

  @ApiPropertyOptional({ minimum: 0, example: 1 })
  @Transform(({ value }) => parseOptionalInt(value))
  @IsOptional()
  @IsInt()
  @Min(0)
  quantityMin?: number;

  @ApiPropertyOptional({ minimum: 0, example: 100 })
  @Transform(({ value }) => parseOptionalInt(value))
  @IsOptional()
  @IsInt()
  @Min(0)
  @IsGreaterThanOrEqualField('quantityMin', {
    message: 'quantityMax must be greater than or equal to quantityMin',
  })
  quantityMax?: number;

  @ApiPropertyOptional({ minimum: 0, example: 100 })
  @Transform(({ value }) => parseOptionalInt(value))
  @IsOptional()
  @IsInt()
  @Min(0)
  unitPriceMin?: number;

  @ApiPropertyOptional({ minimum: 0, example: 5000 })
  @Transform(({ value }) => parseOptionalInt(value))
  @IsOptional()
  @IsInt()
  @Min(0)
  @IsGreaterThanOrEqualField('unitPriceMin', {
    message: 'unitPriceMax must be greater than or equal to unitPriceMin',
  })
  unitPriceMax?: number;

  @ApiPropertyOptional({ minimum: 1, example: 1 })
  @Transform(({ value }) => parseOptionalInt(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, example: 20 })
  @Transform(({ value }) => parseOptionalInt(value))
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
