package com.example.form.Account;

import com.example.entity.Accounts;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateAccountForm {

	private String userName;
	
	private String email;
	
	private String phone;
	
	private String fullName;
	
	private Accounts.Role role;
}
