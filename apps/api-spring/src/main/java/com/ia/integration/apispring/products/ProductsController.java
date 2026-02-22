package com.ia.integration.apispring.products;

import com.ia.integration.apispring.products.dto.PaginatedProductsResponse;
import com.ia.integration.apispring.products.dto.CreateProductRequest;
import com.ia.integration.apispring.products.dto.ProductResponse;
import com.ia.integration.apispring.products.dto.ProductsQueryRequest;
import com.ia.integration.apispring.products.dto.UpdateProductRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/products")
public class ProductsController {

  private final ProductsService service;

  public ProductsController(ProductsService service) {
    this.service = service;
  }

  @GetMapping
  public PaginatedProductsResponse findAll(@Valid @ModelAttribute ProductsQueryRequest filters) {
    return PaginatedProductsResponse.fromDomain(service.findAll(filters));
  }

  @GetMapping("/{id}")
  public ProductResponse findOne(@PathVariable @NotBlank String id) {
    return ProductResponse.fromDomain(service.findOne(id));
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public ProductResponse create(@Valid @RequestBody CreateProductRequest input) {
    return ProductResponse.fromDomain(service.create(input));
  }

  @PatchMapping("/{id}")
  public ProductResponse update(
      @PathVariable @NotBlank String id,
      @Valid @RequestBody UpdateProductRequest input) {
    return ProductResponse.fromDomain(service.update(id, input));
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void remove(@PathVariable @NotBlank String id) {
    service.remove(id);
  }
}
