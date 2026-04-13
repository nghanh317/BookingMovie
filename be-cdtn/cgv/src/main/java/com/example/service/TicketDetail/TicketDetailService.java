package com.example.service.TicketDetail;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.TicketDetailDTO;
import com.example.entity.Products;
import com.example.entity.Tickets;
import com.example.entity.TicketsDetails;
import com.example.form.TicketDetail.CreateTicketDetail;
import com.example.form.TicketDetail.TicketDetailFilterForm;
import com.example.repository.TicketDetailRepository;
import com.example.specification.TicketDetailSpecification;

@Service
public class TicketDetailService implements ITicketDetailService{
	
	@Autowired
	private TicketDetailRepository ticketDetailRepository;

	@Override
	public Page<TicketDetailDTO> getAllTicketDetail(Pageable pageable, TicketDetailFilterForm form) {
		Specification<TicketsDetails> where = TicketDetailSpecification.buildWhere(form);
		Page<TicketsDetails> ticketDetailPage = ticketDetailRepository.findAll(where, pageable);
		List<TicketDetailDTO> dtos = ticketDetailPage.getContent().stream().map(tk ->{
			TicketDetailDTO dto = new TicketDetailDTO();
			dto.setId(tk.getId());
			if (tk.getTickets() != null) {
				dto.setTicketId(tk.getTickets().getId());
			}
			if (tk.getProducts() != null) {
				dto.setProductId(tk.getProducts().getId());
			}
			dto.setQuantity(tk.getQuantity());
			dto.setUnitPrice(tk.getUnitPrice());
			dto.setTotalPrice(tk.getTotalPrice());
			return dto;
		}).collect(Collectors.toList());
		return new PageImpl<>(dtos, pageable, ticketDetailPage.getTotalElements());
	}

	@Override
	public TicketDetailDTO getById(Integer id) {
		TicketsDetails tk = ticketDetailRepository.findById(id).get();
		TicketDetailDTO dto = new TicketDetailDTO();
		dto.setId(tk.getId());
		if (tk.getTickets() != null) {
			dto.setTicketId(tk.getTickets().getId());
		}
		if (tk.getProducts() != null) {
			dto.setProductId(tk.getProducts().getId());
		}
		dto.setQuantity(tk.getQuantity());
		dto.setUnitPrice(tk.getUnitPrice());
		dto.setTotalPrice(tk.getTotalPrice());
		return dto;
	}
	
	@Override
	public void create (CreateTicketDetail form) {
		TicketsDetails td = new TicketsDetails(form.getQuantity(), form.getUnitPrice(), form.getTotalPrice());
		
		Tickets ticket = new Tickets();
		ticket.setId(form.getTicketId());
		td.setTickets(ticket);
		
		Products product = new Products();
		product.setId(form.getProductId());
		td.setProducts(product);
		
		ticketDetailRepository.save(td);
	}

}
