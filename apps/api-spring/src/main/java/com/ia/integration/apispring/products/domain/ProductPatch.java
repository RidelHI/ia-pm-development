package com.ia.integration.apispring.products.domain;

public record ProductPatch(
    String sku,
    String barcode,
    String name,
    String category,
    String brand,
    Integer quantity,
    Integer minimumStock,
    Integer unitPriceCents,
    String imageUrl,
    String status,
    String location,
    String notes) {

  public boolean hasAnyValue() {
    return sku != null
        || barcode != null
        || name != null
        || category != null
        || brand != null
        || quantity != null
        || minimumStock != null
        || unitPriceCents != null
        || imageUrl != null
        || status != null
        || location != null
        || notes != null;
  }
}
