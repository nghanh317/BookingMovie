package com.example.controller.Account;

import java.util.Map;
import java.security.Principal;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

import com.example.dto.AccountDTO;
import com.example.dto.LoginResponse;
import com.example.form.Account.AccountForm;
import com.example.form.Account.ChangePasswordForm;
import com.example.form.Account.CreateAccountForm;
import com.example.form.Account.ForgotPasswordForm;
import com.example.form.Account.ResetPasswordForm;
import com.example.form.Account.RefreshTokenForm;
import com.example.service.Account.IAccountService;
import com.example.service.Account.IAuthService;
import com.example.service.Account.IJWTTokenService;
import com.example.service.Mail.EmailService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/auth")
@Validated
public class AuthController {

    // Khi nào deploy lên server thật, chỉ cần đổi chỗ này thành true!
    boolean isProduction = false; 
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private IJWTTokenService jwtTokenService;

    @Autowired
    private IAccountService accountService;

    @Autowired
    private IAuthService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    // ── POST /api/v1/auth/login ──────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid AccountForm loginForm) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginForm.getUserName(),
                        loginForm.getPasswordHash()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        AccountDTO account = accountService.getAccountByUserName(loginForm.getUserName());

        // Tạo cả 2 token
        String accessToken  = jwtTokenService.generateAccessToken(account.getUserName());
        String refreshToken = jwtTokenService.generateRefreshToken(account.getUserName());

        // Tạo HttpOnly cookie cho refreshToken
        ResponseCookie springCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Đặt true nếu dùng HTTPS trên production
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 ngày
                .sameSite("Lax")
                .build();

        LoginResponse responseBody = new LoginResponse(
                account.getId(),
                account.getUserName(),
                account.getEmail(),
                account.getPhone(),
                account.getFullName(),
                account.getRole().toString(),
                accessToken,
                null); // Không trả refreshToken trong body nữa

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, springCookie.toString())
                .body(responseBody);
    }

    // ── POST /api/v1/auth/refresh 
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshToken) {
        
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of(
                        "message", "Không tìm thấy refresh token trong cookie. Vui lòng đăng nhập lại.",
                        "code", 401));
        }

        // Kiểm tra refresh token hợp lệ và còn hạn
        if (!jwtTokenService.isTokenValid(refreshToken)) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of(
                        "message", "Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
                        "code", 401));
        }

        // Lấy username từ refresh token → tạo access token mới (15 phút)
        String username    = jwtTokenService.getUsernameFromToken(refreshToken);
        String accessToken = jwtTokenService.generateAccessToken(username);

        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }

    // ── POST /api/v1/auth/register ───────────────────────────
    @PostMapping("/register")
    public void register(@RequestBody @Valid CreateAccountForm form) {
        form.setPasswordHash(passwordEncoder.encode(form.getPasswordHash()));
        accountService.createAccount(form);
        emailService.sendWelcomeEmail(form.getEmail(), form.getFullName());
    }
    // ── POST /api/v1/auth/logout ─────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {

        // Tạo một cookie đè lên cookie cũ, với maxAge = 0 để trình duyệt tự hủy nó
        ResponseCookie cleanCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(isProduction)
                .path("/")
                .sameSite(isProduction ? "None" : "Lax") 
                .maxAge(0) // Quan trọng nhất: 0 giây = Xóa
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                .body(Map.of("message", "Đăng xuất thành công"));
    }
    // ── POST /api/v1/auth/forgot-password ────────────────────
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordForm form) {
        try {
            String token = authService.processForgotPassword(form.getEmail());
            return ResponseEntity.ok(Map.of(
                "message", "Vui lòng kiểm tra email để đặt lại mật khẩu.",
                "token", token
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/v1/auth/reset-password ─────────────────────
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordForm form) {
        try {
            authService.processResetPassword(form.getToken(), form.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công."));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── POST /api/v1/auth/change-password ────────────────────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody @Valid ChangePasswordForm form, Principal principal, HttpServletResponse response) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Chưa đăng nhập."));
        }

        if (!form.getNewPassword().equals(form.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Xác nhận mật khẩu mới không khớp."));
        }

        if (form.getOldPassword().equals(form.getNewPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu mới phải khác mật khẩu cũ."));
        }
        
        try {
            authService.changePassword(principal.getName(), form.getOldPassword(), form.getNewPassword());
            
            // Xóa Refresh Token Cookie để buộc đăng nhập lại
            Cookie cookie = new Cookie("refreshToken", "");
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);

            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
