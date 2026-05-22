package com.example.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.CinemaReviews;
import com.example.form.CinemaReview.CinemaReviewFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class CinemaReviewSpecification {

	@SuppressWarnings({ "removal"})
	public static Specification<CinemaReviews> buildWhere (CinemaReviewFilterForm filterform){
		Specification<CinemaReviews> where = Specification.where(null);
		if (filterform == null)
			return where;
	if (filterform.getRating() != null) {
		CustomSpecification ratingSpe = new CustomSpecification ("rating" , filterform.getRating());
		where = where.and(ratingSpe);
	}
	
	
	return where;
	}
	
	@SuppressWarnings ("serial")
	@RequiredArgsConstructor
	static class CustomSpecification implements Specification<CinemaReviews>{
		
		@NonNull
		private String field;
		
		@NonNull
		private Object value;
		
		@Override
		public Predicate toPredicate (
			Root<CinemaReviews> root,
			CriteriaQuery<?> query,
			CriteriaBuilder criteriaBuilder
				) {
		if ( field.equalsIgnoreCase("rating")) {
			return criteriaBuilder.equal(root.get("rating"), value);
		}
		return null;
		}
		
	}
}
