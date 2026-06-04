package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Slots;

@Repository
public interface SlotRepository extends JpaRepository<Slots, Integer>,JpaSpecificationExecutor<Slots>{
	
	List<Slots> findByMoviesIdOrderByShowTime(Integer movieId);

	@org.springframework.data.jpa.repository.Query("SELECT s FROM Slots s WHERE s.rooms.id = :roomId AND s.showTime < :newEnd AND s.endTime > :newStart AND (s.isDeleted IS NULL OR s.isDeleted = false)")
	List<Slots> findOverlappingSlots(@org.springframework.data.repository.query.Param("roomId") Integer roomId, @org.springframework.data.repository.query.Param("newStart") java.util.Date newStart, @org.springframework.data.repository.query.Param("newEnd") java.util.Date newEnd);
	List<Slots> findByRoomsId(Integer roomId);
}
