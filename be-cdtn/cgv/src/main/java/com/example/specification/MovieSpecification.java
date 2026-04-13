package com.example.specification;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.entity.Movies;
import com.example.form.Movie.MovieFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class MovieSpecification {

@SuppressWarnings({"deprecation", "removal"})
public static Specification<Movies> buildWhere(MovieFilterForm filterform){
	Specification<Movies> where = Specification.where(null);

	if (filterform == null)
		return where;
	if (filterform.getTitle() != null) {

		CustomSpecification titleSpecification = new CustomSpecification ("title", filterform.getTitle());
		where = where.and(titleSpecification);
	}
	if (!StringUtils.isEmpty(filterform.getSearch())) {
		String search = filterform.getSearch();
		search = search.trim();
		CustomSpecification genreSpecification = new CustomSpecification ("genre", search);
		where = Specification.where(genreSpecification);
	}
	
	if (filterform.getStatus() != null) {
		CustomSpecification statusSpecification = new CustomSpecification ("status", filterform.getStatus());
		where = where.and(statusSpecification);
	}
	return where;
	}

@SuppressWarnings ("serial")
@RequiredArgsConstructor
static class CustomSpecification implements Specification<Movies>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
	@Override
	public Predicate toPredicate (
			Root<Movies> root,
			CriteriaQuery<?> query ,
			CriteriaBuilder criteriaBuilder
			) {
		if (field.equalsIgnoreCase("title")) {
			return criteriaBuilder.equal(root.get("title"), value);
		}
		if (field.equalsIgnoreCase("genre")) {
			return criteriaBuilder.like(root.get("genre"), "%" +value.toString()+ "%");
		}
		if (field.equalsIgnoreCase("status")) {
			return criteriaBuilder.equal(root.get("status"), value);
		}
		return null;
	}
	
}
}
