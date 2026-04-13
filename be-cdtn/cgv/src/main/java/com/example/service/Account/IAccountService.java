package com.example.service.Account;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

import com.example.dto.AccountDTO;
import com.example.form.Account.AccountFilterForm;
import com.example.form.Account.CreateAccountForm;
import com.example.form.Account.UpdateAccountForm;

public interface IAccountService extends UserDetailsService {
	
	public AccountDTO getAccountByUserName(String usernName);
	
	Page<AccountDTO> getAllAccount (Pageable pageable , AccountFilterForm accountForm);
	
	AccountDTO getById (Integer id);
	
	void createAccount (CreateAccountForm form);
	
	void updateAccount (Integer id, UpdateAccountForm form);
	
	void deleteAccount (Integer id);
	
	
}
