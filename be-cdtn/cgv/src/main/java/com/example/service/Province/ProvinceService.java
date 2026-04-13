package com.example.service.Province;

import java.util.List;
//import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.dto.CinemaDTO;
import com.example.dto.ProvinceDTO;
import com.example.entity.Cinemas;
import com.example.entity.Provinces;
import com.example.form.Province.CreateProvinceForm;
import com.example.form.Province.ProvinceFilterForm;
import com.example.form.Province.UpdateProvinceForm;
import com.example.repository.CinemaRepository;
import com.example.repository.ProvinceRepository;
import com.example.specification.ProvinceSpecification;

@Service
public class ProvinceService implements IProvinceService{
	
	@Autowired
	private ProvinceRepository provinceRepository;
	
	@Autowired 
	private ModelMapper modelMapper;
	
	@Autowired
	private CinemaRepository cinemaRepository;
	@Override
	public Page<ProvinceDTO> getAllProvince(Pageable pageable, ProvinceFilterForm filterform) {
	    Specification<Provinces> where = ProvinceSpecification.buildWhere(filterform);
	    Page<Provinces> provincePage = provinceRepository.findAll(where, pageable);
	    
	    List<ProvinceDTO> dtos = modelMapper.map(
	        provincePage.getContent(),
	        new TypeToken<List<ProvinceDTO>>() {}.getType()
	    );
	    
//	    
//	    if (filterform.getCinemaName() != null) {
//	        String cinemaName = filterform.getCinemaName();
//	        dtos.forEach(province -> {
//	            if (province.getCinemas() != null) {
//	                province.setCinemas(
//	                    province.getCinemas().stream()
//	                        .filter(cinema -> cinema.getCinemaName().equals(cinemaName))
//	                        .collect(Collectors.toList())
//	                );
//	            }
//	        });
//	    }
//	    
//	    
//        if (filterform != null && filterform.getRoomId() != null) {
//            Integer roomId = filterform.getRoomId();
//            dtos.forEach(province -> {
//                if (province.getCinemas() != null) {
//
//                    province.getCinemas().forEach(cinema -> {
//                        if (cinema.getRooms() != null) {
//                            cinema.setRooms(
//                                cinema.getRooms().stream()
//                                    .filter(room -> room.getId().equals(roomId))
//                                    .collect(Collectors.toList())
//                            );
//                        }
//                    });
//                }
//            });
//        }
//        if (filterform.getRoomId() != null && filterform.getSlotId() != null) {
//            Integer slotId = filterform.getSlotId();
//            dtos.forEach(province -> {
//                if (province.getCinemas() != null) {
//
//                    province.getCinemas().forEach(cinema -> {
//                    	
//                    	cinema.getRooms().forEach(room ->{
//                    		if (room.getSlots() != null) {
//                    			room.setSlots(
//                    				room.getSlots().stream()
//                    				.filter(slot -> slot.getId().equals(slotId))
//                    				.collect(Collectors.toList())
//                    					);
//                    		}
//                    	});
//                    });
//                }
//            });
//        }
	    Page<ProvinceDTO> dtoPage = new PageImpl<>(dtos, pageable, provincePage.getTotalElements());
	    return dtoPage;
	}
	
	@Override
	public Page<CinemaDTO> getCinemasByProvinceId(Integer provinceId, Pageable pageable) {
		Page<Cinemas> cinemaPage = cinemaRepository.findByProvincesIdAndIsDeletedFalse(provinceId, pageable);
		List<CinemaDTO> cinemaDTOs = modelMapper.map(
				cinemaPage.getContent(), 
				new TypeToken<List<CinemaDTO>>() {}.getType()
		);
		return new PageImpl<>(cinemaDTOs, pageable, cinemaPage.getTotalElements());
	}
	
	@Override
	public ProvinceDTO getById (Integer id) {
		Provinces province = provinceRepository.findById(id).get();
		return modelMapper.map(province, ProvinceDTO.class);
	}
	
	@Override
	public void createProvince (CreateProvinceForm form) {
		Provinces createProvinces = new Provinces(form.getProvinceName());
		provinceRepository.save(createProvinces);
	}
	
	@Override
	public void updateProvince (Integer id , UpdateProvinceForm form) {
		Provinces updateProvince = provinceRepository.findById(id).get();
		updateProvince.setProvinceName(form.getProvinceName());
		provinceRepository.save(updateProvince);
	}
	
	@Override
	public void deleteProvince (Integer id) {
		Provinces delete = provinceRepository.findById(id).get();
		delete.setIsDeleted(true);
		provinceRepository.save(delete);
	}

}
