package com.example.service.Cinema;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.CinemaDTO;
import com.example.entity.Cinemas;
import com.example.entity.Provinces;
import com.example.form.Cinema.CinemaFilterForm;
import com.example.form.Cinema.CreateCinemaForm;
import com.example.form.Cinema.UpdateCinemaForm;
import com.example.repository.CinemaRepository;
import com.example.specification.CinemaSpecification;

@Service
public class CinemaService implements ICinemaService{

	@Autowired
	private CinemaRepository cinemaRepository;
	
	@Autowired
	private ModelMapper modelMapper;
	
	
	@Override
	public Page<CinemaDTO> getAllCinema(Pageable pageable,CinemaFilterForm filterform) {
		Specification<Cinemas> where = CinemaSpecification.buildWhere(filterform);
	    Page<Cinemas> cinemaPage = cinemaRepository.findAll(where, pageable);

	   List<CinemaDTO> dto = modelMapper.map(cinemaPage.getContent(), new TypeToken<List<CinemaDTO>>() {}.getType());
	        
	    Page<CinemaDTO> dtoPage = new PageImpl<>(dto, pageable, cinemaPage.getTotalElements());
	    return dtoPage;
	}

	@Override
	public CinemaDTO getById(Integer id) {
		Cinemas cinema = cinemaRepository.findById(id).get();
		
		return modelMapper.map(cinema, CinemaDTO.class);
	}
	@Override
	public void createCinema(CreateCinemaForm form) {

		Cinemas createCinema = new Cinemas(
			form.getCinemaName(), 
			form.getAddress(), 
			form.getPhone(), 
			form.getEmail()
		);
		createCinema.setLatitude(form.getLatitude());
		createCinema.setLongitude(form.getLongitude());
		
		Provinces province = new Provinces();
		province.setId(form.getProvinceId());
		createCinema.setProvinces(province);
		
		cinemaRepository.save(createCinema);
	}

	@Override
	public void updateCiname(Integer id, UpdateCinemaForm form) {
		Cinemas updateCinema = cinemaRepository.findById(id).get();
		updateCinema.setCinemaName(form.getCinemaName());
		updateCinema.setAddress(form.getAddress());
		updateCinema.setPhone(form.getPhone());
		updateCinema.setEmail(form.getEmail());
		updateCinema.setLatitude(form.getLatitude());
		updateCinema.setLongitude(form.getLongitude());
		
		cinemaRepository.save(updateCinema);
	}

	@Override
	public void deleteCinema(Integer id) {
		Cinemas delete = cinemaRepository.findById(id).get();
		delete.setIsDeleted(true);
		cinemaRepository.save(delete);
		
	}
}
