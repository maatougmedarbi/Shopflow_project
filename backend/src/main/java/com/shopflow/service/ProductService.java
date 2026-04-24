package com.shopflow.service;

import com.shopflow.dto.ProductRequest;
import com.shopflow.dto.ProductResponse;
import com.shopflow.dto.VariantRequest;
import com.shopflow.dto.VariantResponse;
import com.shopflow.model.Category;
import com.shopflow.model.Product;
import com.shopflow.model.ProductVariant;
import com.shopflow.model.Role;
import com.shopflow.model.SellerProfile;
import com.shopflow.model.User;
import com.shopflow.repository.CategoryRepository;
import com.shopflow.repository.OrderRepository;
import com.shopflow.repository.ProductRepository;
import com.shopflow.repository.ProductVariantRepository;
import com.shopflow.repository.ReviewRepository;
import com.shopflow.repository.SellerProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository variantRepository;
    private final ReviewRepository reviewRepository;
    private final SellerProfileRepository sellerProfileRepository;

    public ProductService(ProductRepository productRepository,
            OrderRepository orderRepository,
            CategoryRepository categoryRepository,
            ProductVariantRepository variantRepository,
            ReviewRepository reviewRepository,
            SellerProfileRepository sellerProfileRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.categoryRepository = categoryRepository;
        this.variantRepository = variantRepository;
        this.reviewRepository = reviewRepository;
        this.sellerProfileRepository = sellerProfileRepository;
    }

    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        if (product.getActive() == null) product.setActive(true);

        // Assign seller from security context
        User currentUser = getCurrentUser();
        if (currentUser != null && currentUser.getRole() == Role.SELLER) {
            product.setSeller(currentUser);
        }

        return toResponse(productRepository.save(product));
    }

    public List<ProductResponse> getAll() {
        return productRepository.findAllActive()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductResponse getById(Long id) {
        Product p = productRepository.findActiveById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toResponse(p);
    }

    public List<ProductResponse> search(String query) {
        return productRepository.searchActive(query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Page<ProductResponse> getPaged(String q, Long categoryId, Double minPrice,
            Double maxPrice, Long sellerId, int page, int size, String sortBy) {
        String sortField = switch (sortBy == null ? "newest" : sortBy.toLowerCase()) {
            case "price" -> "price";
            case "name" -> "name";
            default -> "id";
        };
        Sort sort = sortField.equals("name") ? Sort.by(sortField).ascending() : Sort.by(sortField).descending();
        Page<Product> raw = productRepository.findActiveWithFilters(
                q, categoryId, minPrice, maxPrice, sellerId,
                PageRequest.of(page, size, sort));
        List<ProductResponse> content = raw.getContent().stream()
                .map(this::toResponse).collect(Collectors.toList());
        return new PageImpl<>(content, raw.getPageable(), raw.getTotalElements());
    }

    public List<ProductResponse> topSelling() {
        List<Object[]> rows = orderRepository.topSellingProducts();
        List<Long> topIds = new ArrayList<>();
        for (Object[] row : rows) {
            if (row.length > 0 && row[0] != null) {
                topIds.add((Long) row[0]);
            }
            if (topIds.size() >= 10) break;
        }
        
        List<Product> products = productRepository.findByIdIn(topIds);
        Map<Long, Product> byId = new LinkedHashMap<>();
        for (Product p : products) byId.put(p.getId(), p);
        
        List<ProductResponse> sorted = new ArrayList<>();
        for (Long id : topIds) {
            Product p = byId.get(id);
            if (p != null) sorted.add(toResponse(p));
        }

        // Fallback: If we don't have enough top selling products, fill with newest active products
        if (sorted.size() < 4) {
            List<Product> newest = productRepository.findAllActive();
            for (Product p : newest) {
                if (sorted.stream().noneMatch(r -> r.getId().equals(p.getId()))) {
                    sorted.add(toResponse(p));
                }
                if (sorted.size() >= 8) break;
            }
        }
        
        return sorted;
    }

    public List<ProductResponse> getBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        applyRequest(product, request);
        return toResponse(productRepository.save(product));
    }

    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    // ── Variant management ───────────────────────────────────────────────────

    @Transactional
    public List<VariantResponse> addVariant(Long productId, VariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        ProductVariant v = new ProductVariant();
        v.setProduct(product);
        v.setSize(request.getSize());
        v.setColor(request.getColor());
        v.setStockQuantity(request.getStockQuantity());
        variantRepository.save(v);
        return variantRepository.findByProductId(productId)
                .stream().map(this::toVariantResponse).collect(Collectors.toList());
    }

    @Transactional
    public List<VariantResponse> updateVariant(Long productId, Long variantId, VariantRequest request) {
        ProductVariant v = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        if (!v.getProduct().getId().equals(productId)) throw new RuntimeException("Variant not for this product");
        v.setSize(request.getSize());
        v.setColor(request.getColor());
        v.setStockQuantity(request.getStockQuantity());
        variantRepository.save(v);
        return variantRepository.findByProductId(productId)
                .stream().map(this::toVariantResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteVariant(Long productId, Long variantId) {
        ProductVariant v = variantRepository.findById(variantId)
                .orElseThrow(() -> new RuntimeException("Variant not found"));
        if (!v.getProduct().getId().equals(productId)) throw new RuntimeException("Variant not for this product");
        variantRepository.delete(v);
    }

    public List<VariantResponse> getVariants(Long productId) {
        return variantRepository.findByProductId(productId)
                .stream().map(this::toVariantResponse).collect(Collectors.toList());
    }

    // ── Mapping helpers ──────────────────────────────────────────────────────

    public ProductResponse toResponse(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setImageUrl(p.getImageUrl());
        r.setPrice(p.getPrice());
        r.setPrixPromo(p.getPrixPromo());
        r.setQuantity(p.getQuantity());
        r.setActive(p.getActive());

        if (p.getCategories() != null && !p.getCategories().isEmpty()) {
            r.setCategoryIds(p.getCategories().stream().map(Category::getId).collect(Collectors.toList()));
            r.setCategoryNames(p.getCategories().stream().map(Category::getName).collect(Collectors.joining(", ")));
        }

        if (p.getSeller() != null) {
            r.setSellerId(p.getSeller().getId());
            sellerProfileRepository.findBySellerId(p.getSeller().getId())
                    .ifPresent(sp -> r.setSellerStoreName(sp.getStoreName()));
        }

        // reviews summary
        var reviews = reviewRepository.findByProductIdAndApprovedTrue(p.getId());
        r.setReviewCount(reviews.size());
        if (!reviews.isEmpty()) {
            double avg = reviews.stream().mapToInt(rv -> rv.getRating()).average().orElse(0);
            r.setAverageRating(avg);
        }

        // variants (only loaded when available)
        try {
            List<VariantResponse> variants = p.getVariants().stream()
                    .map(this::toVariantResponse).collect(Collectors.toList());
            r.setVariants(variants);
        } catch (Exception ignored) {
            r.setVariants(new ArrayList<>());
        }

        return r;
    }

    private VariantResponse toVariantResponse(ProductVariant v) {
        VariantResponse r = new VariantResponse();
        r.setId(v.getId());
        r.setSize(v.getSize());
        r.setColor(v.getColor());
        r.setStockQuantity(v.getStockQuantity());
        return r;
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setImageUrl(request.getImageUrl());
        product.setPrice(request.getPrice());
        product.setPrixPromo(request.getPrixPromo());
        product.setQuantity(request.getQuantity());
        if (request.getActive() != null) product.setActive(request.getActive());

        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            List<Category> cats = categoryRepository.findAllById(request.getCategoryIds());
            product.setCategories(cats);
        }
    }

    private User getCurrentUser() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User) return (User) auth.getPrincipal();
        } catch (Exception ignored) {}
        return null;
    }
}