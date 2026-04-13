package com.example.service.Product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.ProductDTO;
import com.example.form.Product.CreateProductForm;
import com.example.form.Product.ProductFilterForm;
import com.example.form.Product.UpdateProductForm;

public interface IProductService {
	
	Page<ProductDTO> getAllProduct (Pageable pageable, ProductFilterForm filterform);
	
	ProductDTO getById (Integer id);
	
	void createProduct (CreateProductForm form);
	
	void updateProduct (Integer id, UpdateProductForm form);
	
	void deleteProduct (Integer id);

}
