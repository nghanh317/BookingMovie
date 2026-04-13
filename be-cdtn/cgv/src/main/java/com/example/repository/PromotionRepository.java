package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Promotions;

@Repository
public interface PromotionRepository extends JpaRepository<Promotions, Integer>, JpaSpecificationExecutor<Promotions>{

}
