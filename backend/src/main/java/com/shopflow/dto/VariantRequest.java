package com.shopflow.dto;

import lombok.Data;

@Data
public class VariantRequest {
    private String size;
    private String color;
    private int stockQuantity;
}
