package com.example.service.Account;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.entity.Accounts;
import com.example.repository.AccountRepository;
import com.example.service.Mail.EmailService;

import io.jsonwebtoken.Claims;

@Service
@Transactional
public class AuthService implements IAuthService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private IJWTTokenService jwtTokenService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public String processForgotPassword(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalStateException("Email không được để trống");
        }
        Accounts account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new IllegalStateException("Email không tồn tại trong hệ thống.");
        }
        String resetToken = jwtTokenService.generateResetPasswordToken(email, account.getPasswordHash());
        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
        emailService.sendResetPasswordEmail(email, resetLink);
        return resetToken;
    }

    @Override
    public void processResetPassword(String token, String newPassword) {
        if (token == null || newPassword == null || newPassword.length() < 6) {
            throw new IllegalStateException("Token không hợp lệ hoặc mật khẩu quá ngắn.");
        }

        Claims claims = jwtTokenService.getClaimsFromToken(token);
        if (claims == null || !claims.getExpiration().after(new java.util.Date())) {
            throw new IllegalStateException("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
        }

        String purpose = claims.get("purpose", String.class);
        if (!"password_reset".equals(purpose)) {
            throw new IllegalStateException("Token không đúng mục đích.");
        }

        String email = claims.getSubject();
        String tokenPasswordHash = claims.get("user_password_hash", String.class);

        Accounts account = accountRepository.findByEmail(email);
        if (account == null) {
            throw new IllegalStateException("Tài khoản không tồn tại.");
        }

        if (!account.getPasswordHash().equals(tokenPasswordHash)) {
            throw new IllegalStateException("Link này đã được sử dụng.");
        }

        account.setPasswordHash(passwordEncoder.encode(newPassword));
        accountRepository.save(account);
    }

    @Override
    public void changePassword(String userName, String oldPassword, String newPassword) {
        Accounts account = accountRepository.findByUserName(userName);
        if (account == null) {
            throw new IllegalStateException("Người dùng không tồn tại.");
        }
        
        // So sánh mật khẩu cũ
        if (!passwordEncoder.matches(oldPassword, account.getPasswordHash())) {
            throw new IllegalStateException("Mật khẩu cũ không chính xác.");
        }
        
        // Mã hóa và cập nhật mật khẩu mới
        account.setPasswordHash(passwordEncoder.encode(newPassword));
        accountRepository.save(account);
    }
}
