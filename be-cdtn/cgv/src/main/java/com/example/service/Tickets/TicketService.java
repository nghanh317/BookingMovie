package com.example.service.Tickets;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.TicketDTO;
import com.example.entity.Accounts;
import com.example.entity.BookingSeats;
import com.example.entity.Products;
import com.example.entity.Seats;
import com.example.entity.Seats.Status;
import com.example.entity.Slots;
import com.example.entity.Tickets;
import com.example.entity.TicketsDetails;
import com.example.form.Tickets.CreateTicketForm;
import com.example.form.Tickets.TicketFilterForm;
import com.example.form.Tickets.UpdateTicketForm;
import com.example.repository.BookingSeatRepository;
import com.example.repository.ProductRepository;
import com.example.repository.SeatRepository;
import com.example.repository.SlotRepository;
import com.example.repository.TicketDetailRepository;
import com.example.repository.TicketRepository;
import com.example.specification.TicketSpecification;

@Service
public class TicketService implements ITicketService{
	
	@Autowired
	private TicketRepository ticketRepository;

	@Autowired
	private BookingSeatRepository bookingSeatRepository;
	
	@Autowired
	private SeatRepository seatRepository;
	
	@Autowired
	private TicketDetailRepository ticketDetailRepository;
	
	@Autowired
	private SlotRepository slotRepository;
	
	@Autowired
	private ProductRepository productRepository;
	
	@Override
	public Page<TicketDTO> getAllTicket(Pageable pageable, TicketFilterForm filterForm) {
		Specification<Tickets> where = TicketSpecification.buildWhere(filterForm);
		Page<Tickets> ticketPage = ticketRepository.findAll(where, pageable);
		
		List<TicketDTO> dtoList = ticketPage.getContent().stream()
			.map(ticket -> mapTicketToDTO(ticket))
			.collect(Collectors.toList());
		
		return new PageImpl<>(dtoList, pageable, ticketPage.getTotalElements());
	}

	@Override
	public TicketDTO getById(Integer id) {
		Tickets ticket = ticketRepository.findById(id).get();
		return mapTicketToDTO(ticket);
	}
	
	private TicketDTO mapTicketToDTO(Tickets ticket) {
		TicketDTO dto = new TicketDTO();
		
		dto.setId(ticket.getId());
		dto.setAccountsId(ticket.getAccounts().getId());
		dto.setAccountsFullName(ticket.getAccounts().getFullName());
		dto.setSlotsId(ticket.getSlots().getId());
		dto.setTicketsCode(ticket.getTicketsCode());
		dto.setQrCodeUrl(ticket.getQrCodeUrl());
		dto.setQrCodeData(ticket.getQrCodeData());
		dto.setTicketsDate(ticket.getTicketsDate());
		dto.setTotalAmount(ticket.getTotalAmount());
		dto.setDiscountAmount(ticket.getDiscountAmount());
		dto.setFinalAmount(ticket.getFinalAmount());
		dto.setPaymentStatus(ticket.getPaymentStatus());
		dto.setStatus(ticket.getStatus());
		dto.setNote(ticket.getNote());
		
		List<BookingSeats> bookingSeats = bookingSeatRepository.findByTickets_IdAndIsDeleted(ticket.getId(), false);
		
		if (bookingSeats != null && !bookingSeats.isEmpty()) {
			List<Integer> seatIds = bookingSeats.stream()
				.map(bs -> bs.getSeats().getId())
				.collect(Collectors.toList());
			
			List<Seats> seats = seatRepository.findAllById(seatIds);
			List<TicketDTO.SeatDTO> seatDTOs = new ArrayList<>();
			
			for (Seats seat : seats) {
				BookingSeats bs = bookingSeats.stream()
					.filter(b -> b.getSeats().getId().equals(seat.getId()))
					.findFirst()
					.orElse(null);
				
				if (bs != null) {
					TicketDTO.SeatDTO seatDTO = new TicketDTO.SeatDTO();
					
					seatDTO.setSeatsId(seat.getId());
					seatDTO.setSeatsRow(seat.getSeatRow());
					seatDTO.setSeatsNumber(seat.getSeatNumber());
					
					if (seat.getSeatTypes() != null) {
						seatDTO.setSeatTypes(seat.getSeatTypes().getTypeName());
						
						if (seat.getSeatTypes().getPriceMultiplier() != null) {
							seatDTO.setPriceMultiplier(seat.getSeatTypes().getPriceMultiplier());
						} else {
							seatDTO.setPriceMultiplier(BigDecimal.ONE);
						}
					} else {
						seatDTO.setSeatTypes("UNKNOWN");
						seatDTO.setPriceMultiplier(BigDecimal.ONE);
					}
					
					seatDTO.setSeatPrice(bs.getSeatPrice());
					seatDTOs.add(seatDTO);
				}
			}
			
			dto.setSeats(seatDTOs);
		}
		
		List<TicketsDetails> ticketDetails = ticketDetailRepository.findByTickets_Id(ticket.getId());
		
		if (ticketDetails != null && !ticketDetails.isEmpty()) {
			List<TicketDTO.TicketsDetailDTO> detailDTOs = new ArrayList<>();
			
			for (TicketsDetails detail : ticketDetails) {
				TicketDTO.TicketsDetailDTO detailDTO = new TicketDTO.TicketsDetailDTO();
				
				detailDTO.setId(detail.getId());
				detailDTO.setProductsName(detail.getProducts().getProductName());
				detailDTO.setQuantity(detail.getQuantity());
				detailDTO.setUnitPrice(detail.getUnitPrice());
				detailDTO.setTotalPrice(detail.getTotalPrice());
				
				detailDTOs.add(detailDTO);
			}
			
			dto.setTicketsDetails(detailDTOs);
		}
		
		return dto;
	}
	
