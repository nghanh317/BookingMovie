package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.Accounts;

@Repository
public interface AccountRepository extends JpaRepository<Accounts, Integer>, JpaSpecificationExecutor<Accounts>{
	
	Accounts findByUserName (String userName);
	
	Accounts findByEmail ( String email);
	
	Accounts findByPhone (String phone);
	
	List<Accounts> findByRole (Accounts.Role role);
	
	boolean existsByUserName (String userName);
	
	boolean existsByEmail (String email);
	
	boolean existsByPhone (String phone);
	
	
}
