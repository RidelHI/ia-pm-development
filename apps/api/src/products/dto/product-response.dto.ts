import { Expose, plainToInstance } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Product, ProductStatus } from '../product.types';

export class ProductResponseDto {
  @ApiProperty({ example: 'prod-001' })
  @Expose()
  id!: string;

  @ApiProperty({ example: 'SKU-APPLE-001' })
  @Expose()
  sku!: string;

  @ApiProperty({ example: 'Apple Box' })
  @Expose()
  name!: string;

  @ApiProperty({ example: 40 })
  @Expose()
  quantity!: number;

  @ApiProperty({ example: 599 })
  @Expose()
  unitPriceCents!: number;

  @ApiProperty({ example: 'active' })
  @Expose()
  status!: ProductStatus;

  @ApiPropertyOptional({ example: 'A-01' })
  @Expose()
  location?: string;

  @ApiProperty({ example: '2026-02-01T10:00:00.000Z' })
  @Expose()
  createdAt!: string;

  @ApiProperty({ example: '2026-02-01T10:00:00.000Z' })
  @Expose()
  updatedAt!: string;

  static fromDomain(product: Product): ProductResponseDto {
    return plainToInstance(ProductResponseDto, product, {
      excludeExtraneousValues: true,
    });
  }

  static fromDomainList(products: Product[]): ProductResponseDto[] {
    return products.map((product) => ProductResponseDto.fromDomain(product));
  }
}
