package com.example.controller.Seat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.SeatDTO;
import com.example.form.Seat.CreateSeatForm;
import com.example.form.Seat.UpdateSeatForm;
import com.example.service.Seat.ISeatService;

@RequestMapping("api/v1/seats")
@RestController
public class SeatController {
	
	@Autowired
	private ISeatService seatService;
	
	@GetMapping
	public Page<SeatDTO> getAllSeat(Pageable pageable) {
		return seatService.getAllSeat(pageable);
	}

	@GetMapping("/{id}")
	public SeatDTO getById(@PathVariable Integer id) {
		return seatService.getById(id);
	}

	@PostMapping
	public void create(@RequestBody CreateSeatForm form) {
		seatService.create(form);
	}
	
	@PutMapping("/{id}")
	public void updateSeat(@PathVariable Integer id, @RequestBody UpdateSeatForm form) {
		seatService.updateSeat(id, form);
	}

	@DeleteMapping("/{id}")
	public void deleteSeat(@PathVariable Integer id) {
		seatService.deleteSeat(id);
	}
}