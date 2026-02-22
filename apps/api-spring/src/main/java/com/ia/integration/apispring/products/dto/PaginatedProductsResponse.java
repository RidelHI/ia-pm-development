package com.ia.integration.apispring.products.dto;

import com.ia.integration.apispring.products.domain.PaginatedResult;
import com.ia.integration.apispring.products.domain.Product;
import java.util.List;

public record PaginatedProductsResponse(List<ProductResponse> data, PaginationMetaResponse meta) {

  public static PaginatedProductsResponse fromDomain(PaginatedResult<Product> paginated) {
    final var mappedData = paginated.data().stream().map(ProductResponse::fromDomain).toList();
    return new PaginatedProductsResponse(mappedData, PaginationMetaResponse.fromDomain(paginated.meta()));
  }
}
