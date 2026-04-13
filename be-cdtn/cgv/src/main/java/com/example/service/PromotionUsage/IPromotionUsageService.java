package com.example.service.PromotionUsage;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.PromotionUsageDTO;

public interface IPromotionUsageService {

	Page<PromotionUsageDTO> getAllPromotionUsage (Pageable pageable);
	
	void delete(Integer id);
}
