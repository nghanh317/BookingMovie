package com.example.form.Product;

import com.example.entity.Products;

import lombok.Data;

@Data
public class ProductFilterForm {

	private String search;
	
	private Products.Category category;
}
