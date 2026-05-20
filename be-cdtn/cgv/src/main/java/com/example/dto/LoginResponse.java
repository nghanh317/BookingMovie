package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response trả về sau khi đăng nhập thành công.
 * Chứa thông tin user + cả 2 token.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    // ── Thông tin user ──────────────────────────────────────
    private Integer id;
    private String userName;
    private String email;
    private String phone;
    private String fullName;
    private String role;

    // ── Tokens ──────────────────────────────────────────────
    /** Access token — hết hạn sau 15 phút */
    private String accessToken;

    /** Refresh token — hết hạn sau 7 ngày */
    private String refreshToken;
}
