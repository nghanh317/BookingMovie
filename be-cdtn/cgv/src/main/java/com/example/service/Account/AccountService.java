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

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AccountService implements IAccountService {

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
	public Page<AccountDTO> getAllAccount(Pageable pageable, AccountFilterForm accountForm) {
		Specification<Accounts> where = AccountSpecification.buildWhere(accountForm);
		Page<Accounts> accountPage = accountRepository.findAll(where, pageable);
		List<AccountDTO> dtos = modelMapper.map(
				accountPage.getContent(),
				new TypeToken<List<AccountDTO>>() {
				}.getType());

		for (int i = 0; i < accountPage.getContent().size(); i++) {
			calculateAccountMetrics(accountPage.getContent().get(i), dtos.get(i));
		}

		Page<AccountDTO> dtoPage = new PageImpl<>(dtos, pageable, accountPage.getTotalElements());

		return dtoPage;
	}

	@Override
	public AccountDTO getById(Integer id) {
		Accounts account = accountRepository.findById(id).get();
		AccountDTO dto = modelMapper.map(account, AccountDTO.class);
		calculateAccountMetrics(account, dto);
		return dto;
	}

	@Override
	public void createAccount(CreateAccountForm form) {
		if (accountRepository.findByUserName(form.getUserName()) != null) {
			throw new IllegalStateException("Tên đăng nhập đã tồn tại.");
		}
		if (accountRepository.findByEmail(form.getEmail()) != null) {
			throw new IllegalStateException("Email đã tồn tại.");
		}
		Accounts accounts = new Accounts(form.getUserName(), form.getPasswordHash(), form.getEmail(), form.getPhone(),
				form.getFullName());
		accountRepository.save(accounts);

	}

	@Override
	public void updateAccount(Integer id, UpdateAccountForm form) {
		Accounts updateAccount = accountRepository.findById(id).get();
		updateAccount.setUserName(form.getUserName());
		updateAccount.setEmail(form.getEmail());
		updateAccount.setPhone(form.getPhone());
		updateAccount.setFullName(form.getFullName());
		updateAccount.setRole(form.getRole());
		accountRepository.save(updateAccount);
	}

	@Override
	public void deleteAccount(Integer id) {
		Accounts deleteAccount = accountRepository.findById(id).get();
		deleteAccount.setIsDeleted(true);
		accountRepository.save(deleteAccount);
	}

	@Override
	public AccountDTO getAccountByUserName(String userName) {
		Accounts account = accountRepository.findByUserName(userName);
		AccountDTO dto = modelMapper.map(account, AccountDTO.class);
		calculateAccountMetrics(account, dto);
		return dto;
	}

	@Override
	public Accounts getAccountByEmail(String email) {
		return accountRepository.findByEmail(email);
	}

	@Override
	public void updatePasswordHash(Integer id, String newPasswordHash) {
		Accounts account = accountRepository.findById(id).get();
		account.setPasswordHash(newPasswordHash);
		accountRepository.save(account);
	}

	@Override
	public void redeemPoints(Integer id, Integer points) {
		Accounts account = accountRepository.findById(id).get();
		account.setHistoryPoints(account.getHistoryPoints() + points);
		accountRepository.save(account);
	}

	private void calculateAccountMetrics(Accounts account, AccountDTO dto) {
		java.math.BigDecimal total = java.math.BigDecimal.ZERO;
		int count = 0;
		if (account.getTickets() != null) {
			for (var ticket : account.getTickets()) {
				if (ticket.getPaymentStatus() == com.example.entity.Tickets.PaymentStatus.PAID
						&& (ticket.getIsDeleted() == null || !ticket.getIsDeleted())) {
					count++;
					if (ticket.getFinalAmount() != null) {
						total = total.add(ticket.getFinalAmount());
					}
				}
			}
		}
		dto.setSpent(total);
		dto.setBookings(count);
		long totalEarned = total.divideToIntegralValue(new java.math.BigDecimal("10000")).longValue();
		long history = account.getHistoryPoints() != null ? account.getHistoryPoints() : 0;
		long currentPoints = totalEarned - history;
		if (currentPoints < 0)
			currentPoints = 0;
		dto.setPoints(currentPoints);

		String level = "Bronze";
		if (totalEarned >= 1000)
			level = "Diamond";
		else if (totalEarned >= 300)
			level = "Gold";
		else if (totalEarned >= 100)
			level = "Silver";
		dto.setLevel(level);
	}

}
