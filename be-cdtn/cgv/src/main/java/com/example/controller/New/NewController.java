package com.example.controller.New;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.News;
import com.example.form.New.CreateNewForm;
import com.example.form.New.UpdateNewForm;
import com.example.service.New.INewService;

@RestController
@RequestMapping ("api/v1/news")
public class NewController {
	
	@Autowired
	private INewService newService;
	
	@GetMapping
	public Page<News> getAllNew (Pageable pageable){
		return newService.getAllNew(pageable);
	}
	
	@GetMapping ("/{id}")
	public News getById (@PathVariable Integer id) {
		return newService.getById(id);
	}
	@PostMapping
	public void createNew (@RequestBody CreateNewForm form) {
		newService.createNew(form);
	}
	@PutMapping ("/{id}")
	public void updateNew (@PathVariable Integer id, @RequestBody UpdateNewForm form) {
		newService.updateNew(id, form);
	}
	@DeleteMapping ("/{id}")
	public void deleteNew (@PathVariable Integer id) {
		newService.deleteNew(id);
	}

}
