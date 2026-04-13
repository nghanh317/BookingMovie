package com.example.form.New;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateNewForm {
	
	private String title;
	
	private String content;
	
	private String imageUrl;

}
