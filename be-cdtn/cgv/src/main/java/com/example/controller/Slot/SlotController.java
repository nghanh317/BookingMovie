package com.example.controller.Slot;

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

import com.example.dto.SlotDTO;
import com.example.form.Slot.CreateSlotForm;
import com.example.form.Slot.SlotFilterForm;
import com.example.form.Slot.UpdateSlotForm;
import com.example.service.Slot.ISlotService;

@RestController
@RequestMapping ("api/v1/slots")
public class SlotController {
	
	@Autowired
	private ISlotService slotService;
	
	@GetMapping
	public Page<SlotDTO> getAllSlot (Pageable pageable,SlotFilterForm filterForm){
		return slotService.getAllSlot(pageable, filterForm);
	}
	@GetMapping ("/{id}")
	public SlotDTO getById (@PathVariable Integer id) {
		return slotService.getById(id);
	}
	@PostMapping
	public void createSlot (@RequestBody CreateSlotForm form) {
		slotService.createSlot(form);
	}
	@PutMapping ("/{id}")
	public void updateSlot (@PathVariable Integer id, @RequestBody UpdateSlotForm form) {
		slotService.updateSlot(id, form);
	}
	@DeleteMapping("/{id}")
	public void deleteSlot (@PathVariable Integer id) {
		slotService.deleteSlot(id);
	}
}
