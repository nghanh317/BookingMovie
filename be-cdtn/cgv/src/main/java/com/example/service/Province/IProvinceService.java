package com.example.service.Province;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.CinemaDTO;
import com.example.dto.ProvinceDTO;
import com.example.form.Province.CreateProvinceForm;
import com.example.form.Province.ProvinceFilterForm;
import com.example.form.Province.UpdateProvinceForm;

public interface IProvinceService {
	
	Page<ProvinceDTO> getAllProvince (Pageable pageable, ProvinceFilterForm filterform);
	
	ProvinceDTO getById (Integer id);
	
	Page<CinemaDTO> getCinemasByProvinceId(Integer provinceId, Pageable pageable);
	
	void createProvince (CreateProvinceForm form);
	
	void updateProvince (Integer id, UpdateProvinceForm form);
	
	void deleteProvince (Integer id);

}
