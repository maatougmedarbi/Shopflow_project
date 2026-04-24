package com.shopflow.controller;

import com.shopflow.model.Cart;
import com.shopflow.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public Cart getCart() {
        return cartService.getCurrentCart();
    }

    @PostMapping("/items")
    public Cart addItem(@RequestParam Long productId, @RequestParam int quantity) {
        return cartService.addItem(productId, quantity);
    }

    @PutMapping("/items/{itemId}")
    public Cart updateItem(@PathVariable Long itemId, @RequestParam int quantity) {
        return cartService.updateItem(itemId, quantity);
    }

    @DeleteMapping("/items/{itemId}")
    public Cart removeItem(@PathVariable Long itemId) {
        return cartService.removeItem(itemId);
    }

    @PostMapping("/coupon")
    public Cart applyCoupon(@RequestParam String code) {
        return cartService.applyCoupon(code);
    }

    @DeleteMapping("/coupon")
    public Cart removeCoupon() {
        return cartService.removeCoupon();
    }
}
