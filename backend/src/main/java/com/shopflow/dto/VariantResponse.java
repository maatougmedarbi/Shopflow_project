package com.shopflow.dto;

import lombok.Data;

@Data
public class VariantResponse {
    private Long id;
    private String size;
    private String color;
    private int stockQuantity;
}
