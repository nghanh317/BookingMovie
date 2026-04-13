package com.example.specification;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.entity.Products;
import com.example.form.Product.ProductFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class ProductSpecification {
@SuppressWarnings ({"deprecation", "removal"})
public static Specification<Products> buildWhere (ProductFilterForm filterform) {
	Specification<Products> where = Specification.where(null);
	if (filterform == null)
		return where;
	if (!StringUtils.isEmpty(filterform.getSearch())) {
		String search = filterform.getSearch().trim();
	CustomSpecification nameSpecification = new CustomSpecification ("productName", search);
	where = Specification.where(nameSpecification);
	}
	if (filterform.getCategory() != null) {
		CustomSpecification categorySpecification = new CustomSpecification ("category", filterform.getCategory());
		where = where.and(categorySpecification);
	}
	return where;
} 


@SuppressWarnings ("serial")
@RequiredArgsConstructor
static class CustomSpecification implements Specification<Products>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
	@Override
public Predicate toPredicate (
		Root<Products> root,
		CriteriaQuery<?> query,
		CriteriaBuilder criteriaBuilder
		) {
		if (field.equalsIgnoreCase("productName")) {
			return criteriaBuilder.like(root.get("productName"), "%" +value.toString()+ "%");
		}
		if (field.equalsIgnoreCase("category")) {
			return criteriaBuilder.equal(root.get("category"), value);
		}
		return null;
	}
}
}
