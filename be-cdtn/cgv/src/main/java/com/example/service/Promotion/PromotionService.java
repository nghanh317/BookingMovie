package com.example.service.Promotion;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.PromotionDTO;
import com.example.entity.Promotions;
import com.example.form.Promotion.CreatePromotion;
import com.example.form.Promotion.PromotionFilterForm;
import com.example.form.Promotion.UpdatePromotion;
import com.example.repository.PromotionRepository;
import com.example.specification.PromotionSpecification;

@Service
public class PromotionService implements IPromotionService{
	
	@Autowired
	private PromotionRepository promotionRepository;
	
	@Autowired
	private ModelMapper modelMapper;

	@Override
	public Page<PromotionDTO> getAllPromotion(Pageable pageable, PromotionFilterForm filterform) {
		Specification<Promotions> where = PromotionSpecification.buildWhere(filterform);
		
		Page<Promotions> promotionPage = promotionRepository.findAll(where, pageable);
		
		List<PromotionDTO> dtos = modelMapper.map(
				promotionPage.getContent(),
				new TypeToken <List<Promotions>>() {}.getType());
		Page<PromotionDTO> dtoPage = new PageImpl<>(dtos, pageable, promotionPage.getTotalElements());
		return dtoPage;
	}

	@Override
	public void createPromotion(CreatePromotion form) {
		Promotions createPromotion = new Promotions(form.getPromotionCode(), form.getPromotionName(), form.getDescription(), form.getDiscountType(), form.getDiscountValue(), form.getMaxDiscountAmount(), form.getMinOrderAmount(), form.getUsageLimit(), form.getUsageCount(), form.getUsagePerUser(), form.getStartDate(), form.getEndDate(), form.getApplicableDay(), form.getApplicableMovie(), form.getApplicableCinema(), form.getStatus(), form.getImageUrl());
		promotionRepository.save(createPromotion);
		
	}

	@Override
	public void updatePromotion(Integer id, UpdatePromotion form) {
		Promotions updatePromotion = promotionRepository.findById(id).get();
		updatePromotion.setPromotionCode(form.getPromotionCode());
		updatePromotion.setPromotionName(form.getPromotionName());
		updatePromotion.setDescription(form.getDescription());
		updatePromotion.setDiscountType(form.getDiscountType());
		updatePromotion.setDiscountValue(form.getDiscountValue());
		updatePromotion.setMaxDiscountAmount(form.getMaxDiscountAmount());
		updatePromotion.setMinOrderAmount(form.getMinOrderAmount());
		updatePromotion.setUsageLimit(form.getUsageLimit());
		updatePromotion.setUsageCount(form.getUsageCount());
		updatePromotion.setUsagePerUser(form.getUsagePerUser());
		updatePromotion.setStartDate(form.getStartDate());
		updatePromotion.setEndDate(form.getEndDate());
		updatePromotion.setApplicableDay(form.getApplicableDay());
		updatePromotion.setApplicableMovie(form.getApplicableMovie());
		updatePromotion.setApplicableCinema(form.getApplicableCinema());
		updatePromotion.setStatus(form.getStatus());
		updatePromotion.setImageUrl(form.getImageUrl());
		
		promotionRepository.save(updatePromotion);
	}

	@Override
	public void deletePromotion (Integer id) {
		Promotions delete = promotionRepository.findById(id).get();
		delete.setIsDeleted(true);
		promotionRepository.save(delete);
		
	}

}
