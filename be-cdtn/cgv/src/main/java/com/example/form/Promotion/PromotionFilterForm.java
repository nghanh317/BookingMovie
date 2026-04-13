package com.example.form.Promotion;

import com.example.entity.Promotions.Status;

import lombok.Data;

@Data
public class PromotionFilterForm {

	private String search;
	
	private Status status;
}
