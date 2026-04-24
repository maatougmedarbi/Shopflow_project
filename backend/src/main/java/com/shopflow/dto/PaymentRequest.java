package com.shopflow.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    /** CARD or CASH */
    private String method;
    /** last 4 digits shown in confirmation (optional, only for CARD) */
    private String cardLastFour;
}
