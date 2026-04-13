package com.example.dto;

import java.util.Date;

import lombok.Data;

@Data
public class SettingSystemDTO {

	private Integer id;
	
	private Date createDate;
	
	private String configData;
	
	private String type;
}
