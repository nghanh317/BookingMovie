package com.example.form.Account;

import com.example.entity.Accounts;

import lombok.Data;

@Data
public class AccountFilterForm {
	
	private String search;
	
	private Accounts.Role role;
}
