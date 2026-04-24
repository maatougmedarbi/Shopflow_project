package com.shopflow.auth;

import lombok.Data;

@Data
public class RefreshTokenRequest {
    private String refreshToken;
}
