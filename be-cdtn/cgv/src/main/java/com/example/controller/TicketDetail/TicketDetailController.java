package com.example.controller.TicketDetail;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.TicketDetailDTO;
import com.example.form.TicketDetail.CreateTicketDetail;
import com.example.form.TicketDetail.TicketDetailFilterForm;
import com.example.service.TicketDetail.ITicketDetailService;

@RestController
@RequestMapping("api/v1/ticketDetails")
public class TicketDetailController {
	
	@Autowired
	private ITicketDetailService service;
	
	@GetMapping
	public Page<TicketDetailDTO> getAllTicketDetail (Pageable pageable, TicketDetailFilterForm form){
		return service.getAllTicketDetail(pageable, form);
	}
	@GetMapping("/{id}")
	public TicketDetailDTO getById (@PathVariable Integer id) {
		return service.getById(id);
	}
	@PostMapping 
	public void create (@RequestBody CreateTicketDetail form) {
		 service.create(form);
	}
}
