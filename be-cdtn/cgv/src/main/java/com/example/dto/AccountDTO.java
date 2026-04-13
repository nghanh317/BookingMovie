package com.example.dto;


import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import com.example.entity.Tickets.PaymentStatus;
import com.example.entity.Tickets.Status;

@Data
public class AccountDTO {
	private Integer id;
	
    private String userName;
    
    private String email;
    
    private String phone;
    
    private String fullName;
    
    private String role;
    
    private String token;
    
    private Date createDate;
    
    private List<TicketDTO> tickets;
    
    @Data
    @NoArgsConstructor
    public static class TicketDTO{
    	private Integer id;
    	private String ticketsCode;
    	private BigDecimal totalAmount;
    	private BigDecimal discountAmount;
    	private BigDecimal finalAmount;
    	private PaymentStatus paymentStatus;
    	private Status status;
    }
}
