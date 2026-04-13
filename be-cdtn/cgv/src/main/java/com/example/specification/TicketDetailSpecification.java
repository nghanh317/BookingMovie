package com.example.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.TicketsDetails;
import com.example.form.TicketDetail.TicketDetailFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class TicketDetailSpecification {
	@SuppressWarnings ("removal")
	public static Specification<TicketsDetails> buildWhere (TicketDetailFilterForm form){
		Specification<TicketsDetails> where = Specification.where(null);
		
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
static class CustomSpecification implements Specification<TicketsDetails>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
@Override
public Predicate toPredicate (
		Root<TicketsDetails> root,
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
