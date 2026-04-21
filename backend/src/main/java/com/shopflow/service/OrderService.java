package com.shopflow.service;

import com.shopflow.model.Order;
import com.shopflow.model.Product;
import com.shopflow.model.User;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    public Order create(Long productId, int quantity) {

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (quantity <= 0) {
            throw new RuntimeException("Invalid quantity");
        }
        if (product.getQuantity() < quantity) {
            throw new RuntimeException("Not enough stock");
        }

        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);

        Order order = new Order();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(quantity);
        order.setTotalPrice(product.getPrice() * quantity);

        return orderRepository.save(order);
    }
    public java.util.List<Order> getMyOrders() {

        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User user = (User) auth.getPrincipal();

        return orderRepository.findByUserId(user.getId());
    }
}