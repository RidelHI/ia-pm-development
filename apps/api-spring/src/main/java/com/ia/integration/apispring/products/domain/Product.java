package com.ia.integration.apispring.products.domain;

public record Product(
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
}
