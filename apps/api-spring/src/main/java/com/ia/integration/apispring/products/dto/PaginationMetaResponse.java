package com.ia.integration.apispring.products.dto;

import com.ia.integration.apispring.products.domain.PaginationMeta;

public record PaginationMetaResponse(int page, int limit, int total, int totalPages) {

  public static PaginationMetaResponse fromDomain(PaginationMeta meta) {
    return new PaginationMetaResponse(meta.page(), meta.limit(), meta.total(), meta.totalPages());
  }
}
