package com.shopflow.repository;

import com.shopflow.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    @Query("select coalesce(sum(o.totalPrice),0) from Order o where o.status <> com.shopflow.model.OrderStatus.CANCELLED")
    Double totalRevenue();

    @Query("select o.product.id as productId, sum(o.quantity) as qty from Order o group by o.product.id order by qty desc")
    List<Object[]> topSellingProducts();
}