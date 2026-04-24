package com.shopflow.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User customer;

    @ManyToOne
    private Product product;

    private int rating;

    @Column(length = 1000)
    private String comment;

    private boolean approved = false;
    private LocalDateTime createdAt = LocalDateTime.now();
}
