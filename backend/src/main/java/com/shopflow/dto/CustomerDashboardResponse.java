package com.shopflow.dto;

import lombok.Data;
import java.util.List;

@Data
public class CustomerDashboardResponse {
    private double totalSpent;
    private int totalOrders;
    private List<OrderResponse> ordersInProgress;
    private List<ReviewResponse> recentReviews;
}
