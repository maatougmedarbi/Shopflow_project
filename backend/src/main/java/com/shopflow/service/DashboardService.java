package com.shopflow.service;

import com.shopflow.dto.CustomerDashboardResponse;
import com.shopflow.dto.OrderResponse;
import com.shopflow.dto.ReviewResponse;
import com.shopflow.model.Order;
import com.shopflow.model.OrderStatus;
import com.shopflow.model.Role;
import com.shopflow.model.User;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final OrderService orderService;
    private final ReviewService reviewService;
    private final ProductService productService;

    public DashboardService(OrderRepository orderRepository,
            ProductRepository productRepository,
            ReviewRepository reviewRepository,
            OrderService orderService,
            ReviewService reviewService,
            ProductService productService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.orderService = orderService;
        this.reviewService = reviewService;
        this.productService = productService;
    }

    public Map<String, Object> adminStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Order> orders = orderRepository.findAll();
        stats.put("totalRevenue", orderRepository.totalRevenue());
        stats.put("totalOrders", orders.size());
        stats.put("pendingOrders", orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count());
        stats.put("products", productRepository.count());
        
        // PDF Requirement: Top products
        stats.put("topProducts", productService.topSelling());
        
        // PDF Requirement: Recent orders
        stats.put("recentOrders", orders.stream()
                .sorted((a, b) -> b.getId().compareTo(a.getId()))
                .limit(5)
                .map(orderService::toResponse)
                .collect(Collectors.toList()));
        return stats;
    }

    public Map<String, Object> sellerStats() {
        User user = getCurrentUser();
        if (user.getRole() != Role.SELLER && user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Only seller/admin can access seller dashboard");
        }

        Map<String, Object> stats = new HashMap<>();
        List<Order> orders = orderRepository.findAll(); // Should ideally filter by seller products
        stats.put("receivedOrders", orders.size());
        stats.put("pendingOrders", orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count());
        stats.put("revenue", orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalPrice).sum());
        
        // PDF Requirement: Alertes de stock faible (e.g., < 5)
        stats.put("lowStockAlerts", productRepository.findBySellerId(user.getId()).stream()
                .filter(p -> p.getQuantity() <= 5 && (p.getActive() == null || p.getActive()))
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", p.getId());
                    m.put("name", p.getName());
                    m.put("quantity", p.getQuantity());
                    return m;
                })
                .collect(Collectors.toList()));
        
        return stats;
    }

    public CustomerDashboardResponse customerDashboard() {
        User user = getCurrentUser();

        // Active statuses that mean "in progress"
        Set<OrderStatus> inProgress = Set.of(
                OrderStatus.PENDING, OrderStatus.PAID,
                OrderStatus.PROCESSING, OrderStatus.SHIPPED);

        List<Order> allOrders = orderRepository.findByUserId(user.getId());

        List<OrderResponse> ordersInProgress = allOrders.stream()
                .filter(o -> inProgress.contains(o.getStatus()))
                .map(orderService::toResponse)
                .collect(Collectors.toList());

        double totalSpent = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToDouble(Order::getTotalPrice).sum();

        List<ReviewResponse> recentReviews = reviewService.getByCustomer(user.getId())
                .stream().limit(5).collect(Collectors.toList());

        CustomerDashboardResponse response = new CustomerDashboardResponse();
        response.setTotalSpent(totalSpent);
        response.setTotalOrders(allOrders.size());
        response.setOrdersInProgress(ordersInProgress);
        response.setRecentReviews(recentReviews);
        return response;
    }

    private User getCurrentUser() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
