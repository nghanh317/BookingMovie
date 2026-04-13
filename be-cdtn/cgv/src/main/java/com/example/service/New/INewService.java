package com.example.service.New;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.entity.News;
import com.example.form.New.CreateNewForm;
import com.example.form.New.UpdateNewForm;

public interface INewService {

	Page<News> getAllNew (Pageable pageable);
	
	News getById (Integer id);
	
	void createNew (CreateNewForm form);
	
	void updateNew (Integer id, UpdateNewForm form);
	
	void deleteNew (Integer id);
}
