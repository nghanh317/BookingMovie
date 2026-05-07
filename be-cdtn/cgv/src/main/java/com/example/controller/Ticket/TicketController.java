package com.example.controller.Ticket;

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

import com.example.dto.TicketDTO;
import com.example.form.Tickets.CreateTicketForm;
import com.example.form.Tickets.TicketFilterForm;
import com.example.form.Tickets.UpdateTicketForm;
import com.example.service.Tickets.ITicketService;

@RestController
@RequestMapping ("api/v1/tickets")
public class TicketController {
	
	@Autowired
	private ITicketService ticketService;
	
	@GetMapping
	public Page<TicketDTO> getAllTicket (Pageable pageable,TicketFilterForm filterForm){
		return ticketService.getAllTicket(pageable, filterForm);
	}
	@GetMapping ("/{id}")
	public TicketDTO getById (@PathVariable Integer id) {
		return ticketService.getById(id);
	}
	
	@PostMapping
	public void createTicket (@RequestBody  CreateTicketForm form) {
		ticketService.createTicket(form);
	}
	@PutMapping ("/{id}")
	public void updateTicket (@PathVariable Integer id, @RequestBody UpdateTicketForm form) {
		ticketService.updateTicket(id, form);
		
	}
	@DeleteMapping ("/{id}")
	public void deleteTicket (@PathVariable Integer id) {
		ticketService.deleteTicket(id);
	}
}
