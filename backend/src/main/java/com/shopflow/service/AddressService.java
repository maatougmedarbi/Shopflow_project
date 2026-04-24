package com.shopflow.service;

import com.shopflow.model.Address;
import com.shopflow.model.User;
import com.shopflow.repository.AddressRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;

    public AddressService(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    public List<Address> getMyAddresses() {
        return addressRepository.findByUserIdOrderByPrimaryAddressDescIdDesc(getCurrentUser().getId());
    }

    public Address create(Address payload) {
        validate(payload);

        User user = getCurrentUser();
        Address address = new Address();
        address.setUser(user);
        applyPayload(address, payload);
        normalizePrimary(address, user.getId());
        return addressRepository.save(address);
    }

    public Address update(Long id, Address payload) {
        validate(payload);

        User user = getCurrentUser();
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Address not found"));
        applyPayload(address, payload);
        normalizePrimary(address, user.getId());
        return addressRepository.save(address);
    }

    public void delete(Long id) {
        User user = getCurrentUser();
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new RuntimeException("Address not found"));
        addressRepository.delete(address);
    }

    public Address resolveShippingAddress(Long addressId) {
        User user = getCurrentUser();
        if (addressId != null) {
            return addressRepository.findByIdAndUserId(addressId, user.getId())
                    .orElseThrow(() -> new RuntimeException("Address not found"));
        }

        return addressRepository.findFirstByUserIdAndPrimaryAddressTrue(user.getId())
                .or(() -> addressRepository.findByUserIdOrderByPrimaryAddressDescIdDesc(user.getId()).stream()
                        .findFirst())
                .orElseThrow(() -> new RuntimeException("Please add a shipping address first"));
    }

    public String format(Address address) {
        StringBuilder builder = new StringBuilder();
        if (address.getLabel() != null && !address.getLabel().isBlank()) {
            builder.append(address.getLabel()).append(": ");
        }
        builder.append(address.getLine1());
        if (address.getLine2() != null && !address.getLine2().isBlank()) {
            builder.append(", ").append(address.getLine2());
        }
        if (address.getCity() != null && !address.getCity().isBlank()) {
            builder.append(", ").append(address.getCity());
        }
        if (address.getPostalCode() != null && !address.getPostalCode().isBlank()) {
            builder.append(" ").append(address.getPostalCode());
        }
        if (address.getCountry() != null && !address.getCountry().isBlank()) {
            builder.append(", ").append(address.getCountry());
        }
        return builder.toString();
    }

    private void validate(Address payload) {
        if (payload.getLabel() == null || payload.getLabel().isBlank()) {
            throw new RuntimeException("Address label is required");
        }
        if (payload.getLine1() == null || payload.getLine1().isBlank()) {
            throw new RuntimeException("Address line 1 is required");
        }
    }

    private void applyPayload(Address target, Address payload) {
        target.setLabel(payload.getLabel());
        target.setLine1(payload.getLine1());
        target.setLine2(payload.getLine2());
        target.setCity(payload.getCity());
        target.setPostalCode(payload.getPostalCode());
        target.setCountry(payload.getCountry());
        target.setPrimaryAddress(payload.isPrimaryAddress());
    }

    private void normalizePrimary(Address address, Long userId) {
        if (address.isPrimaryAddress()) {
            for (Address existing : addressRepository.findByUserIdOrderByPrimaryAddressDescIdDesc(userId)) {
                if (address.getId() == null || !address.getId().equals(existing.getId())) {
                    existing.setPrimaryAddress(false);
                    addressRepository.save(existing);
                }
            }
            return;
        }

        boolean hasPrimary = addressRepository.findFirstByUserIdAndPrimaryAddressTrue(userId).isPresent();
        if (!hasPrimary) {
            address.setPrimaryAddress(true);
        }
    }

    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}