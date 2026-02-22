package com.ia.integration.apispring.products;

import com.ia.integration.apispring.products.domain.PaginatedResult;
import com.ia.integration.apispring.products.domain.Product;
import com.ia.integration.apispring.products.domain.ProductFilters;
import com.ia.integration.apispring.products.domain.ProductPatch;
import com.ia.integration.apispring.products.dto.CreateProductRequest;
import com.ia.integration.apispring.products.dto.ProductsQueryRequest;
import com.ia.integration.apispring.products.dto.UpdateProductRequest;
import com.ia.integration.apispring.products.repository.ProductRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProductsService {

  private final ProductRepository repository;

  public ProductsService(ProductRepository repository) {
    this.repository = repository;
  }

  public PaginatedResult<Product> findAll(ProductsQueryRequest request) {
    validateRange(
        request.getQuantityMin(),
        request.getQuantityMax(),
        "quantityMax must be greater than or equal to quantityMin");
    validateRange(
        request.getMinimumStockMin(),
        request.getMinimumStockMax(),
        "minimumStockMax must be greater than or equal to minimumStockMin");
    validateRange(
        request.getUnitPriceMin(),
        request.getUnitPriceMax(),
        "unitPriceMax must be greater than or equal to unitPriceMin");

    final var filters = ProductFilters.fromRequest(request);
    return repository.findAll(filters);
  }

  public Product findOne(String id) {
    final var normalizedId = id == null ? "" : id.trim();
    return repository
        .findById(normalizedId)
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Product " + normalizedId + " not found"));
  }

  public Product create(CreateProductRequest input) {
    final var now = Instant.now().toString();
    final var status = normalizeStatus(input.getStatus());

    final var created = new Product(
        UUID.randomUUID().toString(),
        normalizeRequired(input.getSku()),
        normalizeOptional(input.getBarcode()),
        normalizeRequired(input.getName()),
        normalizeOptional(input.getCategory()),
        normalizeOptional(input.getBrand()),
        requiredInteger(input.getQuantity(), "quantity is required"),
        input.getMinimumStock(),
        requiredInteger(input.getUnitPriceCents(), "unitPriceCents is required"),
        normalizeOptional(input.getImageUrl()),
        status == null ? "active" : status,
        normalizeOptional(input.getLocation()),
        normalizeOptional(input.getNotes()),
        now,
        now);

    return repository.create(created);
  }

  public Product update(String id, UpdateProductRequest input) {
    final var normalizedId = id == null ? "" : id.trim();
    final var patch = new ProductPatch(
        normalizeOptional(input.getSku()),
        normalizeOptional(input.getBarcode()),
        normalizeOptional(input.getName()),
        normalizeOptional(input.getCategory()),
        normalizeOptional(input.getBrand()),
        input.getQuantity(),
        input.getMinimumStock(),
        input.getUnitPriceCents(),
        normalizeOptional(input.getImageUrl()),
        normalizeStatus(input.getStatus()),
        normalizeOptional(input.getLocation()),
        normalizeOptional(input.getNotes()));

    if (!patch.hasAnyValue()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one field is required");
    }

    return repository
        .update(normalizedId, patch)
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Product " + normalizedId + " not found"));
  }

  public void remove(String id) {
    final var normalizedId = id == null ? "" : id.trim();
    final var deleted = repository.remove(normalizedId);

    if (!deleted) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product " + normalizedId + " not found");
    }
  }

  private void validateRange(Integer min, Integer max, String message) {
    if (min != null && max != null && max < min) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
  }

  private String normalizeRequired(String raw) {
    return raw == null ? null : raw.trim();
  }

  private String normalizeOptional(String raw) {
    if (raw == null) {
      return null;
    }

    final var trimmed = raw.trim();
    return trimmed.isEmpty() ? null : trimmed;
  }

  private String normalizeStatus(String raw) {
    final var normalized = normalizeOptional(raw);
    return normalized == null ? null : normalized.toLowerCase();
  }

  private int requiredInteger(Integer value, String message) {
    if (value == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
    return value;
  }
}
