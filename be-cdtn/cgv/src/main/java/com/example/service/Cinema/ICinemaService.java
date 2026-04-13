package com.example.service.Cinema;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.CinemaDTO;
import com.example.form.Cinema.CinemaFilterForm;
import com.example.form.Cinema.CreateCinemaForm;
import com.example.form.Cinema.UpdateCinemaForm;

public interface ICinemaService {
	
	Page<CinemaDTO> getAllCinema (Pageable pageable, CinemaFilterForm filterform);
	
	CinemaDTO getById (Integer id);
	
	void createCinema (CreateCinemaForm form);
	
	void updateCiname (Integer id, UpdateCinemaForm form);
	
	void deleteCinema (Integer id);
}
