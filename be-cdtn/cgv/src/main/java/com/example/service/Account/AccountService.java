package com.example.service.Account;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.dto.AccountDTO;
import com.example.entity.Accounts;
import com.example.form.Account.AccountFilterForm;
import com.example.form.Account.CreateAccountForm;
import com.example.form.Account.UpdateAccountForm;
import com.example.repository.AccountRepository;
import com.example.specification.AccountSpecification;


@Service
public class AccountService implements IAccountService{
	
	@Autowired
	private AccountRepository accountRepository;
	
	@Autowired
	private ModelMapper modelMapper;
	@Override
	public UserDetails loadUserByUsername(String userName) throws UsernameNotFoundException {

		Accounts account = accountRepository.findByUserName(userName);

		if (account == null) {
			throw new UsernameNotFoundException(userName);
		}

		return new User(
				account.getUserName(), 
				account.getPasswordHash(), 
				AuthorityUtils.createAuthorityList(account.getRole().toString()));
	}
	
	@Override
	public Page<AccountDTO> getAllAccount (Pageable pageable, AccountFilterForm accountForm){
		Specification<Accounts> where = AccountSpecification.buildWhere(accountForm);
		Page<Accounts> accountPage = accountRepository.findAll(where,pageable);
		List<AccountDTO> dtos = modelMapper.map(
				accountPage.getContent(), 
				new TypeToken<List<AccountDTO>>() {}.getType());

		Page<AccountDTO> dtoPage = new PageImpl<>(dtos, pageable, accountPage.getTotalElements());

		return dtoPage;
	}
	
	@Override
	public AccountDTO getById (Integer id) {
		Accounts account = accountRepository.findById(id).get();
		return modelMapper.map(account, AccountDTO.class);
	}
	
	@Override
	public void createAccount (CreateAccountForm form) {
		Accounts accounts = new Accounts(form.getUserName(), form.getPasswordHash(), form.getEmail(), form.getPhone(), form.getFullName());
		accountRepository.save(accounts);
		
	}
	
	@Override
	public void updateAccount (Integer id, UpdateAccountForm form) {
		Accounts updateAccount = accountRepository.findById(id).get();
		updateAccount.setUserName(form.getUserName());
		updateAccount.setEmail(form.getEmail());
		updateAccount.setPhone(form.getPhone());
		updateAccount.setFullName(form.getFullName());
		updateAccount.setRole(form.getRole());
		accountRepository.save(updateAccount);
	}
	
	@Override
	public void deleteAccount (Integer id) {
		Accounts deleteAccount =  accountRepository.findById(id).get();
		deleteAccount.setIsDeleted(true);
		accountRepository.save(deleteAccount);
	}

	@Override
	public AccountDTO getAccountByUserName(String userName) {
		Accounts nameAccount = accountRepository.findByUserName(userName);
		return modelMapper.map(nameAccount, AccountDTO.class);
	}
	

}
