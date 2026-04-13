package com.example.form.Account;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AccountForm {

	@NotBlank
	private String userName;
	
	@NotBlank
	private String passwordHash;
}
