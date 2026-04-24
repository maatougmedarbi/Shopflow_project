package com.shopflow.controller;

import com.shopflow.dto.OrderResponse;
import com.shopflow.dto.PaymentRequest;
import com.shopflow.dto.PaymentResponse;
import com.shopflow.model.OrderStatus;
import com.shopflow.service.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderResponse create(@RequestParam(required = false) Long productId,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) Long addressId) {
        if (productId == null || quantity == null) {
            return orderService.createFromCart(addressId);
        }
        return orderService.create(productId, quantity, addressId);
    }

    @GetMapping("/my")
    public List<OrderResponse> getMyOrders() {
        return orderService.getMyOrders();
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderResponse> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @PutMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }

    @PutMapping("/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id) {
        return orderService.cancel(id);
    }

    /** Payment simulation — transitions PENDING → PAID */
    @PostMapping("/{id}/pay")
    public PaymentResponse pay(@PathVariable Long id, @RequestBody PaymentRequest request) {
        return orderService.pay(id, request);
    }
}