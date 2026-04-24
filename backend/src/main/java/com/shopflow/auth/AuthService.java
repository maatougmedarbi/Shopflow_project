package com.shopflow.auth;

import com.shopflow.model.Role;
import com.shopflow.model.User;
import com.shopflow.repository.UserRepository;
import com.shopflow.service.SellerProfileService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

@Service
public class AuthService {

    /** At least 8 chars, one uppercase, one digit, one special character */
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.shopflow.security.JwtService jwtService;
    private final SellerProfileService sellerProfileService;
    private final Set<String> validRefreshTokens = ConcurrentHashMap.newKeySet();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            com.shopflow.security.JwtService jwtService,
            SellerProfileService sellerProfileService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.sellerProfileService = sellerProfileService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }
        if (request.getPassword() == null || !PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            throw new RuntimeException(
                    "Password must be at least 8 characters and contain an uppercase letter, a digit, and a special character");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Role role = Role.CUSTOMER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                role = Role.valueOf(request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                role = Role.CUSTOMER;
            }
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(role)
                .active(true)
                .build();

        User saved = userRepository.save(user);

        // Auto-create SellerProfile for seller registrations
        if (saved.getRole() == Role.SELLER) {
            // We need to set the security context temporarily or use a direct repo call
            // Use the service method that accepts a User directly
            sellerProfileService.createDefaultProfile(saved);
        }

        return issueTokens(saved);
    }

    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return issueTokens(user);
    }

    public AuthResponse refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token is required");
        }
        if (!validRefreshTokens.contains(refreshToken)) {
            throw new RuntimeException("Refresh token is invalid or logged out");
        }
        if (!jwtService.isTokenValid(refreshToken)) {
            validRefreshTokens.remove(refreshToken);
            throw new RuntimeException("Refresh token expired");
        }
        if (!"refresh".equals(jwtService.extractType(refreshToken))) {
            throw new RuntimeException("Invalid token type");
        }

        String email = jwtService.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        validRefreshTokens.remove(refreshToken);
        return issueTokens(user);
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            validRefreshTokens.remove(refreshToken);
        }
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        validRefreshTokens.add(refreshToken);
        return new AuthResponse(accessToken, refreshToken);
    }
}