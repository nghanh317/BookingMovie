package com.example.service.BookingSeat;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.BookingSeatDTO;
import com.example.form.BookingSeat.BookingSeatFilterForm;
import com.example.form.BookingSeat.CreatBookingSeatForm;

public interface IBookingSeatService {
	
	Page<BookingSeatDTO> getAllBookingSeat (Pageable pageable, BookingSeatFilterForm form);
	
	BookingSeatDTO getById (Integer id);
	
	void create(CreatBookingSeatForm form);

}
