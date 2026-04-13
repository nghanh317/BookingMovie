package com.example.controller.PromotionUsage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.PromotionUsageDTO;
import com.example.service.PromotionUsage.IPromotionUsageService;

@RestController
@RequestMapping ("api/v1/promotionUsages")
public class PromotionUsageController {

	@Autowired
	private IPromotionUsageService service;
	
public Page<PromotionUsageDTO> getAllPromotionUsage (Pageable pageable){
	return service.getAllPromotionUsage(pageable);
}
@DeleteMapping("{/id}")
public void delete (@PathVariable Integer id) {
	service.delete(id);
}
}
