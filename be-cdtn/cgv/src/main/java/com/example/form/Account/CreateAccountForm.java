package com.example.form.Account;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateAccountForm {

	private String userName;
	
	private String passwordHash;
	
	private String email;
	
	private String phone;
	
	private String fullName;
}
