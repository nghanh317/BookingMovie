package com.example.service.Movie;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.dto.DateDTO;
import com.example.dto.MovieDTO;
import com.example.entity.Movies;
import com.example.entity.Slots;
import com.example.form.Movie.CreateMovieForm;
import com.example.form.Movie.MovieFilterForm;
import com.example.form.Movie.UpdateMovieForm;
import com.example.repository.MovieRepository;
import com.example.repository.SlotRepository;
import com.example.specification.MovieSpecification;

@Service
public class MovieService implements IMovieService {

	@Autowired
	private RedisTemplate<String, Object> redisTemplate;

	@Autowired
	private MovieRepository movieRepository;

	@Autowired
	private ModelMapper modelMapper;

	@Autowired
	private SlotRepository slotRepository;

	@Autowired
	private com.example.repository.BookingSeatRepository bookingSeatRepository;

	@Override
	public Page<MovieDTO> getAllMovie(Pageable pageable, MovieFilterForm filterform) {
		Specification<Movies> where = MovieSpecification.buildWhere(filterform);
		Page<Movies> moviePage = movieRepository.findAll(where, pageable);

		List<MovieDTO> dtos = modelMapper.map(
				moviePage.getContent(),
				new TypeToken<List<MovieDTO>>() {
				}.getType());

		for (int i = 0; i < moviePage.getContent().size(); i++) {
			Movies movie = moviePage.getContent().get(i);
			MovieDTO dto = dtos.get(i);
			double sum = 0;
			int count = 0;
			if (movie.getReviews() != null) {
				for (var review : movie.getReviews()) {
					if (review.getRating() != null && (review.getIsDeleted() == null || !review.getIsDeleted())) {
						sum += review.getRating();
						count++;
					}
				}
			}
			dto.setRating(count == 0 ? 0.0 : Math.round((sum / count) * 10.0) / 10.0);
		}

		Page<MovieDTO> dtoPage = new PageImpl<>(dtos, pageable, moviePage.getTotalElements());
		return dtoPage;
	}

	@Override
	public MovieDTO getById(Integer id) {
		String cacheKey = "movie:detail:" + id;
		//kiem tra Redis truoc
		MovieDTO cacheDto = (MovieDTO) redisTemplate.opsForValue().get(cacheKey);
		if(cacheDto != null) {
			return cacheDto;
		}

		Movies movie = movieRepository.findById(id).get();
		MovieDTO dto = modelMapper.map(movie, MovieDTO.class);
		
		double sum = 0;
		int count = 0;
		if (movie.getReviews() != null) {
			for (var review : movie.getReviews()) {
				if (review.getRating() != null && (review.getIsDeleted() == null || !review.getIsDeleted())) {
					sum += review.getRating();
					count++;
				}
			}
		}
		dto.setRating(count == 0 ? 0.0 : Math.round((sum / count) * 10.0) / 10.0);
		
		// luu redis de lan sau dung voi thoi gian song 10p
		redisTemplate.opsForValue().set(cacheKey, dto, java.time.Duration.ofMinutes(10));
		return dto;
	}

	@Override
	public List<DateDTO> getShowDatesByMovieId(Integer movieId) {
		List<Slots> slots = slotRepository.findByMoviesIdOrderByShowTime(movieId);

		Set<String> uniqueDates = new LinkedHashSet<>();
		List<DateDTO> dateDTOs = new ArrayList<>();

		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

		for (Slots slot : slots) {
			String dateString = sdf.format(slot.getShowTime());
			if (uniqueDates.add(dateString)) {
				DateDTO dto = new DateDTO();
				dto.setDate(slot.getShowTime());
				dateDTOs.add(dto);
			}
		}

		return dateDTOs;
	}

	@Override
	public void createMovie(CreateMovieForm form) {
		Movies createMovie = new Movies(form.getTitle(), form.getDescription(), form.getDuration(),
				form.getReleaseDate(), form.getDirector(), form.getCast(), form.getGenre(), form.getLanguage());
		// Gán thêm 2 trường này
		createMovie.setPosterUrl(form.getPosterUrl());
		createMovie.setTrailerUrl(form.getTrailerUrl());

		//THÊM MỚI: Cho phép Admin cập nhật lại trạng thái phim và nhãn độ tuổi
		if (form.getStatus() != null) {
			createMovie.setStatus(Movies.Status.toEnum(form.getStatus()));
		}
		if (form.getAgeRating() != null) {
			createMovie.setAgeRating(form.getAgeRating());
		}
		movieRepository.save(createMovie);
	}

