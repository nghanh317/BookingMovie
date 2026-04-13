package com.example.dto;

import com.example.dto.LoginInfoDto;

import lombok.Data;

@Data
public class LoginInfoDto {

	private Integer id;
	
	private String userName;

	private String role;

	private String fullname;
}

