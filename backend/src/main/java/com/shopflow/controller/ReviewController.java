package com.shopflow.controller;

import com.shopflow.dto.ReviewRequest;
import com.shopflow.dto.ReviewResponse;
import com.shopflow.service.ReviewService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ReviewResponse create(@RequestParam Long productId, @RequestBody ReviewRequest review) {
        return reviewService.create(productId, review);
    }

    @GetMapping("/product/{productId}")
    public List<ReviewResponse> byProduct(@PathVariable Long productId) {
        return reviewService.getByProduct(productId);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ReviewResponse approve(@PathVariable Long id) {
        return reviewService.approve(id);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public java.util.List<ReviewResponse> getAll() {
        return reviewService.getAll();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        reviewService.delete(id);
    }
}
