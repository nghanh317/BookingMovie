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
import com.example.form.Tickets.BookingConfirmEmailForm;
import com.example.service.Mail.EmailService;
import com.example.service.Tickets.ITicketService;

@RestController
@RequestMapping ("api/v1/tickets")
public class TicketController {
	
	@Autowired
	private ITicketService ticketService;

	@Autowired
	private EmailService emailService;
	
	@GetMapping
	public Page<TicketDTO> getAllTicket (Pageable pageable,TicketFilterForm filterForm){
		return ticketService.getAllTicket(pageable, filterForm);
	}
	@Autowired
	private com.example.service.Payment.PayOSService payOSService;

	@GetMapping ("/{id}")
	public TicketDTO getById (@PathVariable Integer id) {
		payOSService.syncTicketStatusFromPayOS(id);
		return ticketService.getById(id);
	}
	
	@PostMapping
	public org.springframework.http.ResponseEntity<?> createTicket (@RequestBody CreateTicketForm form) {
		com.example.entity.Tickets ticket = ticketService.createTicket(form);
		return org.springframework.http.ResponseEntity.ok(ticket);
	}
	@PutMapping ("/{id}")
	public void updateTicket (@PathVariable Integer id, @RequestBody UpdateTicketForm form) {
		ticketService.updateTicket(id, form);
		
	}
	@DeleteMapping ("/{id}")
	public void deleteTicket (@PathVariable Integer id) {
		ticketService.deleteTicket(id);
	}

	@PostMapping("/send-confirm-email")
	public org.springframework.http.ResponseEntity<?> sendConfirmEmail(@RequestBody BookingConfirmEmailForm form) {
		emailService.sendBookingConfirmEmail(form);
		return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Đã gửi email xác nhận"));
	}
}
