package com.example.controller.SeatType;

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

import com.example.dto.SeatTypeDTO;
import com.example.form.SeatType.CreateSeatTypeForm;
import com.example.form.SeatType.UpdateSeatTypeForm;
import com.example.service.SeatType.ISeatType;

@RestController
@RequestMapping ("api/v1/seatTypes")
public class SeatTypeController {
	
	@Autowired
	private ISeatType seatTypesService;
	
	@GetMapping
	public Page<SeatTypeDTO> getAllSeatType (Pageable pageable){
		return seatTypesService.getAllSeatType(pageable);
	}
	@GetMapping ("/{id}")
	public SeatTypeDTO getById (@PathVariable Integer id) {
		return seatTypesService.getById(id);
	}
	
	@PostMapping
	public void createSeatType (@RequestBody CreateSeatTypeForm form) throws Exception {
		seatTypesService.createSeatType(form);
	}
	
	@PutMapping ("/{id}")
	public void updateSeatType (@PathVariable Integer id, @RequestBody UpdateSeatTypeForm form) throws Exception{
		seatTypesService.updateSeatType(id, form);
	}
	
	@DeleteMapping("/{id}")
	public void deleteSeatType (@PathVariable Integer id) {
		seatTypesService.deleteSeatType(id);
	}
	

}
