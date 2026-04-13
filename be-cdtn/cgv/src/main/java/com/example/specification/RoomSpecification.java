package com.example.specification;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.entity.Rooms;
import com.example.form.Room.RoomFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class RoomSpecification {
@SuppressWarnings ({"deprecation", "removal"})
public static Specification<Rooms> buildWhere (RoomFilterForm filterform){
	Specification<Rooms> where = Specification.where(null);
	if (filterform == null)
		return where;
	
	if (!StringUtils.isEmpty(filterform.getSearch())) {
		String search = filterform.getSearch().trim();
		CustomSpecification nameSpecification = new CustomSpecification ("roomName", search);
		where = Specification.where(nameSpecification);
	}
	if (filterform.getRoomId() != null) {
		CustomSpecification statusSpecification = new CustomSpecification ("Id", filterform.getRoomId());
		where = where.and(statusSpecification);
	}
	if (filterform.getSeatId() != null) {
		CustomSpecification seatIdSpe = new CustomSpecification("seats.id", filterform.getSeatId());
		where = where.and(seatIdSpe);
	}
	return where;
}


@SuppressWarnings("serial")
@RequiredArgsConstructor
static class CustomSpecification implements Specification<Rooms>{
	
	@NonNull
	private String field;
	
	@NonNull
	private Object value;
	
	@Override
	public Predicate toPredicate (
		Root<Rooms> root,
		CriteriaQuery<?> query,
		CriteriaBuilder criteriaBuilder
			) {
		if (field.equalsIgnoreCase("roomName")) {
			return criteriaBuilder.like(root.get("roomName"), "%" +value.toString()+ "%");
		}
		if (field.equalsIgnoreCase("Id")) {
			return criteriaBuilder.equal(root.get("Id"), value);
		}
		if (field.equalsIgnoreCase("seats.id")) {
			return criteriaBuilder.equal(root.join("seats").get("id"), value);
		}
		return null;
	}
}
}
