package com.ia.integration.apispring.products.repository;

import com.ia.integration.apispring.products.domain.PaginatedResult;
import com.ia.integration.apispring.products.domain.PaginationMeta;
import com.ia.integration.apispring.products.domain.Product;
import com.ia.integration.apispring.products.domain.ProductFilters;
import com.ia.integration.apispring.products.domain.ProductPatch;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryProductRepository implements ProductRepository {

  private final Map<String, Product> products = new LinkedHashMap<>();

  public InMemoryProductRepository() {
    final var createdAt1 = Instant.parse("2026-02-01T10:00:00.000Z").toString();
    final var createdAt2 = Instant.parse("2026-02-02T10:00:00.000Z").toString();

    products.put(
        "prod-001",
        new Product(
            "prod-001",
            "SKU-APPLE-001",
            "7501001001001",
            "Apple Box",
            "Frutas",
            "Fresh Farm",
            40,
            12,
            599,
            "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a",
            "active",
            "A-01",
            "Producto de alta rotacion",
            createdAt1,
            createdAt1));

    products.put(
        "prod-002",
        new Product(
            "prod-002",
            "SKU-MILK-002",
            "7502002002002",
            "Milk Pack",
            "Lacteos",
            "Campo Azul",
            12,
            8,
            249,
            "https://images.unsplash.com/photo-1550583724-b2692b85b150",
            "active",
            "B-03",
            "Requiere refrigeracion",
            createdAt2,
            createdAt2));
  }

  @Override
  public PaginatedResult<Product> findAll(ProductFilters filters) {
    final var filtered = new ArrayList<Product>();

    for (final var product : products.values()) {
      if (!matches(product, filters)) {
        continue;
      }
      filtered.add(product);
    }

    final var total = filtered.size();
    final var page = filters.page();
    final var limit = filters.limit();
    final var offset = (page - 1) * limit;
    final var end = Math.min(offset + limit, total);
    final var data = offset >= total ? new ArrayList<Product>() : new ArrayList<>(filtered.subList(offset, end));
    final var totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / limit);

    return new PaginatedResult<>(
        data,
        new PaginationMeta(page, limit, total, totalPages));
  }

  @Override
  public Optional<Product> findById(String id) {
    return Optional.ofNullable(products.get(id));
  }

  @Override
  public Product create(Product product) {
    products.put(product.id(), product);
    return product;
  }

  @Override
  public Optional<Product> update(String id, ProductPatch patch) {
    final var current = products.get(id);

    if (current == null) {
      return Optional.empty();
    }

    final var updated = new Product(
        current.id(),
        patch.sku() == null ? current.sku() : patch.sku(),
        patch.barcode() == null ? current.barcode() : patch.barcode(),
        patch.name() == null ? current.name() : patch.name(),
        patch.category() == null ? current.category() : patch.category(),
        patch.brand() == null ? current.brand() : patch.brand(),
        patch.quantity() == null ? current.quantity() : patch.quantity(),
        patch.minimumStock() == null ? current.minimumStock() : patch.minimumStock(),
        patch.unitPriceCents() == null ? current.unitPriceCents() : patch.unitPriceCents(),
        patch.imageUrl() == null ? current.imageUrl() : patch.imageUrl(),
        patch.status() == null ? current.status() : patch.status(),
        patch.location() == null ? current.location() : patch.location(),
        patch.notes() == null ? current.notes() : patch.notes(),
        current.createdAt(),
        Instant.now().toString());

    products.put(id, updated);
    return Optional.of(updated);
  }

  @Override
  public boolean remove(String id) {
    return products.remove(id) != null;
  }

  private boolean matches(Product product, ProductFilters filters) {
    final var matchesStatus = matchesEquals(product.status(), filters.status());
    final var matchesQuery =
        matchesContains(product.name(), filters.q())
            || matchesContains(product.sku(), filters.q())
            || matchesContains(product.barcode(), filters.q())
            || matchesContains(product.category(), filters.q())
            || matchesContains(product.brand(), filters.q())
            || filters.q() == null;

    final var matchesSku = matchesContains(product.sku(), filters.sku()) || filters.sku() == null;
    final var matchesBarcode = matchesContains(product.barcode(), filters.barcode()) || filters.barcode() == null;
    final var matchesName = matchesContains(product.name(), filters.name()) || filters.name() == null;
    final var matchesCategory =
        matchesContains(product.category(), filters.category()) || filters.category() == null;
    final var matchesBrand = matchesContains(product.brand(), filters.brand()) || filters.brand() == null;
    final var matchesLocation =
        matchesContains(product.location(), filters.location()) || filters.location() == null;

    final var matchesQuantityMin =
        filters.quantityMin() == null || product.quantity() >= filters.quantityMin();
    final var matchesQuantityMax =
        filters.quantityMax() == null || product.quantity() <= filters.quantityMax();
    final var matchesPriceMin =
        filters.unitPriceMin() == null || product.unitPriceCents() >= filters.unitPriceMin();
    final var matchesPriceMax =
        filters.unitPriceMax() == null || product.unitPriceCents() <= filters.unitPriceMax();

    final var minimumStock = product.minimumStock() == null ? 0 : product.minimumStock();
    final var matchesMinimumStockMin =
        filters.minimumStockMin() == null || minimumStock >= filters.minimumStockMin();
    final var matchesMinimumStockMax =
        filters.minimumStockMax() == null || minimumStock <= filters.minimumStockMax();

    return matchesStatus
        && matchesQuery
        && matchesSku
        && matchesBarcode
        && matchesName
        && matchesCategory
        && matchesBrand
        && matchesLocation
        && matchesQuantityMin
        && matchesQuantityMax
        && matchesPriceMin
        && matchesPriceMax
        && matchesMinimumStockMin
        && matchesMinimumStockMax;
  }

  private boolean matchesContains(String source, String input) {
    if (input == null) {
      return true;
    }

    if (source == null) {
      return false;
    }

    return source.toLowerCase().contains(input.toLowerCase());
  }

  private boolean matchesEquals(String source, String input) {
    if (input == null) {
      return true;
    }

    if (source == null) {
      return false;
    }

    return source.equalsIgnoreCase(input);
  }
}
