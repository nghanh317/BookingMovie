package com.example.service.SeatType;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.dto.SeatTypeDTO;
import com.example.entity.SeatTypes;
import com.example.form.SeatType.CreateSeatTypeForm;
import com.example.form.SeatType.UpdateSeatTypeForm;
import com.example.repository.SeatTypeRepository;

@Service
public class SeatTypeService implements ISeatType{
	
	@Autowired
	private SeatTypeRepository seatTypeRepository;

	
	@Autowired
	private ModelMapper modelMapper;
	
	
	@Override
	public Page<SeatTypeDTO> getAllSeatType(Pageable pageable) {
		Page<SeatTypes> seatTypePage = seatTypeRepository.findAll(pageable);
		
		List<SeatTypeDTO> dtos = modelMapper.map(
				seatTypePage.getContent(),
				new TypeToken<List<SeatTypeDTO>>() {}.getType());
		Page<SeatTypeDTO> dtoPage = new PageImpl<>(dtos, pageable, seatTypePage.getTotalElements());
		return dtoPage;
	}

	 @Override
	    public SeatTypeDTO getById(Integer id) {
	        SeatTypes seatType = seatTypeRepository.findById(id).get();

	        SeatTypeDTO dto = new SeatTypeDTO();
	        dto.setId(seatType.getId());
	        dto.setTypeName(seatType.getTypeName());
	        dto.setPriceMultiplier(seatType.getPriceMultiplier());
	        dto.setDescription(seatType.getDescription());
	    
	        return dto;
	    }

	@Override
	public void createSeatType(CreateSeatTypeForm form) throws Exception {
		if ( seatTypeRepository.existsByTypeName(form.getTypeName()))
			throw new Exception("TypeName already exist");
		SeatTypes createSeatTypes = new SeatTypes(form.getTypeName(), form.getTypeName());
		seatTypeRepository.save(createSeatTypes);
	}

	@Override
	public void updateSeatType(Integer id, UpdateSeatTypeForm form) throws Exception {
		if ( seatTypeRepository.existsByTypeName(form.getTypeName()))
			throw new Exception("TypeName already exist");
		SeatTypes updateSeatTypes = seatTypeRepository.findById(id).get();
		updateSeatTypes.setTypeName(form.getTypeName());
		updateSeatTypes.setDescription(form.getDescription());
		seatTypeRepository.save(updateSeatTypes);
		
	}

	@Override
	public void deleteSeatType(Integer id) {
		SeatTypes delete = seatTypeRepository.findById(id).get();
		delete.setIsDeleted(true);
		seatTypeRepository.save(delete);
		
		
	}
	
	

}
