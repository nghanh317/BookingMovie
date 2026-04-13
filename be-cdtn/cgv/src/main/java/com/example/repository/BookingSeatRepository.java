package com.example.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.BookingSeats;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeats, Integer>, JpaSpecificationExecutor<BookingSeats>{

	List<BookingSeats> findByTickets_IdAndIsDeleted(Integer Id, Boolean isDeleted);
	
	List<BookingSeats> findByTickets_Slots_IdAndIsDeleted(Integer slotId, Boolean isDeleted);
}
