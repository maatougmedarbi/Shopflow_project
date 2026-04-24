package com.shopflow.controller;

import com.shopflow.dto.ProductRequest;
import com.shopflow.dto.ProductResponse;
import com.shopflow.dto.VariantRequest;
import com.shopflow.dto.VariantResponse;
import com.shopflow.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ProductResponse create(@RequestBody ProductRequest request) {
        return productService.create(request);
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file)
            throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Image file is required"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed"));
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("message", "Image size must be 5MB or less"));
        }

        Path uploadDir = Paths.get("uploads", "products");
        Files.createDirectories(uploadDir);

        String original = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String extension = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) extension = original.substring(dot);

        String filename = UUID.randomUUID() + extension;
        Path destination = uploadDir.resolve(filename).normalize();
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        String imageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/products/")
                .path(filename)
                .toUriString();

        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", imageUrl);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public List<ProductResponse> getAll() {
        return productService.getAll();
    }

    @GetMapping("/paged")
    public Page<ProductResponse> getPaged(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Long sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "newest") String sortBy) {
        return productService.getPaged(q, categoryId, minPrice, maxPrice, sellerId, page, size, sortBy);
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/search")
    public List<ProductResponse> search(@RequestParam("q") String query) {
        return productService.search(query);
    }

    @GetMapping("/top-selling")
    public List<ProductResponse> topSelling() {
        return productService.topSelling();
    }

    @GetMapping("/seller/{sellerId}")
    public List<ProductResponse> getBySeller(@PathVariable Long sellerId) {
        return productService.getBySeller(sellerId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public ProductResponse update(@PathVariable Long id, @RequestBody ProductRequest request) {
        return productService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public void delete(@PathVariable Long id) {
        productService.delete(id);
    }

    // ── Variant sub-endpoints ────────────────────────────────────────────────

    @GetMapping("/{id}/variants")
    public List<VariantResponse> getVariants(@PathVariable Long id) {
        return productService.getVariants(id);
    }

    @PostMapping("/{id}/variants")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public List<VariantResponse> addVariant(@PathVariable Long id,
            @RequestBody VariantRequest request) {
        return productService.addVariant(id, request);
    }

    @PutMapping("/{id}/variants/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public List<VariantResponse> updateVariant(@PathVariable Long id,
            @PathVariable Long variantId,
            @RequestBody VariantRequest request) {
        return productService.updateVariant(id, variantId, request);
    }

    @DeleteMapping("/{id}/variants/{variantId}")
    @PreAuthorize("hasAnyRole('ADMIN','SELLER')")
    public void deleteVariant(@PathVariable Long id, @PathVariable Long variantId) {
        productService.deleteVariant(id, variantId);
    }
}