package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Reviews;

@Repository
public interface ReviewRepository extends JpaRepository<Reviews, Integer>, JpaSpecificationExecutor<Reviews>{

}
