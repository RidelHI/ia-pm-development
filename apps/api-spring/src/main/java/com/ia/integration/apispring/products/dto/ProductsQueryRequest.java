package com.ia.integration.apispring.products.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ProductsQueryRequest {

  @Size(max = 120)
  private String q;

  @Size(max = 64)
  private String sku;

  @Size(max = 64)
  private String barcode;

  @Size(max = 120)
  private String name;

  @Size(max = 80)
  private String category;

  @Size(max = 80)
  private String brand;

  @Size(max = 64)
  private String location;

  @Pattern(
      regexp = "(?i)active|inactive",
      message = "status must be one of: active, inactive")
  private String status;

  @Min(0)
  private Integer quantityMin;

  @Min(0)
  private Integer quantityMax;

  @Min(0)
  private Integer minimumStockMin;

  @Min(0)
  private Integer minimumStockMax;

  @Min(0)
  private Integer unitPriceMin;

  @Min(0)
  private Integer unitPriceMax;

  @Min(1)
  private Integer page;

  @Min(1)
  @Max(100)
  private Integer limit;

  public String getQ() {
    return q;
  }

  public void setQ(String q) {
    this.q = q;
  }

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

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public Integer getQuantityMin() {
    return quantityMin;
  }

  public void setQuantityMin(Integer quantityMin) {
    this.quantityMin = quantityMin;
  }

  public Integer getQuantityMax() {
    return quantityMax;
  }

  public void setQuantityMax(Integer quantityMax) {
    this.quantityMax = quantityMax;
  }

  public Integer getMinimumStockMin() {
    return minimumStockMin;
  }

  public void setMinimumStockMin(Integer minimumStockMin) {
    this.minimumStockMin = minimumStockMin;
  }

  public Integer getMinimumStockMax() {
    return minimumStockMax;
  }

  public void setMinimumStockMax(Integer minimumStockMax) {
    this.minimumStockMax = minimumStockMax;
  }

  public Integer getUnitPriceMin() {
    return unitPriceMin;
  }

  public void setUnitPriceMin(Integer unitPriceMin) {
    this.unitPriceMin = unitPriceMin;
  }

  public Integer getUnitPriceMax() {
    return unitPriceMax;
  }

  public void setUnitPriceMax(Integer unitPriceMax) {
    this.unitPriceMax = unitPriceMax;
  }

  public Integer getPage() {
    return page;
  }

  public void setPage(Integer page) {
    this.page = page;
  }

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }
}
