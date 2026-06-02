package com.example.service.Seat;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.SeatDTO;
import com.example.form.Seat.CreateSeatForm;
import com.example.form.Seat.UpdateSeatForm;

public interface ISeatService {

	Page<SeatDTO> getAllSeat(Pageable pageable, Integer roomId);

	SeatDTO getById(Integer id);

	void create(CreateSeatForm form);

	void updateSeat(Integer id, UpdateSeatForm form);

	void deleteSeat(Integer id);

	/**
	 * Lấy trạng thái toàn bộ ghế của một suất chiếu.
	 * Trả về: seatId, seatRow, seatNumber, seatTypeName,
	 *          status ("booked"|"locked"|"available"), lockedByMe, expiresAt
	 */
	List<Map<String, Object>> getSlotSeatStatus(Integer slotId, Integer currentAccountId);
}