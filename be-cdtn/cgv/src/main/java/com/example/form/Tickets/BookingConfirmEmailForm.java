package com.example.form.Tickets;

import lombok.Data;

@Data
public class BookingConfirmEmailForm {
    private String to_name;
    private String to_email;
    private String booking_code;
    private String movie_title;
    private String cinema_name;
    private String showtime;
    private String seats;
    private String total;
}
