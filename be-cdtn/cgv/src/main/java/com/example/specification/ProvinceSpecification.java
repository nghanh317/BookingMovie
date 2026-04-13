package com.example.specification;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.Provinces;
import com.example.form.Province.ProvinceFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class ProvinceSpecification {
@SuppressWarnings("removal")
public static Specification<Provinces> buildWhere(ProvinceFilterForm filterform){
	Specification<Provinces> where = Specification.where(null);
	
	if (filterform == null)
		return where;
	
	if (filterform.getProvinceName() != null) {
		CustomSpecification nameSpe = new CustomSpecification("provinceName" , filterform.getProvinceName());
		where = where.and(nameSpe);
	}
	if (filterform.getCinemaName() != null) {
		CustomSpecification cinemaIdSpe = new CustomSpecification("cinemas.cinemaName" , filterform.getCinemaName());
		where = where.and(cinemaIdSpe);
	}
	if (filterform.getRoomId() != null) {
		CustomSpecification roomSpe = new CustomSpecification("cinemas.rooms.id" , filterform.getRoomId());
		where = where.and(roomSpe);
	}
	if (filterform.getSlotId() != null) {
		CustomSpecification slotSpe = new CustomSpecification("cinemas.rooms.slot.id" , filterform.getSlotId());
		where = where.and(slotSpe);
	}
	
	if (filterform.getMovieId() != null) {
	    CustomSpecification movieIdSpe = new CustomSpecification(
	        "cinemas.movieCinemas.movie.id", 
	        filterform.getMovieId()
	    );
	    where = where.and(movieIdSpe);
	}
	if (filterform.getDate() != null) {
		CustomSpecification dateSpe = new CustomSpecification ("date.id", filterform.getDate());
		where = where.and(dateSpe);
	}
	if (filterform.getDate() != null) {
	    CustomSpecification dateSpe = new CustomSpecification(
	        "cinemas.rooms.slots.showTime", 
	        filterform.getDate()
	    );
	    where = where.and(dateSpe);
	}
	return where;
}

@SuppressWarnings("serial")
@RequiredArgsConstructor
static class CustomSpecification implements Specification<Provinces>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
	@Override
	public Predicate toPredicate (
			Root<Provinces> root,
			CriteriaQuery<?> query,
			CriteriaBuilder criteriaBuilder
			) {
		if (field.equalsIgnoreCase("provinceName")) {
			return criteriaBuilder.equal(root.get("provinceName"), value);
		}
		if (field.equalsIgnoreCase("cinemas.cinemaName")) {
			return criteriaBuilder.equal(root.join("cinemas").get("cinemaName"), value);
		}
		if (field.equalsIgnoreCase("cinemas.rooms.id")) {
			return criteriaBuilder.equal(root.join("cinemas").join("rooms").get("id"), value);
		}
		if (field.equalsIgnoreCase("cinemas.rooms.slots.id")) {
			return criteriaBuilder.equal(root.join("cinemas").join("rooms").join("slots").get("id"), value);
		}
		if (field.equalsIgnoreCase("cinemas.movieCinemas.movie.id")) {
		    return criteriaBuilder.equal(
		        root.join("cinemas")
		            .join("movieCinemas")  
		            .join("movies")       
		            .get("id"),
		        value
		    );
		}
		if (field.equalsIgnoreCase("cinemas.rooms.slots.showTime")) {
		    LocalDate localDate = LocalDate.parse((String) value);
		    Date startOfDay = Date.from(
		        localDate.atStartOfDay(ZoneId.systemDefault()).toInstant()
		    );
		    Date endOfDay = Date.from(
		        localDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()
		    );
		    
		    Expression<Date> showTimeField = root.join("cinemas")
		        .join("rooms")
		        .join("slots")
		        .get("showTime");

		    return criteriaBuilder.and(
		        criteriaBuilder.greaterThanOrEqualTo(showTimeField, startOfDay),
		        criteriaBuilder.lessThan(showTimeField, endOfDay)
		    );
		}
		return null;
	}
}
}
