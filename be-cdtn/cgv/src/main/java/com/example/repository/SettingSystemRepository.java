package com.example.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.entity.SettingSystem;

@Repository
public interface SettingSystemRepository extends JpaRepository<SettingSystem, Integer>{
	
	Optional<SettingSystem> findByType(String type);
	
	boolean existsByType(String type);

}
