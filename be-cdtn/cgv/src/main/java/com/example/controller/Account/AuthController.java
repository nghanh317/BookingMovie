package com.example.controller.Account;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.AccountDTO;
import com.example.form.Account.AccountForm;
import com.example.service.Account.IAccountService;
import com.example.service.Account.IJWTTokenService;

import com.example.form.Account.CreateAccountForm;

import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping(value = "api/v1/auth")
@Validated
public class AuthController {

	@Autowired
	private ModelMapper modelMapper;

	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private IJWTTokenService jwtTokenService;

	@Autowired
	private IAccountService service;

	//them 2 dong nay
	@Autowired
	private PasswordEncoder passwordEncoder;

	@PostMapping("/login")
	public AccountDTO login(@RequestBody @Valid AccountForm loginForm) {

		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(
						loginForm.getUserName(), 
						loginForm.getPasswordHash()));

		SecurityContextHolder.getContext().setAuthentication(authentication);

		AccountDTO entity = service.getAccountByUserName(loginForm.getUserName());

		AccountDTO dto = modelMapper.map(entity, AccountDTO.class);
		
		dto.setToken(jwtTokenService.generateJWTToken(entity.getUserName()));

		return dto;
	}

	@PostMapping("/register")
	public void register(@RequestBody @Valid CreateAccountForm form) {
		form.setPasswordHash(passwordEncoder.encode(form.getPasswordHash()));
		service.createAccount(form);
	}
}
