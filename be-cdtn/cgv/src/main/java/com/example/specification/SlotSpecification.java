package com.example.specification;

import java.util.Date;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.Slots;
import com.example.form.Slot.SlotFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class SlotSpecification {
	
	@SuppressWarnings("removal")
	public static Specification<Slots> buildWhere(SlotFilterForm filterform) {
		Specification<Slots> where = Specification.where(null);
		
		if (filterform == null)
			return where;
		
		if (filterform.getDate() != null) {
			CustomSpecification dateSpecification = new CustomSpecification("showTime", filterform.getDate());
			where = where.and(dateSpecification);
		}
		
		if (filterform.getCinemaId() != null) {
			CustomSpecification cinemaIdSpe = new CustomSpecification("rooms.cinemas.id",filterform.getCinemaId() );
			where = where.and(cinemaIdSpe);
		}
		if (filterform.getMovieId() != null) {
			CustomSpecification movieIdSpe = new CustomSpecification("movies.id", filterform.getMovieId());
			where = where.and(movieIdSpe);
		}
		if (filterform.getProvinceId() != null) {
			CustomSpecification provinceIdSpe = new CustomSpecification("rooms.cinemas.provinces.id", filterform.getProvinceId());
			where = where.and(provinceIdSpe);
		}
		return where;
	}

	@SuppressWarnings("serial")
	@RequiredArgsConstructor
	static class CustomSpecification implements Specification<Slots> {
		
		@NonNull
		private String field;
		
		@NonNull
		private Object value;
		
		@Override
		public Predicate toPredicate(
				Root<Slots> root,
				CriteriaQuery<?> query,
				CriteriaBuilder criteriaBuilder) {
			
			if (field.equalsIgnoreCase("showTime")) {
				Date date = (Date) value;
				return criteriaBuilder.equal(
					criteriaBuilder.function("DATE", Date.class, root.get(field)),
					criteriaBuilder.function("DATE", Date.class, criteriaBuilder.literal(date))
				);
			}
			if (field.equalsIgnoreCase("rooms.cinemas.id")) {
				return criteriaBuilder.equal(
					root.get("rooms").get("cinemas").get("id"), 
					value
				);
			}
			
			if (field.equalsIgnoreCase("movies.id")) {
				return criteriaBuilder.equal(
					root.get("movies").get("id"), 
					value
				);
			}
			if (field.equalsIgnoreCase("rooms.cinemas.provinces.id")) {
				return criteriaBuilder.equal(
					root.get("rooms").get("cinemas").get("provinces").get("id"), 
					value
				);
			}
			return null;
		}
	}
}