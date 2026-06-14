package com.example.service.Seat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.SeatDTO;
import com.example.entity.BookingSeats;
import com.example.entity.Rooms;
import com.example.entity.SeatLocks;
import com.example.entity.SeatTypes;
import com.example.entity.Seats;
import com.example.entity.Seats.Status;
import com.example.entity.Slots;
import com.example.form.Seat.CreateSeatForm;
import com.example.form.Seat.UpdateSeatForm;
import com.example.repository.BookingSeatRepository;
import com.example.repository.RoomRepository;
import com.example.repository.SeatLockRepository;
import com.example.repository.SeatRepository;
import com.example.repository.SlotRepository;

@Service
public class SeatService implements ISeatService {

	@Autowired
	private SeatRepository seatRepository;

	@Autowired
	private RoomRepository roomRepository;

	@Autowired
	private ModelMapper modelMapper;

	@Autowired
	private BookingSeatRepository bookingSeatRepository;

	@Autowired
	private com.example.service.SeatLock.SeatLockService redisSeatLockService;

	@Autowired
	private SlotRepository slotRepository;

	@Override
	public Page<SeatDTO> getAllSeat(Pageable pageable, Integer roomId) {
		Page<Seats> seatPage;
		if (roomId != null) {
			seatPage = seatRepository.findByRoomsId(roomId, pageable);
		} else {
			seatPage = seatRepository.findAll(pageable);
		}

		List<SeatDTO> dto = modelMapper.map(
				seatPage.getContent(),
				new TypeToken<List<SeatDTO>>() {}.getType());
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
		} else if (form.getStatus() != null && !Seats.Status.valueOf(form.getStatus().toUpperCase()).equals(oldStatus)) {
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

	/**
	 * Trả về trạng thái từng ghế cho một suất chiếu (slotId).
	 * BE check cả BookingSeats (đã mua CONFIRMED) + SeatLocks (đang giữ tạm).
	 *
	 * status: "booked" | "locked" | "available"
	 * lockedByMe: true nếu ghế đang do currentAccountId giữ
	 */
	@Override
	public List<Map<String, Object>> getSlotSeatStatus(Integer slotId, Integer currentAccountId) {
		// 1. Lấy roomId từ slot
		Slots slot = slotRepository.findById(slotId)
				.orElseThrow(() -> new RuntimeException("Slot not found: " + slotId));
		Integer roomId = slot.getRooms().getId();

		// 2. Lấy tất cả ghế của phòng
		List<Seats> allSeats = seatRepository.findByRoomsId(roomId, Pageable.unpaged()).getContent();

		// 3. Ghế đã đặt chính thức (status = CONFIRMED, is_deleted = false) hoặc đang chờ thanh toán (PENDING < 10 phút)
		java.util.Date tenMinsAgo = new java.util.Date(System.currentTimeMillis() - (10 * 60 * 1000));
		List<BookingSeats> bookedList = bookingSeatRepository.findUnavailableBySlotId(slotId, tenMinsAgo);
		Set<Integer> bookedSeatIds = bookedList.stream()
				.map(bs -> bs.getSeats().getId())
				.collect(Collectors.toSet());

		// 4. Ghế đang bị lock tạm thời (từ Redis)
		java.util.Map<Integer, Integer> lockMap = redisSeatLockService.getLockedSeatsWithOwners(slotId);

		// 5. Build kết quả
		List<Map<String, Object>> result = new ArrayList<>();
		for (Seats seat : allSeats) {
			Map<String, Object> item = new HashMap<>();
			item.put("seatId", seat.getId());
			item.put("seatRow", seat.getSeatRow());
			item.put("seatNumber", seat.getSeatNumber());
			item.put("seatTypeName",
					seat.getSeatTypes() != null ? seat.getSeatTypes().getTypeName() : "STANDARD");

			if (bookedSeatIds.contains(seat.getId())) {
				item.put("status", "booked");
				item.put("lockedByMe", false);
			} else if (lockMap.containsKey(seat.getId())) {
				item.put("status", "locked");
				boolean isMine = currentAccountId != null
						&& currentAccountId.equals(lockMap.get(seat.getId()));
				item.put("lockedByMe", isMine);
			} else {
				item.put("status", "available");
				item.put("lockedByMe", false);
			}

			result.add(item);
		}
		return result;
	}

	private void updateRoomTotalSeats(Integer roomId) {
		Long totalSeats = seatRepository.countByRoomsIdAndStatus(roomId, Seats.Status.ACTIVE);

		Rooms room = roomRepository.findById(roomId)
				.orElseThrow(() -> new RuntimeException("Room not found with id: " + roomId));
				
		int oldTotalSeats = room.getTotalSeats() != null ? room.getTotalSeats() : 0;
		int diff = totalSeats.intValue() - oldTotalSeats;
		
		room.setTotalSeats(totalSeats.intValue());
		roomRepository.save(room);
		
		if (diff != 0) {
			List<Slots> slots = slotRepository.findByRoomsId(roomId);
			java.util.Date tenMinsAgo = new java.util.Date(System.currentTimeMillis() - (10 * 60 * 1000));
			for (Slots s : slots) {
				int bookedCount = bookingSeatRepository.findUnavailableBySlotId(s.getId(), tenMinsAgo).size();
				int newEmpty = Math.max(0, totalSeats.intValue() - bookedCount);
				s.setEmptySeats(newEmpty);
				slotRepository.save(s);
			}
		}
	}
}