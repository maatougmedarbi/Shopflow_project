package com.shopflow.repository;

import com.shopflow.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("select p from Product p where p.active = true or p.active is null")
    List<Product> findAllActive();

    @Query("select p from Product p where p.id = :id and (p.active = true or p.active is null)")
    Optional<Product> findActiveById(@Param("id") Long id);

    @Query("""
            select p from Product p left join p.categories c
            where (p.active = true or p.active is null)
            and (
            	lower(p.name) like lower(concat('%', :query, '%'))
            	or lower(p.description) like lower(concat('%', :query, '%'))
                or lower(c.name) like lower(concat('%', :query, '%'))
            )
            """)
    List<Product> searchActive(@Param("query") String query);

    @Query("""
            select p from Product p left join p.categories c
            where (p.active = true or p.active is null)
                and (:categoryId is null or c.id = :categoryId)
                and (:minPrice is null or p.price >= :minPrice)
                and (:maxPrice is null or p.price <= :maxPrice)
                and (:sellerId is null or p.seller.id = :sellerId)
                and (:q is null or lower(p.name) like lower(concat('%', :q, '%'))
                                         or lower(p.description) like lower(concat('%', :q, '%'))
                                         or lower(c.name) like lower(concat('%', :q, '%')))
            """)
    Page<Product> findActiveWithFilters(@Param("q") String q,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("sellerId") Long sellerId,
            Pageable pageable);

    List<Product> findByIdIn(List<Long> ids);

    @Query("select p from Product p where p.seller.id = :sellerId and (p.active = true or p.active is null)")
    List<Product> findBySellerId(@Param("sellerId") Long sellerId);
}