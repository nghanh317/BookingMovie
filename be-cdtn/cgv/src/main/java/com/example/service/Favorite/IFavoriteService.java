package com.example.service.Favorite;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.example.dto.FavoritesDTO;
import com.example.form.Favorite.CreateFavorite;

public interface IFavoriteService {

	Page<FavoritesDTO> getAllFavorite (Pageable pageable);
	
	void create (CreateFavorite form);
}
