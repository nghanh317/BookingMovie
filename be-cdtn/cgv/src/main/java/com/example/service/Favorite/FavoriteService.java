package com.example.service.Favorite;

import java.util.List;

import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.dto.FavoritesDTO;
import com.example.entity.Accounts;
import com.example.entity.Favorites;
import com.example.entity.Movies;
import com.example.form.Favorite.CreateFavorite;
import com.example.repository.FavoritesRepossitory;

@Service
public class FavoriteService implements IFavoriteService {
	
	@Autowired
	private FavoritesRepossitory favoritesRepossitory;
	
	@Autowired
	private ModelMapper modelMapper;

	@Override
	public Page<FavoritesDTO> getAllFavorite(Pageable pageable) {
		Page<Favorites> favoritePage = favoritesRepossitory.findAll(pageable);
		List<FavoritesDTO> dto = modelMapper.map(favoritePage.getContent(),new TypeToken <List<FavoritesDTO>>() {}.getType());
		Page<FavoritesDTO> dtoPage = new PageImpl<>(dto, pageable, favoritePage.getTotalElements());
		return dtoPage;
	}

	@Override
	public void create(CreateFavorite form) {
		Favorites favorites = new Favorites();
		
		Accounts account = new Accounts();
		account.setId(form.getAccountId());
		favorites.setAccounts(account);
		
		Movies movies = new Movies();
		movies.setId(form.getMovieId());
		favorites.setMovies(movies);
		
		favoritesRepossitory.save(favorites);
		
	}

	
}
