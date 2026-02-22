package com.ia.integration.apispring.products.domain;

import com.ia.integration.apispring.products.dto.ProductsQueryRequest;

public record ProductFilters(
    String q,
    String sku,
    String barcode,
    String name,
    String category,
    String brand,
    String location,
    String status,
    Integer quantityMin,
    Integer quantityMax,
    Integer minimumStockMin,
    Integer minimumStockMax,
    Integer unitPriceMin,
    Integer unitPriceMax,
    int page,
    int limit) {

  private static final int DEFAULT_PAGE = 1;
  private static final int DEFAULT_LIMIT = 20;

  public static ProductFilters fromRequest(ProductsQueryRequest request) {
    return new ProductFilters(
        normalize(request.getQ()),
        normalize(request.getSku()),
        normalize(request.getBarcode()),
        normalize(request.getName()),
        normalize(request.getCategory()),
        normalize(request.getBrand()),
        normalize(request.getLocation()),
        normalizeStatus(request.getStatus()),
        request.getQuantityMin(),
        request.getQuantityMax(),
        request.getMinimumStockMin(),
        request.getMinimumStockMax(),
        request.getUnitPriceMin(),
        request.getUnitPriceMax(),
        request.getPage() == null ? DEFAULT_PAGE : Math.max(request.getPage(), 1),
        request.getLimit() == null ? DEFAULT_LIMIT : Math.max(request.getLimit(), 1));
  }

  private static String normalize(String raw) {
    if (raw == null) {
      return null;
    }

    final var trimmed = raw.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  private static String normalizeStatus(String raw) {
    final var normalized = normalize(raw);
    return normalized == null ? null : normalized.toLowerCase();
  }
}
