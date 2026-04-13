package com.example.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.example.entity.Products.Category;

import lombok.Data;

@Data
public class ProductDTO {
	private Integer id;
	
    private String productName;
    
    private Category category;

    private String description;
    
    private BigDecimal price;
    
    private String imageUrl;
    
    private Date createDate;
}
