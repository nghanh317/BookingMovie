package com.example.service.Promotion;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.PromotionDTO;
import com.example.form.Promotion.CreatePromotion;
import com.example.form.Promotion.PromotionFilterForm;
import com.example.form.Promotion.UpdatePromotion;

public interface IPromotionService {

	Page<PromotionDTO> getAllPromotion (Pageable pageable, PromotionFilterForm filterform);
	
	void createPromotion (CreatePromotion form);
	
	void updatePromotion (Integer id , UpdatePromotion form);
	
	void deletePromotion (Integer id);
}
