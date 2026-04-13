package com.example.service.BookingSeat;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.BookingSeatDTO;
import com.example.entity.BookingSeats;
import com.example.entity.Seats;
import com.example.entity.Tickets;
import com.example.form.BookingSeat.BookingSeatFilterForm;
import com.example.form.BookingSeat.CreatBookingSeatForm;
import com.example.repository.BookingSeatRepository;
import com.example.specification.BookingSeatSpecification;

@Service
public class BookingSeatService implements IBookingSeatService{
	
	@Autowired
	private BookingSeatRepository bookingSeatRepository;
	
	@Autowired
	private ModelMapper modelMapper;

	@Override
	public Page<BookingSeatDTO> getAllBookingSeat(Pageable pageable , BookingSeatFilterForm form) {
		Specification<BookingSeats> where = BookingSeatSpecification.buildWhere(form);
		Page<BookingSeats> bookingSeatPage = bookingSeatRepository.findAll(where, pageable);
		List<BookingSeatDTO> dto = modelMapper.map(bookingSeatPage.getContent(),new TypeToken <List<BookingSeatDTO>>() {}.getType());
		Page<BookingSeatDTO> dtoPage = new PageImpl<>(dto, pageable, bookingSeatPage.getTotalElements());
		return dtoPage;
	}

	@Override
	public BookingSeatDTO getById(Integer id) {
		BookingSeats booking = bookingSeatRepository.findById(id).get();
		return modelMapper.map(booking, BookingSeatDTO.class);
}
	@Override
	public void create (CreatBookingSeatForm form) {
		BookingSeats bookingSeats = new BookingSeats(form.getSeatPrice());
		
		Tickets ticket = new Tickets();
		ticket.setId(form.getTicketsId());
		bookingSeats.setTickets(ticket);
		
		Seats seat = new Seats();
		seat.setId(form.getSeatsId());
		bookingSeats.setSeats(seat);
		
		bookingSeatRepository.save(bookingSeats);
	}
	
	

}
