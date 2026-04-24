package com.shopflow.repository;

import com.shopflow.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("select count(oi) > 0 from OrderItem oi where oi.order.user.id = :userId and oi.product.id = :productId")
    boolean existsPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}