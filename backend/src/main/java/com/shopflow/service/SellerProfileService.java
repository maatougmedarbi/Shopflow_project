package com.shopflow.service;

import com.shopflow.dto.SellerProfileRequest;
import com.shopflow.dto.SellerProfileResponse;
import com.shopflow.model.SellerProfile;
import com.shopflow.model.User;
import com.shopflow.repository.SellerProfileRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;

    public SellerProfileService(SellerProfileRepository sellerProfileRepository) {
        this.sellerProfileRepository = sellerProfileRepository;
    }

    public SellerProfileResponse getOwnProfile() {
        User user = getCurrentUser();
        SellerProfile profile = sellerProfileRepository.findBySellerId(user.getId())
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        return toResponse(profile);
    }

    @Transactional
    public SellerProfileResponse upsert(SellerProfileRequest request) {
        User user = getCurrentUser();
        SellerProfile profile = sellerProfileRepository.findBySellerId(user.getId())
                .orElseGet(() -> {
                    SellerProfile p = new SellerProfile();
                    p.setSeller(user);
                    return p;
                });
        if (request.getStoreName() != null && !request.getStoreName().isBlank()) {
            profile.setStoreName(request.getStoreName());
        }
        profile.setDescription(request.getDescription());
        if (request.getLogoUrl() != null) profile.setLogoUrl(request.getLogoUrl());
        return toResponse(sellerProfileRepository.save(profile));
    }

    public SellerProfileResponse getPublicProfile(Long sellerId) {
        SellerProfile profile = sellerProfileRepository.findBySellerId(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        return toResponse(profile);
    }

    public SellerProfileResponse toResponse(SellerProfile p) {
        SellerProfileResponse r = new SellerProfileResponse();
        r.setId(p.getId());
        if (p.getSeller() != null) {
            r.setSellerId(p.getSeller().getId());
            r.setSellerEmail(p.getSeller().getEmail());
            r.setSellerFirstName(p.getSeller().getFirstName());
            r.setSellerLastName(p.getSeller().getLastName());
        }
        r.setStoreName(p.getStoreName());
        r.setDescription(p.getDescription());
        r.setLogoUrl(p.getLogoUrl());
        return r;
    }

    @Transactional
    public SellerProfile createDefaultProfile(User seller) {
        return sellerProfileRepository.findBySellerId(seller.getId()).orElseGet(() -> {
            SellerProfile p = new SellerProfile();
            p.setSeller(seller);
            p.setStoreName(seller.getFirstName() + "'s Store");
            return sellerProfileRepository.save(p);
        });
    }

    private User getCurrentUser() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return (User) auth.getPrincipal();
    }
}
