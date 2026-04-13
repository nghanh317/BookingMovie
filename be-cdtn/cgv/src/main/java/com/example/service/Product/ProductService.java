package com.example.service.Product;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.ProductDTO;
import com.example.entity.Products;
import com.example.form.Product.CreateProductForm;
import com.example.form.Product.ProductFilterForm;
import com.example.form.Product.UpdateProductForm;
import com.example.repository.ProductRepository;
import com.example.specification.ProductSpecification;

@Service
public class ProductService implements IProductService{
	
	@Autowired 
	private ProductRepository productRepository;
	
	@Autowired
	private ModelMapper modelMapper;

	@Override
	public Page<ProductDTO> getAllProduct(Pageable pageable, ProductFilterForm filterform) {
		Specification<Products> where = ProductSpecification.buildWhere(filterform);
		Page<Products> productPage = productRepository.findAll(where, pageable);
		
		List<ProductDTO> dto = modelMapper.map(productPage.getContent(), new TypeToken <List<ProductDTO>>() {}.getType());
		Page<ProductDTO> dtoPage = new PageImpl<>(dto, pageable, productPage.getTotalElements());
		
		return dtoPage;
	}

	@Override
	public ProductDTO getById(Integer id) {
		Products product = productRepository.findById(id).get();
		return modelMapper.map(product, ProductDTO.class);
	}

	@Override
	public void createProduct(CreateProductForm form) {
		Products createProduct = new Products(form.getProductName(), form.getDescription(), form.getPrice(), form.getImageUrl());
		createProduct.setCategory(form.getCategory());
		productRepository.save(createProduct);
		
	}

	@Override
	public void updateProduct(Integer id, UpdateProductForm form) {
		Products updateProduct = productRepository.findById(id).get();
		updateProduct.setProductName(form.getProductName());
		updateProduct.setCategory(form.getCategory());
		updateProduct.setDescription(form.getDescription());
		updateProduct.setPrice(form.getPrice());
		updateProduct.setImageUrl(form.getImageUrl());
		productRepository.save(updateProduct);
	}

	@Override
	public void deleteProduct(Integer id) {
		productRepository.deleteById(id);
		
	}
	

}
