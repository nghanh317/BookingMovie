	package com.example.controller.Cinema;
	
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
	
	import com.example.dto.CinemaDTO;
	import com.example.form.Cinema.CinemaFilterForm;
	import com.example.form.Cinema.CreateCinemaForm;
	import com.example.form.Cinema.UpdateCinemaForm;
	import com.example.service.Cinema.ICinemaService;
	
	@RestController
	@RequestMapping ("api/v1/cinemas")
	public class CinemaController {
	
		
		@Autowired
		private ICinemaService cinemaService;
		
		@GetMapping
		public Page<CinemaDTO> getAllCinema (Pageable pageable,CinemaFilterForm filterform){
			 return cinemaService.getAllCinema(pageable, filterform);
		}
		
		@GetMapping ("/{id}")
		public CinemaDTO getById (@PathVariable Integer id) {
			return cinemaService.getById(id);
		}
		
		@PostMapping 
		public void createCinema (@RequestBody CreateCinemaForm form) {
			cinemaService.createCinema(form);
		}
		
		@PutMapping ("/{id}")
		public void updateCinema (@PathVariable Integer id,@RequestBody UpdateCinemaForm form) {
			cinemaService.updateCiname(id, form);
		}
		@DeleteMapping ("/{id}")
		public void deleteCiname (@PathVariable Integer id) {
			cinemaService.deleteCinema(id);
		}
	}
