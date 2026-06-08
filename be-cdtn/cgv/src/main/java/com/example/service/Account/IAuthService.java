package com.example.service.Account;

public interface IAuthService {
    String processForgotPassword(String email);
    void processResetPassword(String token, String newPassword);
}
