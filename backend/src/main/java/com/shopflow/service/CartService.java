package com.shopflow.service;

import com.shopflow.model.*;
import com.shopflow.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
            ProductRepository productRepository, CouponRepository couponRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
    }

    public Cart getCurrentCart() {
        User user = getCurrentUser();
        Cart cart = cartRepository.findByCustomerId(user.getId()).orElseGet(() -> {
            Cart c = new Cart();
            c.setCustomer(user);
            return cartRepository.save(c);
        });
        recalculate(cart);
        return cartRepository.save(cart);
    }

    public Cart addItem(Long productId, int quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Cart cart = getCurrentCart();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getId().equals(productId))
                .findFirst()
                .orElse(null);

        int newQty = quantity;
        if (item != null) {
            newQty = item.getQuantity() + quantity;
        }
        if (product.getQuantity() < newQty) {
            throw new RuntimeException("Not enough stock");
        }

        if (item == null) {
            item = new CartItem();
            item.setCart(cart);
            item.setProduct(product);
            item.setQuantity(quantity);
            cart.getItems().add(item);
        } else {
            item.setQuantity(newQty);
        }

        recalculate(cart);
        return cartRepository.save(cart);
    }

    public Cart updateItem(Long itemId, int quantity) {
        if (quantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        Cart cart = getCurrentCart();
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (item.getProduct().getQuantity() < quantity) {
            throw new RuntimeException("Not enough stock");
        }

        item.setQuantity(quantity);
        recalculate(cart);
        return cartRepository.save(cart);
    }

    public Cart removeItem(Long itemId) {
        Cart cart = getCurrentCart();
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        cartItemRepository.deleteById(itemId);
        recalculate(cart);
        return cartRepository.save(cart);
    }

    public Cart applyCoupon(String code) {
        Cart cart = getCurrentCart();
        Coupon coupon = couponRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));

        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is inactive");
        }
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon expired");
        }
        if (coupon.getUsagesMax() != null && coupon.getUsagesCurrent() != null
                && coupon.getUsagesCurrent() >= coupon.getUsagesMax()) {
            throw new RuntimeException("Coupon usage limit reached");
        }

        cart.setCoupon(coupon);
        recalculate(cart);
        return cartRepository.save(cart);
    }

    public Cart removeCoupon() {
        Cart cart = getCurrentCart();
        cart.setCoupon(null);
        recalculate(cart);
        return cartRepository.save(cart);
    }

    public void recalculate(Cart cart) {
        double subTotal = cart.getItems().stream()
                .mapToDouble(i -> i.getProduct().getPrice() * i.getQuantity())
                .sum();

        double discount = 0;
        Coupon coupon = cart.getCoupon();
        if (coupon != null && coupon.isActive()) {
            if (coupon.getType() == CouponType.PERCENT) {
                discount = subTotal * (coupon.getValue() / 100.0);
            } else {
                discount = coupon.getValue();
            }
            if (discount > subTotal) {
                discount = subTotal;
            }
        }

        double shipping = subTotal >= 100 ? 0 : 7;
        cart.setSubTotal(subTotal);
        cart.setShippingFee(shipping);
        cart.setTotalTtc(subTotal - discount + shipping);
        cart.setUpdatedAt(LocalDateTime.now());
    }

    private User getCurrentUser() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
