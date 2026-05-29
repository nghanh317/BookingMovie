package com.example.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.MovieReviews;
import com.example.form.MovieReview.MovieReviewFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class MovieReviewSpecification {

	@SuppressWarnings({ "removal"})
	public static Specification<MovieReviews> buildWhere (MovieReviewFilterForm filterform){
		Specification<MovieReviews> where = Specification.where(null);
		if (filterform == null)
			return where;
	if (filterform.getRating() != null) {
		CustomSpecification ratingSpe = new CustomSpecification ("rating" , filterform.getRating());
		where = where.and(ratingSpe);
	}
	
	if (filterform.getMovieId() != null) {
		CustomSpecification movieSpe = new CustomSpecification("movieId", filterform.getMovieId());
		where = where.and(movieSpe);
	}
	
	return where;
	}
	
	@SuppressWarnings ("serial")
	@RequiredArgsConstructor
	static class CustomSpecification implements Specification<MovieReviews>{
		
		@NonNull
		private String field;
		
		@NonNull
		private Object value;
		
		@Override
		public Predicate toPredicate (
			Root<MovieReviews> root,
			CriteriaQuery<?> query,
			CriteriaBuilder criteriaBuilder
				) {
		if ( field.equalsIgnoreCase("rating")) {
			return criteriaBuilder.equal(root.get("rating"), value);
		}
		
		if (field.equalsIgnoreCase("movieId")) {
			return criteriaBuilder.equal(root.get("movie").get("id"), value);
		}
		
		return null;
		}
		
	}
}
