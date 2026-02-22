package com.ia.integration.apispring.products.domain;

public record PaginationMeta(int page, int limit, int total, int totalPages) {
}
