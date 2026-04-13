package com.example.dto;

import java.util.Date;

import lombok.Data;

@Data
public class FavoritesDTO {
	
	private Integer id;
	
	private Integer accountsId;
	
	private Integer moviesId;
	
	private Date createDate;

}
