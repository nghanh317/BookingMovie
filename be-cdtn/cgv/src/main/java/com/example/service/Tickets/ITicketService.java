package com.example.service.Tickets;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.TicketDTO;
import com.example.form.Tickets.CreateTicketForm;
import com.example.form.Tickets.TicketFilterForm;
import com.example.form.Tickets.UpdateTicketForm;

public interface ITicketService {

	Page<TicketDTO> getAllTicket (Pageable pageable, TicketFilterForm filterform);
	
	TicketDTO getById (Integer id);
	
	void createTicket (CreateTicketForm form);
	
	void updateTicket (Integer id , UpdateTicketForm form);
	
	void deleteTicket (Integer id);
}
