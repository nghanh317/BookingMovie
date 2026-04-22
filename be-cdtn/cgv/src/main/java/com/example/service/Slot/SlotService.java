package com.example.service.Slot;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.dto.SlotDTO;
import com.example.entity.Movies;
import com.example.entity.Rooms;
import com.example.entity.Slots;
import com.example.form.Slot.CreateSlotForm;
import com.example.form.Slot.SlotFilterForm;
import com.example.form.Slot.UpdateSlotForm;
import com.example.repository.RoomRepository;
import com.example.repository.SlotRepository;
import com.example.service.SettingSystem.PricingService;
import com.example.specification.SlotSpecification;

@Service
public class SlotService implements ISlotService {
	
	@Autowired 
	private SlotRepository slotRepository;
	
	@Autowired
	private RoomRepository roomRepository;
	
	@Autowired
	private PricingService pricingService;

	@Override
	public Page<SlotDTO> getAllSlot(Pageable pageable, SlotFilterForm filterForm) {
		Specification<Slots> where = SlotSpecification.buildWhere(filterForm);
		Page<Slots> slotPage = slotRepository.findAll(where, pageable);
		
		List<SlotDTO> dtos = slotPage.getContent().stream()
			.map(slot -> {
				SlotDTO dto = new SlotDTO();
				dto.setId(slot.getId());
				if (slot.getMovies() != null) {
					dto.setMovieId(slot.getMovies().getId());
					dto.setMovieName(slot.getMovies().getTitle());
				}
				if (slot.getRooms() != null) {
					dto.setRoomId(slot.getRooms().getId());
					dto.setRoomName(slot.getRooms().getRoomName());
					dto.setCinemaName(slot.getRooms().getCinemas().getCinemaName());
					dto.setProvinceName(slot.getRooms().getCinemas().getProvinces().getProvinceName());
				}
				dto.setShowTime(slot.getShowTime());
				dto.setEndTime(slot.getEndTime());
				dto.setPrice(slot.getPrice());
				dto.setEmptySeats(slot.getEmptySeats());
				dto.setCreateDate(slot.getCreateDate());
				return dto;
			}).collect(Collectors.toList());
		return new PageImpl<>(dtos, pageable, slotPage.getTotalElements());
	}

	@Override
	public SlotDTO getById(Integer id) {
		Slots slot = slotRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Slot not found"));
		SlotDTO dto = new SlotDTO();
		dto.setId(slot.getId());
		if (slot.getMovies() != null) {
			dto.setMovieId(slot.getMovies().getId());
			dto.setMovieName(slot.getMovies().getTitle());
		}
		if (slot.getRooms() != null) {
			dto.setRoomId(slot.getRooms().getId());
			dto.setRoomName(slot.getRooms().getRoomName());
			dto.setCinemaName(slot.getRooms().getCinemas().getCinemaName());
			dto.setProvinceName(slot.getRooms().getCinemas().getProvinces().getProvinceName());
		}
		dto.setShowTime(slot.getShowTime());
		dto.setEndTime(slot.getEndTime());
		dto.setPrice(slot.getPrice());
		dto.setEmptySeats(slot.getEmptySeats());
		dto.setCreateDate(slot.getCreateDate());
		return dto;
	}

	@Override
	@Transactional
	public void createSlot(CreateSlotForm form) {
		Rooms room = roomRepository.findById(form.getRoomId())
			.orElseThrow(() -> new RuntimeException("Room not found with id: " + form.getRoomId()));
		
		// Giá vé: dùng giá admin nhập nếu có, không thì tính tự động
		BigDecimal price;
		if (form.getPrice() != null && form.getPrice().compareTo(BigDecimal.ZERO) > 0) {
			price = form.getPrice();
		} else {
			price = pricingService.calculatePrice(form.getShowTime());
		}
		
		// Số ghế trống: dùng giá trị admin nhập nếu có, không thì lấy từ phòng
		Integer emptySeats;
		if (form.getEmptySeats() != null && form.getEmptySeats() > 0) {
			emptySeats = form.getEmptySeats();
		} else {
			emptySeats = room.getTotalSeats();
		}
		
		Slots createSlot = new Slots(form.getShowTime(), form.getEndTime(), price, emptySeats);
		
		Movies movie = new Movies();
		movie.setId(form.getMovieId());
		createSlot.setMovies(movie);
		
		createSlot.setRooms(room);
		
		slotRepository.save(createSlot);
	}

	@Override
	@Transactional
	public void updateSlot(Integer id, UpdateSlotForm form) {
		Slots updateSlot = slotRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Slot not found"));
		
		BigDecimal autoPrice = pricingService.calculatePrice(form.getShowTime());
		
		Movies movie = new Movies();
		movie.setId(form.getMovieId());
		updateSlot.setMovies(movie);
		
		Rooms room = new Rooms();
		room.setId(form.getRoomId());
		updateSlot.setRooms(room);
		updateSlot.setShowTime(form.getShowTime());
		updateSlot.setEndTime(form.getEndTime());
		updateSlot.setPrice(autoPrice);

		
		slotRepository.save(updateSlot);
	}

	@Override
	@Transactional
	public void deleteSlot(Integer id) {
		Slots delete = slotRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Slot not found"));
		delete.setIsDeleted(true);
		slotRepository.save(delete);
	}
}