	@Override
	@Transactional
	public void createTicket(CreateTicketForm form) {
		Slots slot = slotRepository.findById(form.getSlotsId())
			.orElseThrow(() -> new RuntimeException("Không tìm thấy suất chiếu"));
		
		BigDecimal basePrice = slot.getPrice();
		
		if (form.getSeats() == null || form.getSeats().isEmpty()) {
			throw new RuntimeException("Vui lòng chọn ít nhất một ghế");
		}
		
		int numberOfSeatsToBook = form.getSeats().size();
		
		if (slot.getEmptySeats() < numberOfSeatsToBook) {
			throw new RuntimeException(
				String.format("Không đủ ghế trống! Chỉ còn %d ghế, bạn đang chọn %d ghế", 
					slot.getEmptySeats(), numberOfSeatsToBook)
			);
		}
		
		if (slot.getEmptySeats() == 0) {
			throw new RuntimeException("Suất chiếu này đã hết ghế. Vui lòng chọn suất chiếu khác");
		}
		
		List<Integer> requestedSeatIds = form.getSeats().stream()
			.map(s -> s.getSeatId())
			.collect(Collectors.toList());
		
		List<BookingSeats> existingBookings = bookingSeatRepository
			.findByTickets_Slots_IdAndIsDeleted(form.getSlotsId(), false);
		
		List<Integer> bookedSeatIds = existingBookings.stream()
			.map(bs -> bs.getSeats().getId())
			.collect(Collectors.toList());

		List<String> duplicateSeats = new ArrayList<>();
		for (Integer seatId : requestedSeatIds) {
			if (bookedSeatIds.contains(seatId)) {
				Seats seat = seatRepository.findById(seatId).orElse(null);
				if (seat != null) {
					duplicateSeats.add(seat.getSeatRow() + seat.getSeatNumber());
				}
			}
		}
		
		if (!duplicateSeats.isEmpty()) {
			throw new RuntimeException(
				"Các ghế sau đã được đặt: " + String.join(", ", duplicateSeats) + 
				". Vui lòng chọn ghế khác"
			);
		}

		Integer roomId = slot.getRooms().getId();
		for (CreateTicketForm.SeatBookingForm seatForm : form.getSeats()) {
			Seats seat = seatRepository.findById(seatForm.getSeatId())
				.orElseThrow(() -> new RuntimeException("Không tìm thấy ghế với ID: " + seatForm.getSeatId()));

			if (!seat.getRooms().getId().equals(roomId)) {
				throw new RuntimeException(
					String.format("Ghế %s%d không thuộc phòng chiếu của suất chiếu này (Ghế thuộc phòng %d, slot chiếu ở phòng %d)", 
						seat.getSeatRow(), seat.getSeatNumber(), seat.getRooms().getId(), roomId)
				);
			}

			if (seat.getStatus() != null && seat.getStatus() != Status.ACTIVE) {
				throw new RuntimeException(
					String.format("Ghế %s%d đang bị hỏng (status: %s), không thể đặt", 
						seat.getSeatRow(), seat.getSeatNumber(), seat.getStatus())
				);
			}
		}

		String ticketsCode = "CGV" + System.currentTimeMillis();
		String qrCodeUrl = "/qr/" + ticketsCode + ".png";
		
		List<String> seatNames = new ArrayList<>();
		for (CreateTicketForm.SeatBookingForm seatForm : form.getSeats()) {
			Seats seat = seatRepository.findById(seatForm.getSeatId()).orElse(null);
			if (seat != null) {
				seatNames.add(seat.getSeatRow() + seat.getSeatNumber());
			}
		}
		
		String qrCodeData = String.format(
			"{\"code\":\"%s\",\"slot\":%d,\"seats\":%s}",
			ticketsCode,
			form.getSlotsId(),
			seatNames.toString().replace(" ", "")
		);

		BigDecimal seatTotal = BigDecimal.ZERO;
		
		for (CreateTicketForm.SeatBookingForm seatForm : form.getSeats()) {
			Seats seat = seatRepository.findById(seatForm.getSeatId())
				.orElseThrow(() -> new RuntimeException("Seat not found: " + seatForm.getSeatId()));
			
			BigDecimal priceMultiplier = seat.getSeatTypes() != null 
				? seat.getSeatTypes().getPriceMultiplier() 
				: BigDecimal.ONE;
			
			BigDecimal seatPrice = basePrice.multiply(priceMultiplier);
			seatTotal = seatTotal.add(seatPrice);
		}

		
		BigDecimal productTotal = BigDecimal.ZERO;
		BigDecimal voucherDiscount = BigDecimal.ZERO;
		if (form.getProducts() != null && !form.getProducts().isEmpty()) {
			for (CreateTicketForm.ProductOrderForm productForm : form.getProducts()) {
				Products product = productRepository.findById(productForm.getProductId())
					.orElseThrow(() -> new RuntimeException("Product not found: " + productForm.getProductId()));
				
				BigDecimal itemTotal = product.getPrice().multiply(new BigDecimal(productForm.getQuantity()));
				if ("voucher".equalsIgnoreCase(product.getCategory().toString())) {

					productTotal = productTotal.add(itemTotal); 
					
					BigDecimal discountValue = product.getPrice().multiply(new BigDecimal(productForm.getQuantity()));
					voucherDiscount = voucherDiscount.add(discountValue);
					
				} else {
					productTotal = productTotal.add(itemTotal);
				}
			}
		}

		BigDecimal totalAmount = seatTotal.add(productTotal);
		BigDecimal discountAmount = (form.getDiscountAmount() != null ? form.getDiscountAmount() : BigDecimal.ZERO).add(voucherDiscount);
		BigDecimal finalAmount = totalAmount.subtract(discountAmount);

		Tickets ticket = new Tickets();
		ticket.setTicketsCode(ticketsCode);
		ticket.setQrCodeUrl(qrCodeUrl);
		ticket.setQrCodeData(qrCodeData);
		ticket.setTotalAmount(totalAmount);
		ticket.setDiscountAmount(discountAmount);
		ticket.setFinalAmount(finalAmount);
		ticket.setNote(form.getNote());
		
		Accounts account = new Accounts();
		account.setId(form.getAccountsId());
		ticket.setAccounts(account);
		
		Slots slotRef = new Slots();
		slotRef.setId(form.getSlotsId());
		ticket.setSlots(slotRef);
		
		ticket = ticketRepository.save(ticket);

		for (CreateTicketForm.SeatBookingForm seatForm : form.getSeats()) {
			Seats seat = seatRepository.findById(seatForm.getSeatId()).get();
			
			BigDecimal priceMultiplier = seat.getSeatTypes() != null 
				? seat.getSeatTypes().getPriceMultiplier() 
				: BigDecimal.ONE;
			
			BigDecimal seatPrice = basePrice.multiply(priceMultiplier);
			
			BookingSeats bookingSeat = new BookingSeats();
			bookingSeat.setTickets(ticket);
			bookingSeat.setSeats(seat);
			bookingSeat.setSeatPrice(seatPrice);
			
			bookingSeatRepository.save(bookingSeat);
		}

		if (form.getProducts() != null && !form.getProducts().isEmpty()) {
			for (CreateTicketForm.ProductOrderForm productForm : form.getProducts()) {
				Products product = productRepository.findById(productForm.getProductId()).get();
				
				BigDecimal unitPrice = product.getPrice();
				BigDecimal totalPrice = unitPrice.multiply(new BigDecimal(productForm.getQuantity()));
				
				TicketsDetails ticketDetail = new TicketsDetails();
				ticketDetail.setTickets(ticket);
				ticketDetail.setProducts(product);
				ticketDetail.setQuantity(productForm.getQuantity());
				ticketDetail.setUnitPrice(unitPrice);
				ticketDetail.setTotalPrice(totalPrice);
				
				ticketDetailRepository.save(ticketDetail);
			}
		}

		slot.setEmptySeats(slot.getEmptySeats() - numberOfSeatsToBook);
		slotRepository.save(slot);
	}
	
	@Override
	@Transactional
	public void updateTicket(Integer id, UpdateTicketForm form) {
		Tickets updateTicket = ticketRepository.findById(id).get();
		updateTicket.setPaymentStatus(form.getPaymentStatus());
		updateTicket.setStatus(form.getStatus());
		ticketRepository.save(updateTicket);
	}

	@Override
	@Transactional
	public void deleteTicket(Integer id) {
		Tickets delete = ticketRepository.findById(id).get();
		delete.setIsDeleted(true);
		ticketRepository.save(delete);
	}
}