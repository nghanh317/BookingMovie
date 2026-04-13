package com.example.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.BookingSeats;
import com.example.form.BookingSeat.BookingSeatFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class BookingSeatSpecification {
	@SuppressWarnings ("removal")
	public static Specification<BookingSeats> buildWhere (BookingSeatFilterForm form){
		Specification<BookingSeats> where = Specification.where(null);
		
		if (form == null)
			return where;
		
		if (form.getTicketsId() != null) {
			CustomSpecification ticketIdSpe =new CustomSpecification("tickets.id", form.getTicketsId());
			
			where = where.and(ticketIdSpe);
			
		}
		return where;
	}
	
@SuppressWarnings ("serial")
@RequiredArgsConstructor
static class CustomSpecification implements Specification<BookingSeats>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
@Override
public Predicate toPredicate (
		Root<BookingSeats> root,
		CriteriaQuery<?> query,
		CriteriaBuilder criteriaBuilder
		) {
	if (field.equalsIgnoreCase("tickets.id")) {
		return criteriaBuilder.equal(root.get("tickets").get("id"), value);
	}
	return null;
}
}	
}
