package com.shopflow.dto;

import lombok.Data;

@Data
public class ProductRequest {
    private String name;
    private String description;
    private String imageUrl;
    private java.util.List<Long> categoryIds;
    private double price;
    private Double prixPromo;
    private int quantity;
    private Boolean active = true;
}
