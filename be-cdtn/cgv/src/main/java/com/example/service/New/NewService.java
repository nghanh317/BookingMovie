package com.example.service.New;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.entity.News;
import com.example.form.New.CreateNewForm;
import com.example.form.New.UpdateNewForm;
import com.example.repository.NewRepository;

@Service
public class NewService implements INewService{
	
	@Autowired
	private NewRepository newRepository;

	@Override
	public Page<News> getAllNew(Pageable pageable) {
		return newRepository.findAll(pageable);
	}

	@Override
	public News getById(Integer id) {
		return newRepository.findById(id).get();
	}

	@Override
	public void createNew(CreateNewForm form) {
		News createNew = new News(form.getContent(), form.getTitle());
		createNew.setImageUrl(form.getImageUrl());
		newRepository.save(createNew);
		
	}

	@Override
	public void updateNew(Integer id, UpdateNewForm form) {
		News updateNew = newRepository.findById(id).get();
		updateNew.setContent(form.getContent());
		updateNew.setTitle(form.getTitle());
		updateNew.setImageUrl(form.getImageUrl());
		
		newRepository.save(updateNew);
	}

	@Override
	public void deleteNew(Integer id) {
		News delete = newRepository.findById(id).get();
		delete.setIsDeleted(true);
		newRepository.save(delete);
		
	}
	

}
