package com.shopflow.dto;

import lombok.Data;

@Data
public class SellerProfileResponse {
    private Long id;
    private Long sellerId;
    private String sellerEmail;
    private String sellerFirstName;
    private String sellerLastName;
    private String storeName;
    private String description;
    private String logoUrl;
}
