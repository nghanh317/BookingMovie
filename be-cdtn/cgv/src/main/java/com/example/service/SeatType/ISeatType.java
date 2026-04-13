package com.example.service.SeatType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.SeatTypeDTO;
import com.example.form.SeatType.CreateSeatTypeForm;
import com.example.form.SeatType.UpdateSeatTypeForm;

public interface ISeatType {
	
	Page<SeatTypeDTO> getAllSeatType (Pageable pageable);
	
	SeatTypeDTO getById( Integer id);
	
	void createSeatType (CreateSeatTypeForm form) throws Exception;
	
	void updateSeatType (Integer id,UpdateSeatTypeForm form) throws Exception;
	
	void deleteSeatType (Integer id);

}
