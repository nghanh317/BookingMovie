package com.example.form.Account;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class RefreshTokenForm {

    @NotBlank(message = "refreshToken không được để trống")
    private String refreshToken;
}
