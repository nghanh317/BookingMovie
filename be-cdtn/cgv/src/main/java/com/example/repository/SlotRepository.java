package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Slots;

@Repository
public interface SlotRepository extends JpaRepository<Slots, Integer>,JpaSpecificationExecutor<Slots>{
	
	List<Slots> findByMoviesIdOrderByShowTime(Integer movieId);
}
