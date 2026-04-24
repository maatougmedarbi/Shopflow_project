package com.shopflow.dto;

import lombok.Data;

@Data
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private String productImageUrl;
    private int quantity;
    private double unitPrice;
    private double lineTotal;
}
