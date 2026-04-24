package com.shopflow.controller;

import com.shopflow.dto.SellerProfileRequest;
import com.shopflow.dto.SellerProfileResponse;
import com.shopflow.service.SellerProfileService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller")
public class SellerProfileController {

    private final SellerProfileService sellerProfileService;

    public SellerProfileController(SellerProfileService sellerProfileService) {
        this.sellerProfileService = sellerProfileService;
    }

    /** Get own seller profile (authenticated seller/admin only) */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public SellerProfileResponse getOwnProfile() {
        return sellerProfileService.getOwnProfile();
    }

    /** Upsert own seller profile */
    @PutMapping("/profile")
    @PreAuthorize("hasAnyRole('SELLER','ADMIN')")
    public SellerProfileResponse upsert(@RequestBody SellerProfileRequest request) {
        return sellerProfileService.upsert(request);
    }

    /** Public store page — no auth required */
    @GetMapping("/profile/{sellerId}")
    public SellerProfileResponse publicProfile(@PathVariable Long sellerId) {
        return sellerProfileService.getPublicProfile(sellerId);
    }
}
