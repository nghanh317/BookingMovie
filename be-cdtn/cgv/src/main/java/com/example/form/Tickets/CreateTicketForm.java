package com.example.form.Tickets;

import java.math.BigDecimal;
import java.util.List;



import lombok.Data;

@Data
public class CreateTicketForm {
    private Integer accountsId;
    private Integer slotsId;
    private BigDecimal discountAmount;
    private String note;
    
    private List<SeatBookingForm> seats;
    
    private List<ProductOrderForm> products;
    
    @Data
    public static class SeatBookingForm {
        private Integer seatId;
    }
    
    @Data
    public static class ProductOrderForm {
        private Integer productId;
        private Integer quantity;
    }
}
