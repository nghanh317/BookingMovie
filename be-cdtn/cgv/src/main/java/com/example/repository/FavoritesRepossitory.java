package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.entity.Favorites;


@Repository
public interface FavoritesRepossitory extends JpaRepository<Favorites, Integer> {
}
