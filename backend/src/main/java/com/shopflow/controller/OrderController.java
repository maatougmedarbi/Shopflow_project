package com.shopflow.controller;

import com.shopflow.model.Order;
import com.shopflow.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public Order create(@RequestParam Long productId,
                        @RequestParam int quantity) {
        return orderService.create(productId, quantity);
    }
    @GetMapping
    public java.util.List<Order> getMyOrders() {
        return orderService.getMyOrders();
    }
}