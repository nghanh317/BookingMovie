package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.entity.SeatTypes;

@Repository
public interface SeatTypeRepository extends JpaRepository<SeatTypes, Integer>{
	
	SeatTypes findByTypeName (String typeName);
	
	boolean existsByTypeName (String typeName);

}
