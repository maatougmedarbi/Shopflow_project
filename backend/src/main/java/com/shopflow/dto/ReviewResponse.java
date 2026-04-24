package com.shopflow.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String customerName;
    private int rating;
    private String comment;
    private boolean approved;
    private LocalDateTime createdAt;
}
