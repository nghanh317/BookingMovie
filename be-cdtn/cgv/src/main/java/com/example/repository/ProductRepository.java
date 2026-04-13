package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Products;

@Repository
public interface ProductRepository extends JpaRepository<Products, Integer>, JpaSpecificationExecutor<Products>{
	
	List<Products> findByCategory (Products.Category category);

}
