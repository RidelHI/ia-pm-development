package com.ia.integration.apispring.products.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UpdateProductRequest {

  @Size(min = 3, max = 64)
  private String sku;

  @Size(min = 3, max = 64)
  private String barcode;

  @Size(min = 3, max = 120)
  private String name;

  @Size(max = 80)
  private String category;

  @Size(max = 80)
  private String brand;

  @Min(0)
  private Integer quantity;

  @Min(0)
  private Integer minimumStock;

  @Min(0)
  private Integer unitPriceCents;

  @Size(max = 8_000_000)
  @Pattern(
      regexp = "^(https?://|data:image/).*",
      flags = Pattern.Flag.CASE_INSENSITIVE,
      message = "imageUrl must start with http(s):// or data:image/")
  private String imageUrl;

  @Pattern(
      regexp = "(?i)active|inactive",
      message = "status must be one of: active, inactive")
  private String status;

  @Size(max = 64)
  private String location;

  @Size(max = 500)
  private String notes;

  public String getSku() {
    return sku;
  }

  public void setSku(String sku) {
    this.sku = sku;
  }

  public String getBarcode() {
    return barcode;
  }

  public void setBarcode(String barcode) {
    this.barcode = barcode;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }

  public String getBrand() {
    return brand;
  }

  public void setBrand(String brand) {
    this.brand = brand;
  }

  public Integer getQuantity() {
    return quantity;
  }

  public void setQuantity(Integer quantity) {
    this.quantity = quantity;
  }

  public Integer getMinimumStock() {
    return minimumStock;
  }

  public void setMinimumStock(Integer minimumStock) {
    this.minimumStock = minimumStock;
  }

  public Integer getUnitPriceCents() {
    return unitPriceCents;
  }

  public void setUnitPriceCents(Integer unitPriceCents) {
    this.unitPriceCents = unitPriceCents;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}
