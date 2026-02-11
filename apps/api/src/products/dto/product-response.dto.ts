import { Expose, plainToInstance } from 'class-transformer';
import type { Product, ProductStatus } from '../product.types';

export class ProductResponseDto {
  @Expose()
  id!: string;

  @Expose()
  sku!: string;

  @Expose()
  name!: string;

  @Expose()
  quantity!: number;

  @Expose()
  unitPriceCents!: number;

  @Expose()
  status!: ProductStatus;

  @Expose()
  location?: string;

  @Expose()
  createdAt!: string;

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
