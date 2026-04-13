package com.example.service.Seat;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.SeatDTO;
import com.example.entity.Rooms;
import com.example.entity.SeatTypes;
import com.example.entity.Seats;
import com.example.entity.Seats.Status;
import com.example.form.Seat.CreateSeatForm;
import com.example.form.Seat.UpdateSeatForm;
import com.example.repository.RoomRepository;
import com.example.repository.SeatRepository;

@Service
public class SeatService implements ISeatService {

	@Autowired
	private SeatRepository seatRepository;

	@Autowired
	private RoomRepository roomRepository;

	@Autowired
	private ModelMapper modelMapper;

	@Override
	public Page<SeatDTO> getAllSeat(Pageable pageable) {
		Page<Seats> seatPage = seatRepository.findAll(pageable);

		List<SeatDTO> dto = modelMapper.map(
			seatPage.getContent(),
			new TypeToken<List<SeatDTO>>() {}.getType()
		);
		Page<SeatDTO> dtoPage = new PageImpl<>(dto, pageable, seatPage.getTotalElements());
		return dtoPage;
	}

	@Override
	public SeatDTO getById(Integer id) {
		Seats seat = seatRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Seat not found with id: " + id));
		return modelMapper.map(seat, SeatDTO.class);
	}

	@Override
	@Transactional
	public void create(CreateSeatForm form) {
		Seats create = new Seats(form.getSeatRow(), form.getSeatNumber());

		Rooms room = new Rooms();
		room.setId(form.getRoomsId());
		create.setRooms(room);

		SeatTypes st = new SeatTypes();
		st.setId(form.getSeatTypesId());
		create.setSeatTypes(st);

		seatRepository.save(create);
		updateRoomTotalSeats(form.getRoomsId());
	}

	@Override
	@Transactional
	public void updateSeat(Integer id, UpdateSeatForm form) {
		Seats seat = seatRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Seat not found with id: " + id));

		Integer oldRoomId = seat.getRooms().getId();
		Status oldStatus = seat.getStatus();

		if (form.getSeatRow() != null) {
			seat.setSeatRow(form.getSeatRow());
		}
		if (form.getSeatNumber() != null) {
			seat.setSeatNumber(form.getSeatNumber());
		}
		if (form.getStatus() != null) {
			// ✅ CHUYỂN ĐỔI STRING → ENUM
			seat.setStatus(Seats.Status.valueOf(form.getStatus().toUpperCase()));
		}

		if (form.getSeatTypesId() != null) {
			SeatTypes st = new SeatTypes();
			st.setId(form.getSeatTypesId());
			seat.setSeatTypes(st);
		}

		if (form.getRoomsId() != null && !form.getRoomsId().equals(oldRoomId)) {
			Rooms newRoom = new Rooms();
			newRoom.setId(form.getRoomsId());
			seat.setRooms(newRoom);
		}

		seatRepository.save(seat);

		if (form.getRoomsId() != null && !form.getRoomsId().equals(oldRoomId)) {
			updateRoomTotalSeats(oldRoomId);
			updateRoomTotalSeats(form.getRoomsId());
		}
		// ✅ SO SÁNH ĐÚNG: CHUYỂN STRING → ENUM RỒI MỚI SO SÁNH
		else if (form.getStatus() != null && !Seats.Status.valueOf(form.getStatus().toUpperCase()).equals(oldStatus)) {
			updateRoomTotalSeats(seat.getRooms().getId());
		}
	}

	@Override
	@Transactional
	public void deleteSeat(Integer id) {
		Seats seat = seatRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Seat not found with id: " + id));

		Integer roomId = seat.getRooms().getId();
		seatRepository.delete(seat);
		updateRoomTotalSeats(roomId);
	}

	private void updateRoomTotalSeats(Integer roomId) {
		// ✅ DÙNG ENUM, KHÔNG PHẢI STRING
		Long totalSeats = seatRepository.countByRoomsIdAndStatus(roomId, Seats.Status.ACTIVE);

		Rooms room = roomRepository.findById(roomId)
			.orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
		room.setTotalSeats(totalSeats.intValue());
		roomRepository.save(room);
	}
}