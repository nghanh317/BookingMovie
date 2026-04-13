package com.example.controller.Room;

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

import com.example.dto.RoomDTO;
import com.example.form.Room.CreateRoomForm;
import com.example.form.Room.RoomFilterForm;
import com.example.form.Room.UpdateRoomForm;
import com.example.service.Room.IRoomService;

@RestController
@RequestMapping("api/v1/rooms")
public class RoomController {
	
	@Autowired
	private IRoomService roomService;

	@GetMapping
	public Page<RoomDTO> getAllRoom(Pageable pageable, RoomFilterForm filterform) {
		return roomService.getAllRoom(pageable, filterform);
	}

	@GetMapping("/{id}")
	public RoomDTO getById(@PathVariable Integer id) {
		return roomService.getById(id);
	}
	@PostMapping
	public void createRoom(@RequestBody CreateRoomForm form) {
		roomService.createRoom(form);
	}
	
	@PutMapping("/{id}")
	public void updateRoom(@PathVariable Integer id, @RequestBody UpdateRoomForm form) {
		roomService.updateRoom(id, form);
	}

	@DeleteMapping("/{id}")
	public void deleteRoom(@PathVariable Integer id) {
		roomService.deleteRoom(id);
	}

	@PutMapping("/{id}/recalculate-seats")
	public void recalculateTotalSeats(@PathVariable Integer id) {
		roomService.recalculateTotalSeats(id);
	}
}