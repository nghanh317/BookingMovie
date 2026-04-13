package com.example.specification;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.entity.Promotions;
import com.example.form.Promotion.PromotionFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class PromotionSpecification {
@SuppressWarnings({"removal", "deprecation"})
public static Specification<Promotions> buildWhere(PromotionFilterForm filterform){
	Specification<Promotions> where = Specification.where(null);
	
	if (filterform == null)
		return where;
	
	if (!StringUtils.isEmpty(filterform.getSearch())) {
		String search = filterform.getSearch().trim();
		
	CustomSpecification promotionSpe = new CustomSpecification("promotionName", search);
	where = Specification.where(promotionSpe);
	}
	if (filterform.getStatus() != null) {
		CustomSpecification statusSpe = new CustomSpecification ("status", filterform.getStatus());
		where = where.and(statusSpe);
	}
	return where;
}

@SuppressWarnings("serial")
@RequiredArgsConstructor

static class CustomSpecification implements Specification<Promotions>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
@Override
public Predicate toPredicate(
		Root<Promotions> root,
		CriteriaQuery<?> query,
		CriteriaBuilder criteriaBuilder
		) {
	if (field.equalsIgnoreCase("promotionName")) {
		return criteriaBuilder.like(root.get("promotionName"), "%" +value.toString()+ "%");
	}
	if (field.equalsIgnoreCase("status")) {
		return criteriaBuilder.equal(root.get("status"), value);
	}
	return null;
}
}
}
