package com.example.service.TicketDetail;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.TicketDetailDTO;
import com.example.form.TicketDetail.CreateTicketDetail;
import com.example.form.TicketDetail.TicketDetailFilterForm;

public interface ITicketDetailService {
	
	Page<TicketDetailDTO> getAllTicketDetail (Pageable pageable , TicketDetailFilterForm form);
	
	TicketDetailDTO getById (Integer id);
	
	void create (CreateTicketDetail form);

}
