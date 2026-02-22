package com.ia.integration.apispring.products.repository;

import com.ia.integration.apispring.products.domain.PaginatedResult;
import com.ia.integration.apispring.products.domain.Product;
import com.ia.integration.apispring.products.domain.ProductFilters;
import com.ia.integration.apispring.products.domain.ProductPatch;
import java.util.Optional;

public interface ProductRepository {

  PaginatedResult<Product> findAll(ProductFilters filters);

  Optional<Product> findById(String id);

  Product create(Product product);

  Optional<Product> update(String id, ProductPatch patch);

  boolean remove(String id);
}
