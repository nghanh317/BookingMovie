package com.example.dto;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import com.example.entity.Tickets.PaymentStatus;
import com.example.entity.Tickets.Status;
import com.fasterxml.jackson.annotation.JsonInclude;

@Data
public class TicketDTO {
	private Integer id;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private Integer accountsId;
	
	private String accountsFullName;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private Integer slotsId;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String ticketsCode;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String qrCodeUrl;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private String qrCodeData;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private Date ticketsDate;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private BigDecimal totalAmount;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private BigDecimal discountAmount;
	
	@JsonInclude(JsonInclude.Include.NON_NULL)
	private BigDecimal finalAmount;
	
	private PaymentStatus paymentStatus;

	private Status status;

	private String note;
	
	private List<TicketsDetailDTO> ticketsDetails;
	
	
	@Data
	@NoArgsConstructor
	public static class TicketsDetailDTO{
		private Integer id;
		private String productsName;
		private Integer quantity;
		private BigDecimal unitPrice;
		private BigDecimal totalPrice;
	}
	
	private List<SeatDTO> seats;
    @Data
    public static class SeatDTO {
        private Integer seatsId;
        private String seatsRow;
        private Integer seatsNumber;
        private String seatTypes;
        private BigDecimal priceMultiplier;
        private BigDecimal seatPrice;
    }
}
