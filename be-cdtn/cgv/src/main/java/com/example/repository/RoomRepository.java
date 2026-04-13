package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Rooms;

@Repository
public interface RoomRepository extends JpaRepository<Rooms, Integer>, JpaSpecificationExecutor<Rooms>{
	
	
	List<Rooms> findByStatus (Rooms.Status status);
	
	List<Rooms> findByRoomType (String roomType);

}
