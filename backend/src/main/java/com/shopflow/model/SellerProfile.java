package com.shopflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "seller_profiles")
@Getter
@Setter
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", unique = true, nullable = false)
    private User seller;

    @Column(nullable = false)
    private String storeName = "My Store";

    @Column(length = 2000)
    private String description;

    private String logoUrl;
}
