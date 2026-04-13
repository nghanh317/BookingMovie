package com.example.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Cinemas;

@Repository
public interface CinemaRepository extends JpaRepository<Cinemas, Integer>,JpaSpecificationExecutor<Cinemas>{

	
	List<Cinemas> findByStatus ( Cinemas.Status status);
	
	Cinemas findByPhone (String phone);
	
	Cinemas findByEmail (String email);
	
	Page<Cinemas> findByProvincesIdAndIsDeletedFalse(Integer provinceId, Pageable pageable);
	
}
