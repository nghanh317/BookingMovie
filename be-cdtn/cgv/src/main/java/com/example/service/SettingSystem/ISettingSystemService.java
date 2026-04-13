package com.example.service.SettingSystem;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.entity.SettingSystem;
import com.example.form.SettingSystem.CreateSettingSystemm;

public interface ISettingSystemService {
	
	Page<SettingSystem> getAllSettingSystem(Pageable pageable);
	
	SettingSystem getById(Integer id);
	
	void create(CreateSettingSystemm form);
	
	void updateTicketPrice(String weekdayPrice, String weekendPrice);
	
	SettingSystem getTicketPrice();
}