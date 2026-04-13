package com.example.form.Slot;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Data;

@Data
public class SlotFilterForm {
	@DateTimeFormat(pattern = "dd-MM-yyyy")
	private Date date;
	
	private Integer cinemaId;
	
	private Integer movieId;
	
	private Integer provinceId;
}
