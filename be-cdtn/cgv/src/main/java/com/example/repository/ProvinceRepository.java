package com.example.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Provinces;

@Repository
public interface ProvinceRepository extends JpaRepository<Provinces, Integer>,JpaSpecificationExecutor<Provinces>{
	Optional<Provinces> findByProvinceName (String provinceName);
}
