package com.shopflow.dto;

import lombok.Data;

@Data
public class SellerProfileRequest {
    private String storeName;
    private String description;
    private String logoUrl;
}
