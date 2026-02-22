package com.ia.integration.apispring.products.dto;

import com.ia.integration.apispring.products.domain.Product;

public record ProductResponse(
    String id,
    String sku,
    String barcode,
    String name,
    String category,
    String brand,
    int quantity,
    Integer minimumStock,
    int unitPriceCents,
    String imageUrl,
    String status,
    String location,
    String notes,
    String createdAt,
    String updatedAt) {

  public static ProductResponse fromDomain(Product product) {
    return new ProductResponse(
        product.id(),
        product.sku(),
        product.barcode(),
        product.name(),
        product.category(),
        product.brand(),
        product.quantity(),
        product.minimumStock(),
        product.unitPriceCents(),
        product.imageUrl(),
        product.status(),
        product.location(),
        product.notes(),
        product.createdAt(),
        product.updatedAt());
  }
}
