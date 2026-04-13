package com.example.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.entity.News;


@Repository
public interface NewRepository extends JpaRepository<News, Integer>{
	
	Optional<News> findByTitle(String title);
	
	boolean existsByTitle(String title);

}
