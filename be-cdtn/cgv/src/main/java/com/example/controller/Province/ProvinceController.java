package com.example.controller.Province;

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
import com.example.dto.ProvinceDTO;
import com.example.form.Province.CreateProvinceForm;
import com.example.form.Province.ProvinceFilterForm;
import com.example.form.Province.UpdateProvinceForm;
import com.example.service.Province.IProvinceService;

@RestController
@RequestMapping ("api/v1/provinces")
public class ProvinceController {
	
	@Autowired
	private IProvinceService provinceService;
	
	@GetMapping
	public Page<ProvinceDTO> getAllProvince (Pageable pageable,ProvinceFilterForm filterForm){
		return provinceService.getAllProvince(pageable, filterForm);
	}
	
	@GetMapping ("/{id}")
	public ProvinceDTO getById(@PathVariable Integer id) {
		return provinceService.getById(id);
	}
	@GetMapping("/{id}/cinemas")
	public Page<CinemaDTO> getCinemasByProvinceId(
			@PathVariable Integer id,
			Pageable pageable) {
		return provinceService.getCinemasByProvinceId(id, pageable);
	}
	
	@PostMapping
	public void createProvince (@RequestBody CreateProvinceForm form) {
		provinceService.createProvince(form);
	}
	
	@PutMapping ("/{id}")
	public void updateProvince (@PathVariable Integer id, @RequestBody UpdateProvinceForm form) {
		provinceService.updateProvince(id, form);
	}
	
	@DeleteMapping ("/{id}")
	public void deleteProvince (@PathVariable Integer id) {
		provinceService.deleteProvince(id);
	}
	

}
