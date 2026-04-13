package com.example.service.PromotionUsage;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.dto.PromotionUsageDTO;
import com.example.entity.PromotionUsage;
import com.example.repository.PromotionUsageRepository;

@Service
public class PromotionUsageService implements IPromotionUsageService{
	
	@Autowired
	private PromotionUsageRepository promotionUsageRepository;
	
	@Autowired
	private ModelMapper modelMapper;

	@Override
	public Page<PromotionUsageDTO> getAllPromotionUsage(Pageable pageable) {
		Page<PromotionUsage> promotionUsagePage = promotionUsageRepository.findAll(pageable);
		List<PromotionUsageDTO> dtos = modelMapper.map(
				promotionUsagePage.getContent(),
				new TypeToken <List<PromotionUsageDTO>>() {}.getType());
		Page<PromotionUsageDTO> dtoPage = new PageImpl<>(dtos, pageable, promotionUsagePage.getTotalElements());
		return dtoPage;
	}

	@Override
	public void delete(Integer id) {
		promotionUsageRepository.findById(id).get();
	}
	


}
