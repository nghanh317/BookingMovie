package com.example.controller.SettingSystem;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.SettingSystem;
import com.example.form.SettingSystem.CreateSettingSystemm;
import com.example.service.SettingSystem.ISettingSystemService;

import lombok.Data;

@RestController
@RequestMapping("api/v1/settingSystems")
public class SettingSystemController {
	
	@Autowired
	private ISettingSystemService service;
	
	@GetMapping
	public Page<SettingSystem> getAllSettingSystem(Pageable pageable){
		return service.getAllSettingSystem(pageable);
	}
	
	@GetMapping("/{id}")
	public SettingSystem getById(@PathVariable Integer id) {
		return service.getById(id);
	}
	
	@PostMapping
	public void create(@RequestBody CreateSettingSystemm form) {
		service.create(form);
	}
	
	@GetMapping("/price")
	public ResponseEntity<SettingSystem> getTicketPrice() {
		return ResponseEntity.ok(service.getTicketPrice());
	}
	
	@PutMapping("/price")
	public ResponseEntity<String> updateTicketPrice(@RequestBody PriceUpdateRequest request) {
		service.updateTicketPrice(request.getWeekdayPrice(), request.getWeekendPrice());
		return ResponseEntity.ok("Price updated successfully");
	}
}

@Data
class PriceUpdateRequest {
	private String weekdayPrice;
	private String weekendPrice;
}