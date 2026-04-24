package com.shopflow.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PaymentResponse {
    private Long orderId;
    private String orderNumber;
    private String status;
    private String method;
    private LocalDateTime paidAt;
    private double totalPrice;
}