	@Override
	public void updateMovie(Integer id, UpdateMovieForm form) {
		Movies updateMovie = movieRepository.findById(id).get();
		updateMovie.setTitle(form.getTitle());
		updateMovie.setDuration(form.getDuration());
		updateMovie.setDirector(form.getDirector());
		updateMovie.setCast(form.getCast());
		updateMovie.setGenre(form.getGenre());
		updateMovie.setLanguage(form.getLanguage());
		updateMovie.setDescription(form.getDescription());
		updateMovie.setReleaseDate(form.getReleaseDate());
		updateMovie.setPosterUrl(form.getPosterUrl());
		updateMovie.setTrailerUrl(form.getTrailerUrl());

		// ✨ THÊM MỚI: Cho phép Admin cập nhật lại trạng thái phim và nhãn độ tuổi
        if (form.getStatus() != null) {
            updateMovie.setStatus(Movies.Status.toEnum(form.getStatus()));
        }
        if (form.getAgeRating() != null) {
            updateMovie.setAgeRating(form.getAgeRating());
        }

		movieRepository.save(updateMovie);
		// XÓA CACHE ĐỂ LẦN SAU HỆ THỐNG PHẢI LOAD LẠI TỪ MYSQL
    	redisTemplate.delete("movie:detail:" + id);

	}

	@Override
	@org.springframework.transaction.annotation.Transactional
	public void deleteMovie(Integer id) {
		Movies delete = movieRepository.findById(id)
			.orElseThrow(() -> new RuntimeException("Movie not found"));
			
		List<Slots> slots = slotRepository.findByMoviesIdOrderByShowTime(id);
		java.util.Date now = new java.util.Date();
		java.util.Date tenMinsAgo = new java.util.Date(now.getTime() - (10 * 60 * 1000));
		
		boolean hasFutureBookedSlots = false;
		
		for (Slots slot : slots) {
			if (slot.getIsDeleted() != null && slot.getIsDeleted()) continue;
			
			// Kiểm tra các suất chiếu chưa kết thúc
			if (slot.getEndTime() != null && slot.getEndTime().after(now)) {
				// Kiểm tra xem có người đặt vé chưa
				int bookedCount = bookingSeatRepository.findUnavailableBySlotId(slot.getId(), tenMinsAgo).size();
				if (bookedCount > 0) {
					hasFutureBookedSlots = true;
					break;
				}
			}
		}
		
		if (hasFutureBookedSlots) {
			throw new IllegalStateException("Phim đang có suất chiếu (đã có người đặt vé) nên không thể xóa.");
		}
		
		// Xoá mềm phim
		delete.setIsDeleted(true);
		movieRepository.save(delete);
		
		// Xoá mềm tất cả các suất chiếu chưa bị xoá của phim này
		for (Slots slot : slots) {
			if (slot.getIsDeleted() == null || !slot.getIsDeleted()) {
				slot.setIsDeleted(true);
				slotRepository.save(slot);
			}
		}

	    // XÓA CACHE
    	redisTemplate.delete("movie:detail:" + id);
	}

	@jakarta.annotation.PostConstruct
	public void init() {
		System.out.println("[MovieService] Chạy cập nhật trạng thái phim lúc khởi động...");
		updateMovieStatusesAutomatically();
	}

	@org.springframework.scheduling.annotation.Scheduled(cron = "0 0 0 * * ?") // Runs daily at midnight
    // @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000) // Or uncomment this to test every minute
	public void updateMovieStatusesAutomatically() {
		List<Movies> allMovies = movieRepository.findAll();
		java.util.Date today = new java.util.Date();
		boolean updatedAny = false;
		for (Movies movie : allMovies) {
			if (movie.getStatus() == Movies.Status.COMING_SOON && movie.getReleaseDate() != null) {
				// If release date is before or equal to today
				if (!movie.getReleaseDate().after(today)) {
					movie.setStatus(Movies.Status.NOW_SHOWING);
					movieRepository.save(movie);
					redisTemplate.delete("movie:detail:" + movie.getId());
					updatedAny = true;
				}
			}
		}
		if (updatedAny) {
			System.out.println("[Scheduler] Đã tự động cập nhật trạng thái các phim đến ngày khởi chiếu thành 'Đang chiếu'.");
		}
	}
}
