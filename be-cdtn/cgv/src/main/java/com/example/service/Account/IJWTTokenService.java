package com.example.service.Account;

import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletRequest;

public interface IJWTTokenService {

    /** Tạo access token (15 phút) */
    String generateAccessToken(String username);

    /** Tạo refresh token (7 ngày) */
    String generateRefreshToken(String username);

    /** Lấy username từ bất kỳ token nào (access hoặc refresh) */
    String getUsernameFromToken(String token);

    /** Kiểm tra token còn hiệu lực không */
    boolean isTokenValid(String token);

    /** Parse access token từ request → trả về Authentication */
    Authentication parseAccessToken(HttpServletRequest request);
}
