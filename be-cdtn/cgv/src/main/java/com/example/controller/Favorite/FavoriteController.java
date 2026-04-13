package com.example.controller.Favorite;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.dto.FavoritesDTO;
import com.example.form.Favorite.CreateFavorite;
import com.example.service.Favorite.FavoriteService;

@RestController
@RequestMapping("api/v1/favorites")
public class FavoriteController {
	@Autowired
	private FavoriteService favoriteService;
	
	@GetMapping
	Page<FavoritesDTO> getAllFavorite (Pageable pageable){
		return favoriteService.getAllFavorite(pageable);
	}
	
	@PostMapping("/{id}")
	public void createFavorite (@RequestBody CreateFavorite form) {
		favoriteService.create(form);
	}

}
