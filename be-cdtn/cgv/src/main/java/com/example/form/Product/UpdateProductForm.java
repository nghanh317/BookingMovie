package com.example.form.Product;

import java.math.BigDecimal;

import com.example.entity.Products.Category;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateProductForm {
    private String productName;
    
    private Category category;

    private String description;
    
    private BigDecimal price;
    
    private String imageUrl;
}
