package com.shopflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    private CouponType type = CouponType.PERCENT;

    @Column(name = "coupon_value")
    private double value;
    private LocalDateTime expiryDate;
    private Integer usagesMax = 100;
    private Integer usagesCurrent = 0;
    private boolean active = true;
}
