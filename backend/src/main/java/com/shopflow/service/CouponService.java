package com.shopflow.service;

import com.shopflow.model.Coupon;
import com.shopflow.repository.CouponRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CouponService {

    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public List<Coupon> getAll() {
        return couponRepository.findAll();
    }

    public Coupon create(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    public Coupon update(Long id, Coupon payload) {
        Coupon coupon = couponRepository.findById(id).orElseThrow(() -> new RuntimeException("Coupon not found"));
        coupon.setCode(payload.getCode());
        coupon.setType(payload.getType());
        coupon.setValue(payload.getValue());
        coupon.setExpiryDate(payload.getExpiryDate());
        coupon.setUsagesMax(payload.getUsagesMax());
        coupon.setActive(payload.isActive());
        return couponRepository.save(coupon);
    }

    public void delete(Long id) {
        couponRepository.deleteById(id);
    }

    public Coupon validate(String code) {
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
        return coupon;
    }
}
