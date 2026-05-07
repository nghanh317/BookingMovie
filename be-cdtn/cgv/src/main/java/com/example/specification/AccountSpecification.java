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

public class AccountSpecification {

	@SuppressWarnings({"deprecation", "removal"})
	
	public static Specification<Accounts> buildWhere (AccountFilterForm accountForm){
		Specification<Accounts> where = null;
		CustomSpecification notDeleteSpe = new CustomSpecification("isDelete", false);
		where = notDeleteSpe;
		if (accountForm == null)
			return where;
		
		if (!StringUtils.isEmpty(accountForm.getSearch())) {
			String search = accountForm.getSearch();
			search =search.trim();
			CustomSpecification nameSpecification = new CustomSpecification ("userName", search);
			where = Specification.where(nameSpecification);
		}
		
		if (!StringUtils.isEmpty(accountForm.getSearch())) {
			String search = accountForm.getSearch();
			search =search.trim();
			CustomSpecification phoneSpecification = new CustomSpecification ("phone", search);
			where = Specification.where(phoneSpecification);
		}
		if (!StringUtils.isEmpty(accountForm.getSearch())) {
			String search = accountForm.getSearch();
			search =search.trim();
			CustomSpecification fullNameSpecification = new CustomSpecification ("fullName", search);
			where = Specification.where(fullNameSpecification);
		}
		
		if (accountForm.getRole() != null) {
			CustomSpecification	roleSpecification = new CustomSpecification("role" , accountForm.getRole());
			where = where.and(roleSpecification);
			}
		return where;
	}
		
	
	@SuppressWarnings ("serial")
	@RequiredArgsConstructor
	static class CustomSpecification implements Specification<Accounts>{
		
		@NonNull
		private String field;
		
		@NonNull
		private Object value;
		
		@Override 
		
		public Predicate toPredicate (
			Root<Accounts> root,
			CriteriaQuery<?> query,
			CriteriaBuilder criteriaBuilder
				) {
			if (field.equalsIgnoreCase("userName")) {
				return criteriaBuilder.like(root.get("userName"), "%" +value.toString() + "%");
			}
			if (field.equalsIgnoreCase("phone")) {
				return criteriaBuilder.like(root.get("phone"), "%" +value.toString()+ "%");
			}
			if (field.equalsIgnoreCase("fullName")) {
				return criteriaBuilder.like(root.get("fullName"), "%" +value.toString()+ "%");
			}
            if (field.equalsIgnoreCase("isDeleted")) {  
                return criteriaBuilder.equal(root.get("isDeleted"), value);
            }
            if (field.equalsIgnoreCase("role")) {
            	return criteriaBuilder.equal(root.get("role"), value);
            }
			return  null;
			
		}
	}
}
