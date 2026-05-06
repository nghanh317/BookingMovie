package com.example.specification;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.entity.Accounts;
import com.example.form.Account.AccountFilterForm;
import lombok.NonNull;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import java.util.ArrayList;
import java.util.List;

public class AccountSpecification {

	@SuppressWarnings({"deprecation", "removal"})
	public static Specification<Accounts> buildWhere(AccountFilterForm accountForm) {
		Specification<Accounts> where = Specification.where(new CustomSpecification("isDeleted", false));
		
		if (accountForm == null) {
			return where;
		}

		// Xử lý tìm kiếm (Search) theo nhiều trường: userName OR phone OR fullName
		if (StringUtils.hasText(accountForm.getSearch())) {
			final String search = accountForm.getSearch().trim();
			
			Specification<Accounts> searchSpec = Specification.where(new CustomSpecification("userName", search))
					.or(new CustomSpecification("phone", search))
					.or(new CustomSpecification("fullName", search));
			
			where = where.and(searchSpec);
		}

		// Lọc theo Role
		if (accountForm.getRole() != null) {
			where = where.and(new CustomSpecification("role", accountForm.getRole()));
		}

		return where;
	}

	@SuppressWarnings("serial")
	@RequiredArgsConstructor
	static class CustomSpecification implements Specification<Accounts> {
		@NonNull
		private String field;
		@NonNull
		private Object value;

		@Override
		public Predicate toPredicate(Root<Accounts> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
			if (field.equalsIgnoreCase("userName")) {
				return criteriaBuilder.like(root.get("userName"), "%" + value.toString() + "%");
			}
			if (field.equalsIgnoreCase("phone")) {
				return criteriaBuilder.like(root.get("phone"), "%" + value.toString() + "%");
			}
			if (field.equalsIgnoreCase("fullName")) {
				return criteriaBuilder.like(root.get("fullName"), "%" + value.toString() + "%");
			}
			if (field.equalsIgnoreCase("isDeleted")) {
				return criteriaBuilder.equal(root.get("isDeleted"), value);
			}
			if (field.equalsIgnoreCase("role")) {
				return criteriaBuilder.equal(root.get("role"), value);
			}
			return null;
		}
	}
}
