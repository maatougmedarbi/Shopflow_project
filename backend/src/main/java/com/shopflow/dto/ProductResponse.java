package com.shopflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private double price;
    private Double prixPromo;
    private int quantity;
    private Boolean active;
    private List<Long> categoryIds;
    private String categoryNames;
    private Long sellerId;
    private String sellerStoreName;
    private double averageRating;
    private int reviewCount;
    private List<VariantResponse> variants;
}
