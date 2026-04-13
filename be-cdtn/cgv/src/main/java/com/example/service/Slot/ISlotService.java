package com.example.service.Slot;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.SlotDTO;
import com.example.form.Slot.CreateSlotForm;
import com.example.form.Slot.SlotFilterForm;
import com.example.form.Slot.UpdateSlotForm;

public interface ISlotService {
	
	Page<SlotDTO> getAllSlot (Pageable pageable,SlotFilterForm filterForm);
	
	SlotDTO getById (Integer id);
	
	void createSlot (CreateSlotForm form);
	
	void updateSlot (Integer id, UpdateSlotForm form);
	
	void deleteSlot (Integer id);
}
