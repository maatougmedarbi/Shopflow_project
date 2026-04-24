package com.shopflow.service;

import com.shopflow.dto.OrderItemResponse;
import com.shopflow.dto.OrderResponse;
import com.shopflow.dto.PaymentRequest;
import com.shopflow.dto.PaymentResponse;
import com.shopflow.model.Cart;
import com.shopflow.model.CartItem;
import com.shopflow.model.Address;
import com.shopflow.model.Order;
import com.shopflow.model.OrderItem;
import com.shopflow.model.OrderStatus;
import com.shopflow.model.Product;
import com.shopflow.model.User;
import com.shopflow.repository.CartRepository;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final CartRepository cartRepository;
    private final AddressService addressService;

    public OrderService(OrderRepository orderRepository,
            ProductRepository productRepository,
            CartRepository cartRepository,
            AddressService addressService) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.addressService = addressService;
    }

    @Transactional
    public OrderResponse create(Long productId, int quantity, Long addressId) {
        User user = getCurrentUser();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (quantity <= 0) throw new RuntimeException("Invalid quantity");
        if (product.getQuantity() < quantity) throw new RuntimeException("Not enough stock");

        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);

        Order order = new Order();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(quantity);
        order.setTotalPrice(product.getPrice() * quantity);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderNumber("ORD-" + LocalDateTime.now().getYear() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCreatedAt(LocalDateTime.now());
        Address shippingAddress = addressService.resolveShippingAddress(addressId);
        order.setShippingAddress(addressService.format(shippingAddress));

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setUnitPrice(product.getPrice());
        order.getItems().add(item);

        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse createFromCart(Long addressId) {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByCustomerId(user.getId())
                .orElseThrow(() -> new RuntimeException("Cart not found"));
        if (cart.getItems().isEmpty()) throw new RuntimeException("Cart is empty");

        double totalPrice = cart.getTotalTtc() > 0 ? cart.getTotalTtc() : 0;
        int totalQuantity = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException("Not enough stock for " + product.getName());
            }
            totalQuantity += item.getQuantity();
            if (totalPrice <= 0) totalPrice += product.getPrice() * item.getQuantity();
        }

        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(item.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            orderItems.add(orderItem);
        }

        CartItem firstItem = cart.getItems().get(0);
        Product product = firstItem.getProduct();

        Order order = new Order();
        order.setUser(user);
        order.setProduct(product);
        order.setQuantity(totalQuantity);
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderNumber("ORD-" + LocalDateTime.now().getYear() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setCreatedAt(LocalDateTime.now());
        Address shippingAddress = addressService.resolveShippingAddress(addressId);
        order.setShippingAddress(addressService.format(shippingAddress));

        for (OrderItem orderItem : orderItems) {
            orderItem.setOrder(order);
            order.getItems().add(orderItem);
        }

        Order saved = orderRepository.save(order);
        cart.getItems().clear();
        cart.setCoupon(null);
        cart.setSubTotal(0);
        cart.setShippingFee(0);
        cart.setTotalTtc(0);
        cartRepository.save(cart);
        return toResponse(saved);
    }

    public List<OrderResponse> getMyOrders() {
        User user = getCurrentUser();
        return orderRepository.findByUserId(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getById(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        boolean isAdmin = user.getRole() == com.shopflow.model.Role.ADMIN;
        if (!isAdmin && !order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not allowed to view this order");
        }
        order.setNew(false);
        return toResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse updateStatus(Long id, OrderStatus newStatus) {
        User user = getCurrentUser();
        if (user.getRole() != com.shopflow.model.Role.ADMIN
                && user.getRole() != com.shopflow.model.Role.SELLER) {
            throw new AccessDeniedException("Only seller/admin can update order status");
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(newStatus);
        order.setNew(true);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancel(Long id) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())
                && user.getRole() != com.shopflow.model.Role.ADMIN) {
            throw new AccessDeniedException("You are not allowed to cancel this order");
        }
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Only PENDING or PAID orders can be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            for (OrderItem item : order.getItems()) {
                Product p = item.getProduct();
                p.setQuantity(p.getQuantity() + item.getQuantity());
                productRepository.save(p);
            }
        } else {
            Product p = order.getProduct();
            p.setQuantity(p.getQuantity() + order.getQuantity());
            productRepository.save(p);
        }
        return toResponse(orderRepository.save(order));
    }

    /** Payment simulation: transitions PENDING → PAID and records payment method */
    @Transactional
    public PaymentResponse pay(Long orderId, PaymentRequest paymentRequest) {
        User user = getCurrentUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only pay for your own orders");
        }
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Only PENDING orders can be paid. Current status: " + order.getStatus());
        }

        String method = paymentRequest.getMethod();
        if (method == null || (!method.equalsIgnoreCase("CARD") && !method.equalsIgnoreCase("CASH"))) {
            throw new RuntimeException("Payment method must be CARD or CASH");
        }

        order.setStatus(OrderStatus.PAID);
        order.setNew(true);
        Order saved = orderRepository.save(order);

        PaymentResponse response = new PaymentResponse();
        response.setOrderId(saved.getId());
        response.setOrderNumber(saved.getOrderNumber());
        response.setStatus(saved.getStatus().name());
        response.setMethod(method.toUpperCase());
        response.setPaidAt(LocalDateTime.now());
        response.setTotalPrice(saved.getTotalPrice());
        return response;
    }

    // ── Mapping ──────────────────────────────────────────────────────────────

    public OrderResponse toResponse(Order o) {
        OrderResponse r = new OrderResponse();
        r.setId(o.getId());
        r.setOrderNumber(o.getOrderNumber());
        r.setStatus(o.getStatus() != null ? o.getStatus().name() : null);
        r.setTotalPrice(o.getTotalPrice());
        r.setShippingAddress(o.getShippingAddress());
        r.setNew(o.isNew());
        r.setCreatedAt(o.getCreatedAt());

        if (o.getUser() != null) {
            r.setCustomerId(o.getUser().getId());
            r.setCustomerName(o.getUser().getFirstName() + " " + o.getUser().getLastName());
            r.setCustomerEmail(o.getUser().getEmail());
        }

        List<OrderItemResponse> items = new ArrayList<>();
        if (o.getItems() != null) {
            for (OrderItem oi : o.getItems()) {
                OrderItemResponse ir = new OrderItemResponse();
                if (oi.getProduct() != null) {
                    ir.setProductId(oi.getProduct().getId());
                    ir.setProductName(oi.getProduct().getName());
                    ir.setProductImageUrl(oi.getProduct().getImageUrl());
                }
                ir.setQuantity(oi.getQuantity());
                ir.setUnitPrice(oi.getUnitPrice());
                ir.setLineTotal(oi.getUnitPrice() * oi.getQuantity());
                items.add(ir);
            }
        }
        // fallback to legacy single-product order
        if (items.isEmpty() && o.getProduct() != null) {
            OrderItemResponse ir = new OrderItemResponse();
            ir.setProductId(o.getProduct().getId());
            ir.setProductName(o.getProduct().getName());
            ir.setProductImageUrl(o.getProduct().getImageUrl());
            ir.setQuantity(o.getQuantity());
            ir.setUnitPrice(o.getTotalPrice() / Math.max(o.getQuantity(), 1));
            ir.setLineTotal(o.getTotalPrice());
            items.add(ir);
        }
        r.setItems(items);
        return r;
    }

    private User getCurrentUser() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}