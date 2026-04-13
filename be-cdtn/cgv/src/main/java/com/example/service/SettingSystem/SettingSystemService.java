package com.example.service.SettingSystem;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.entity.SettingSystem;
import com.example.form.SettingSystem.CreateSettingSystemm;
import com.example.repository.SettingSystemRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class SettingSystemService implements ISettingSystemService{
	
	@Autowired
	private SettingSystemRepository settingSystemRepository;
	
	private final ObjectMapper objectMapper = new ObjectMapper();
	
	@Override
	public Page<SettingSystem> getAllSettingSystem(Pageable pageable) {
		return settingSystemRepository.findAll(pageable);
	}
	
	@Override
	public SettingSystem getById(Integer id) {
		return settingSystemRepository.findById(id).orElseThrow(() -> new RuntimeException("Setting not found"));
	}
	
	@Override
	public void create(CreateSettingSystemm form) {
		SettingSystem ss = new SettingSystem(form.getConfigData(), form.getType());
		settingSystemRepository.save(ss);
	}
	
	public void updateTicketPrice(String weekdayPrice, String weekendPrice) {
		try {
			SettingSystem setting = settingSystemRepository.findByType("TICKET_PRICE")
				.orElse(new SettingSystem());
			
			ObjectNode config = objectMapper.createObjectNode();
			config.put("weekday_price", weekdayPrice);
			config.put("weekend_price", weekendPrice);
			
			setting.setType("TICKET_PRICE");
			setting.setConfigData(config.toString());
			setting.setCreateDate(new Date());
			
			settingSystemRepository.save(setting);
		} catch (Exception e) {
			throw new RuntimeException("Error updating ticket price: " + e.getMessage(), e);
		}
	}
	
	public SettingSystem getTicketPrice() {
		return settingSystemRepository.findByType("TICKET_PRICE")
			.orElseThrow(() -> new RuntimeException("Ticket price configuration not found"));
	}
}