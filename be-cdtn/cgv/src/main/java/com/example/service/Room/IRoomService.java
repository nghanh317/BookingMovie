package com.example.service.Room;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.RoomDTO;
import com.example.form.Room.CreateRoomForm;
import com.example.form.Room.RoomFilterForm;
import com.example.form.Room.UpdateRoomForm;

public interface IRoomService {
	
	Page<RoomDTO> getAllRoom(Pageable pageable, RoomFilterForm filterform);
	
	RoomDTO getById(Integer id);
	
	void createRoom(CreateRoomForm form);
	
	void updateRoom(Integer id, UpdateRoomForm form);
	
	void deleteRoom(Integer id);
	
	void recalculateTotalSeats(Integer roomId);
}