import { ApiProperty } from '@nestjs/swagger';
import type { PaginatedResult, Product } from '../product.types';
import { ProductResponseDto } from './product-response.dto';

class PaginationMetaResponseDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 3 })
  totalPages!: number;
}

export class PaginatedProductsResponseDto {
  @ApiProperty({ type: ProductResponseDto, isArray: true })
  data!: ProductResponseDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta!: PaginationMetaResponseDto;

  static fromDomain(
    paginated: PaginatedResult<Product>,
  ): PaginatedProductsResponseDto {
    return {
      data: ProductResponseDto.fromDomainList(paginated.data),
      meta: paginated.meta,
    };
  }
}
