package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.entity.Seats;
import com.example.entity.Seats.Status;

@Repository
public interface SeatRepository extends JpaRepository<Seats, Integer>{

	Long countByRoomsIdAndStatus(Integer roomId, String string);

	Long countByRoomsIdAndStatus(Integer roomId, Status active);
}
