package com.example.controller.Account;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.AccountDTO;
import com.example.form.Account.AccountFilterForm;
import com.example.form.Account.CreateAccountForm;
import com.example.form.Account.UpdateAccountForm;
import com.example.service.Account.IAccountService;

@RestController
@RequestMapping (value = "api/v1/accounts")
public class AccountController {

	@Autowired
	private IAccountService service;
	
	@GetMapping
	public Page<AccountDTO> getAllAccount (Pageable pageable, AccountFilterForm accountForm){
		return service.getAllAccount(pageable, accountForm);
	}
	
//	@GetMapping("/{userName}")
//	public AccountDTO getAccountByUserName(@PathVariable String userName) {
//		return service.getAccountByUserName(userName);
//	}
	@GetMapping ("/{id}")
	public AccountDTO getById (@PathVariable Integer id) {
		return service.getById(id);
	}
	
	@PostMapping
	public void createAccount (@RequestBody CreateAccountForm form) {
		service.createAccount(form);
	}
	
	@PutMapping("/{id}")
	public void upadateAccount (@PathVariable (name = "id") Integer id,@RequestBody UpdateAccountForm form) {
		service.updateAccount(id, form);
	}
	
	@DeleteMapping ("/{id}")
	public void deleteAccount (@PathVariable (name = "id") Integer id) {
		service.deleteAccount(id);
	}
	
	
}