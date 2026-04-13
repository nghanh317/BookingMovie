package com.example.controller.Promotion;

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

import com.example.dto.PromotionDTO;
import com.example.form.Promotion.CreatePromotion;
import com.example.form.Promotion.PromotionFilterForm;
import com.example.form.Promotion.UpdatePromotion;
import com.example.service.Promotion.IPromotionService;

@RestController
@RequestMapping ("api/v1/promotions")
public class PromotionController {
	
	@Autowired
	private IPromotionService service;
	
@GetMapping
public Page<PromotionDTO> getAllPromotion (Pageable pageable , PromotionFilterForm filterform){
	return service.getAllPromotion(pageable, filterform);
}
@PostMapping
public void createPromotion (@RequestBody CreatePromotion form) {
	service.createPromotion(form);
}
@PutMapping ("/{id}")
public void updatePromotion (@PathVariable Integer id, @RequestBody UpdatePromotion form) {
	service.updatePromotion(id, form);
}
@DeleteMapping ("{/id}")
public void deletePromotion (@PathVariable Integer id) {
	service.deletePromotion(id);
}

}
