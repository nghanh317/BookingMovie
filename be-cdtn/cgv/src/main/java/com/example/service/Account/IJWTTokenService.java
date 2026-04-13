package com.example.service.Account;

import org.springframework.security.core.Authentication;

import jakarta.servlet.http.HttpServletRequest;

public interface IJWTTokenService {

	String generateJWTToken(String username);
	
	Authentication parseTokenToUserInformation(HttpServletRequest request);
	
}
