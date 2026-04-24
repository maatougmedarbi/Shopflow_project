package com.shopflow.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private String status;
    private double totalPrice;
    private String shippingAddress;
    private boolean isNew;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    // customer info (for admin/seller view)
    private Long customerId;
    private String customerName;
    private String customerEmail;
}
