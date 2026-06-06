package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.entity.BookingSeats;

@Repository
public interface BookingSeatRepository
		extends JpaRepository<BookingSeats, Integer>, JpaSpecificationExecutor<BookingSeats> {

	List<BookingSeats> findByTickets_IdAndIsDeleted(Integer Id, Boolean isDeleted);

	List<BookingSeats> findByTickets_Slots_IdAndIsDeleted(Integer slotId, Boolean isDeleted);

	/**
	 * Lấy danh sách BookingSeats đã bị chiếm (CONFIRMED hoặc PENDING còn hạn 10 phút).
	 * Dùng JPQL tường minh để tránh lỗi với custom AttributeConverter.
	 */
	@Query("SELECT bs FROM BookingSeats bs " +
	       "WHERE bs.tickets.slots.id = :slotId " +
	       "AND bs.isDeleted = false " +
	       "AND bs.tickets.status = com.example.entity.Tickets.Status.CONFIRMED")
	List<BookingSeats> findUnavailableBySlotId(@Param("slotId") Integer slotId, @Param("tenMinsAgo") java.util.Date tenMinsAgo);
}

