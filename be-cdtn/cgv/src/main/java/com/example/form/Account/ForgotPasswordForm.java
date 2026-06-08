package com.example.form.Account;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ForgotPasswordForm {

	@NotBlank(message = "Email không được để trống")
	@Email(message = "Email không đúng định dạng")
	private String email;
}
