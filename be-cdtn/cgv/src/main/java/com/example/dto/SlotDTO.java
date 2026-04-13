package com.example.dto;

import java.math.BigDecimal;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class SlotDTO {
	private Integer id;
	
	private Integer movieId;
	
	private String movieName;
	
	private Integer roomId;
	
	private String roomName;
	
	private String cinemaName;
	
	private String provinceName;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
	private Date showTime;
	
	@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
	private Date endTime;
	
	private BigDecimal price;
	
	private Integer emptySeats;
	
	private Date createDate;
}
