package com.example.controller.Product;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.ProductDTO;
import com.example.form.Product.CreateProductForm;
import com.example.form.Product.ProductFilterForm;
import com.example.form.Product.UpdateProductForm;
import com.example.service.Product.IProductService;

@RestController
@RequestMapping ("api/v1/products")
public class ProductController {
	
	@Autowired
	private IProductService productService;
	
	@GetMapping
	public Page<ProductDTO> getAllProduct (Pageable pageable, ProductFilterForm filterform){
		return productService.getAllProduct(pageable, filterform);
	}
	@GetMapping ("/{id}")
	public ProductDTO getById (@PathVariable Integer id) {
		return productService.getById(id);
	}
	@PostMapping
	public void createProduct (@RequestBody CreateProductForm form) {
		productService.createProduct(form);
	}
	@PutMapping ("/{id}")
	public void updateProduct (@PathVariable Integer id, @RequestBody UpdateProductForm form) {
		productService.updateProduct(id, form);
		
	}
	@DeleteMapping ("/{id}")
	public void deleteProduct (@PathVariable Integer id) {
		productService.deleteProduct(id);
	}

}
