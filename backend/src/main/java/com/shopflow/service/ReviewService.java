package com.shopflow.service;

import com.shopflow.dto.ReviewRequest;
import com.shopflow.dto.ReviewResponse;
import com.shopflow.model.Product;
import com.shopflow.model.Review;
import com.shopflow.model.User;
import com.shopflow.repository.OrderItemRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    public ReviewService(ReviewRepository reviewRepository,
            ProductRepository productRepository,
            OrderItemRepository orderItemRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public ReviewResponse create(Long productId, ReviewRequest payload) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        /* 
        if (!orderItemRepository.existsPurchasedProduct(user.getId(), product.getId())) {
            throw new RuntimeException("You can only review products you purchased");
        }
        */

        if (payload.getRating() < 1 || payload.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setCustomer(user);
        review.setRating(payload.getRating());
        review.setComment(payload.getComment());
        review.setApproved(false);

        return toResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getByProduct(Long productId) {
        return reviewRepository.findByProductIdAndApprovedTrue(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ReviewResponse approve(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setApproved(true);
        return toResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getByCustomer(Long customerId) {
        return reviewRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ReviewResponse> getAll() {
        return reviewRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public void delete(Long id) {
        reviewRepository.deleteById(id);
    }

    public ReviewResponse toResponse(Review r) {
        ReviewResponse res = new ReviewResponse();
        res.setId(r.getId());
        if (r.getProduct() != null) {
            res.setProductId(r.getProduct().getId());
            res.setProductName(r.getProduct().getName());
        }
        if (r.getCustomer() != null) {
            res.setCustomerName(r.getCustomer().getFirstName() + " " + r.getCustomer().getLastName());
        }
        res.setRating(r.getRating());
        res.setComment(r.getComment());
        res.setApproved(r.isApproved());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }

    private User getCurrentUser() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
