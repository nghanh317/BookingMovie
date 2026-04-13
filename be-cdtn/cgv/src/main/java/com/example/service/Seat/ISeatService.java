package com.example.service.Seat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.SeatDTO;
import com.example.form.Seat.CreateSeatForm;
import com.example.form.Seat.UpdateSeatForm;

public interface ISeatService {
	
	Page<SeatDTO> getAllSeat(Pageable pageable);
	
	SeatDTO getById(Integer id);
	
	void create(CreateSeatForm form);
	
	void updateSeat(Integer id, UpdateSeatForm form);
	
	void deleteSeat(Integer id);
}