package com.ia.integration.apispring.products.domain;

import java.util.List;

public record PaginatedResult<T>(List<T> data, PaginationMeta meta) {
}
