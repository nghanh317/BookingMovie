package com.example.form.Seat;

import lombok.Data;

@Data
public class CreateSeatForm {

    private Integer roomsId;
    
    private String seatRow;
    
    private Integer seatNumber;
    
    private Integer seatTypesId;
}
