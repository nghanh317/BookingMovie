package com.example.specification;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.entity.Cinemas;
import com.example.form.Cinema.CinemaFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class CinemaSpecification {

@SuppressWarnings({"deprecation","removal"})
public static Specification<Cinemas> buildWhere (CinemaFilterForm filterform){
	Specification<Cinemas> where = Specification.where(null);
	if (filterform == null)
		return where;
    if (filterform.getProvinceId() != null) {
        CustomSpecification provinceSpe = new CustomSpecification(
            "provinces.id", 
            filterform.getProvinceId()
        );
        where = where.and(provinceSpe);
    }
    
    if (filterform.getMovieId() != null) {
        CustomSpecification movieSpe = new CustomSpecification(
            "movies.id", 
            filterform.getMovieId()
        );
        where = where.and(movieSpe);
    }
    
    if (filterform.getDate() != null) {
        CustomSpecification dateSpe = new CustomSpecification(
            "rooms.slots.showTime", 
            filterform.getDate()
        );
        where = where.and(dateSpe);
    }
	if (!StringUtils.isEmpty(filterform.getSearch())) {
		String search = filterform.getSearch().trim();
		CustomSpecification cinemaNameSpecification = new CustomSpecification ("cinemaName", search);
		where = Specification.where(cinemaNameSpecification);
	}
	if (!StringUtils.isEmpty(filterform.getSearch())) {
		String search = filterform.getSearch().trim();
		CustomSpecification provinceNameSpecification = new CustomSpecification ("provinceName", search);
		where = Specification.where(provinceNameSpecification);
	}
	
	if (filterform.getStatus() != null) {
		CustomSpecification statusSpecification = new CustomSpecification ("status", filterform.getStatus());
		where = where.and(statusSpecification);
	}
	return where;
}


@SuppressWarnings ("serial")
@RequiredArgsConstructor
static class CustomSpecification implements Specification<Cinemas>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
	@Override
	public Predicate toPredicate (
			Root<Cinemas> root,
			CriteriaQuery<?> query,
			CriteriaBuilder criteriaBuilder
			) {
        query.distinct(true);
        
        if (field.equalsIgnoreCase("provinces.id")) {
            return criteriaBuilder.equal(
                root.join("provinces").get("id"), 
                value
            );
        }
        
        if (field.equalsIgnoreCase("movies.id")) {
            return criteriaBuilder.equal(
                root.join("movies").get("id"), 
                value
            );
        }
        
        if (field.equalsIgnoreCase("rooms.slots.showTime")) {
            LocalDate localDate = LocalDate.parse((String) value);
            Date startOfDay = Date.from(
                localDate.atStartOfDay(ZoneId.systemDefault()).toInstant()
            );
            Date endOfDay = Date.from(
                localDate.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant()
            );
            
            Expression<Date> showTimeField = root.join("rooms")
                .join("slots")
                .get("showTime");
            
            return criteriaBuilder.and(
                criteriaBuilder.greaterThanOrEqualTo(showTimeField, startOfDay),
                criteriaBuilder.lessThan(showTimeField, endOfDay)
            );
        }
		if (field.equalsIgnoreCase("cinemaName")) {
			return criteriaBuilder.like(root.get("cinemaName"), "%" + value.toString()+ "%");
		}
		if (field.equalsIgnoreCase("provinceName")) {
			return criteriaBuilder.like(root.get("provinceName"), "%" + value.toString()+ "%");
		}
		if (field.equalsIgnoreCase("status")) {
			return criteriaBuilder.equal(root.get("status"), value);
		}
		return null;
	}
}
}
