package com.example.controller.Account;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.example.dto.AccountDTO;
import com.example.dto.LoginResponse;
import com.example.form.Account.AccountForm;
import com.example.form.Account.CreateAccountForm;
import com.example.form.Account.RefreshTokenForm;
import com.example.service.Account.IAccountService;
import com.example.service.Account.IJWTTokenService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/api/v1/auth")
@Validated
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private IJWTTokenService jwtTokenService;

    @Autowired
    private IAccountService accountService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ── POST /api/v1/auth/login ──────────────────────────────
    @PostMapping("/login")
    public LoginResponse login(@RequestBody @Valid AccountForm loginForm) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginForm.getUserName(),
                        loginForm.getPasswordHash()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        AccountDTO account = accountService.getAccountByUserName(loginForm.getUserName());

        // Tạo cả 2 token
        String accessToken  = jwtTokenService.generateAccessToken(account.getUserName());
        String refreshToken = jwtTokenService.generateRefreshToken(account.getUserName());

        return new LoginResponse(
                account.getId(),
                account.getUserName(),
                account.getEmail(),
                account.getPhone(),
                account.getFullName(),
                account.getRole().toString(),
                accessToken,
                refreshToken);
    }

    // ── POST /api/v1/auth/refresh ────────────────────────────
    /**
     * Client gửi refreshToken (còn hạn 7 ngày) → nhận accessToken mới (15 phút).
     * Không cần đăng nhập lại.
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody @Valid RefreshTokenForm form) {
        String refreshToken = form.getRefreshToken();

        // Kiểm tra refresh token hợp lệ và còn hạn
        if (!jwtTokenService.isTokenValid(refreshToken)) {
            return ResponseEntity
                    .status(401)
                    .body(Map.of(
                        "message", "Refresh token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
                        "code", 401));
        }

        // Lấy username từ refresh token → tạo access token mới
        String username    = jwtTokenService.getUsernameFromToken(refreshToken);
        String accessToken = jwtTokenService.generateAccessToken(username);

        return ResponseEntity.ok(Map.of("accessToken", accessToken));
    }

    // ── POST /api/v1/auth/register ───────────────────────────
    @PostMapping("/register")
    public void register(@RequestBody @Valid CreateAccountForm form) {
        form.setPasswordHash(passwordEncoder.encode(form.getPasswordHash()));
        accountService.createAccount(form);
    }
}
