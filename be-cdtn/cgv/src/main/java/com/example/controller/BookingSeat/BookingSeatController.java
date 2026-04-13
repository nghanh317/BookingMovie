package com.example.controller.BookingSeat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.BookingSeatDTO;
import com.example.form.BookingSeat.BookingSeatFilterForm;
import com.example.form.BookingSeat.CreatBookingSeatForm;
import com.example.service.BookingSeat.IBookingSeatService;

@RestController
@RequestMapping ("api/v1/bookingSeats")
public class BookingSeatController {
	
	@Autowired
	private IBookingSeatService service;
	
	@GetMapping
	public Page<BookingSeatDTO> getAllBookingSeat ( Pageable pageable, BookingSeatFilterForm form){
		return service.getAllBookingSeat(pageable, form);
	}
	@GetMapping ("/{id}")
	public BookingSeatDTO getById (@PathVariable Integer id) {
		return service.getById(id);
	}
	@PostMapping
	public void create (@RequestBody CreatBookingSeatForm form) {
		service.create(form);
	}

}
