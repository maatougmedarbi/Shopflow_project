package com.shopflow.controller;

import com.shopflow.model.Product;
import com.shopflow.service.ProductService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Product create(@RequestBody Product product) {
        return productService.create(product);
    }

    @GetMapping
    public List<Product> getAll() {
        return productService.getAll();
    }
    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public Product update(@PathVariable Long id, @RequestBody Product product) {
        return productService.update(id, product);
    }
    @DeleteMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }
}