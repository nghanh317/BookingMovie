package com.example.service.Room;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.RoomDTO;
import com.example.entity.Cinemas;
import com.example.entity.Rooms;
import com.example.form.Room.CreateRoomForm;
import com.example.form.Room.RoomFilterForm;
import com.example.form.Room.UpdateRoomForm;
import com.example.repository.RoomRepository;
import com.example.repository.SeatRepository;
import com.example.specification.RoomSpecification;

@Service
public class RoomService implements IRoomService {
	
	@Autowired
	private RoomRepository roomRepository;
	
	@Autowired
	private SeatRepository seatRepository;
	
	@Autowired
	private ModelMapper modelMapper;
	
	@Override
	public Page<RoomDTO> getAllRoom(Pageable pageable, RoomFilterForm filterform) {
		Specification<Rooms> where = RoomSpecification.buildWhere(filterform);
		Page<Rooms> roomPage = roomRepository.findAll(where, pageable);
		
		List<RoomDTO> dto = modelMapper.map(
			roomPage.getContent(), 
			new TypeToken<List<RoomDTO>>() {}.getType()
		);
		
		if (filterform.getSeatId() != null) {
			Integer seatId = filterform.getSeatId();
			dto.forEach(room -> {
				if (room.getSeats() != null) {
					room.setSeats(
						room.getSeats().stream()
							.filter(seat -> seat.getId().equals(seatId))
							.collect(Collectors.toList())
					);
				}
			});
		}
		
		Page<RoomDTO> dtoPage = new PageImpl<>(dto, pageable, roomPage.getTotalElements());
		return dtoPage;
	}
	
	@Override
	public RoomDTO getById(Integer id) {
		Rooms room = roomRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
		return modelMapper.map(room, RoomDTO.class);
	}
	
	@Override
	@Transactional
	public void createRoom(CreateRoomForm form) {
		Rooms createRoom = new Rooms(form.getRoomName(), form.getRoomType(), 0);
		
		Cinemas cinema = new Cinemas();
		cinema.setId(form.getCinemaId());
		createRoom.setCinemas(cinema);
		
		roomRepository.save(createRoom);
	}
	
	@Override
	@Transactional
	public void updateRoom(Integer id, UpdateRoomForm form) {
		Rooms updateRoom = roomRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
		
		updateRoom.setRoomName(form.getRoomName());
		updateRoom.setRoomType(form.getRoomType());
		
		
		roomRepository.save(updateRoom);
	}
	
	@Override
	@Transactional
	public void deleteRoom(Integer id) {
		Rooms delete = roomRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
		
		delete.setIsDeleted(true);
		roomRepository.save(delete);
	}
	
	public void recalculateTotalSeats(Integer roomId) {
		Long totalSeats = seatRepository.countByRoomsIdAndStatus(roomId, "active");
		
		Rooms room = roomRepository.findById(roomId)
			.orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
		room.setTotalSeats(totalSeats.intValue());
		roomRepository.save(room);
	}
}