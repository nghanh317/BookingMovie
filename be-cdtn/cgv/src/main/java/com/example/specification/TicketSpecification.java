package com.example.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.Tickets;
import com.example.form.Tickets.TicketFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class TicketSpecification {
@SuppressWarnings ({"removal"})
public static Specification<Tickets> buildWhere (TicketFilterForm filterform){
	Specification<Tickets> where = Specification.where(null);
	if (filterform == null)
		return where;
	
	if (filterform.getPaymentStatus() !=null) {
		CustomSpecification paymentStatusSpecification = new CustomSpecification ("paymentStatus", filterform.getPaymentStatus());
		where = where.and(paymentStatusSpecification);
	}
	if (filterform.getStatus() != null) {
		CustomSpecification statusSpecification = new CustomSpecification ("status", filterform.getStatus());
		where = where.and(statusSpecification);
	}
	
	if (filterform.getAccountId() != null) {
		CustomSpecification accountIdSpe = new CustomSpecification ("accounts.id", filterform.getAccountId());
		where = where.and(accountIdSpe);
	}
	return where;
}

@SuppressWarnings ("serial")
@RequiredArgsConstructor
static class CustomSpecification implements Specification<Tickets>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
	@Override
	
	public Predicate toPredicate (
			Root<Tickets> root,
			CriteriaQuery<?> query,
			CriteriaBuilder criteriaBuilder
			) {
		if (field.equalsIgnoreCase("paymentStatus")) {
			return criteriaBuilder.equal(root.get("paymentStatus"), value);
		}
		if (field.equalsIgnoreCase("status")) {
			return criteriaBuilder.equal(root.get("status"), value);
		}
		if (field.equalsIgnoreCase("accounts.id")) {
			return criteriaBuilder.equal(root.get("accounts").get("id"), value);
		}
		return null;
	}
	
}
}
