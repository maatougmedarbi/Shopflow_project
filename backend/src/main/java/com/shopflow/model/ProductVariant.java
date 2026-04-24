package com.shopflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "product_variants")
@Getter
@Setter
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Product product;

    /** e.g. "S", "M", "L", "XL" — nullable if the product has no size dimension */
    private String size;

    /** e.g. "Red", "Blue" — nullable if the product has no color dimension */
    private String color;

    /** Independent stock per variant combination */
    private int stockQuantity;
}
