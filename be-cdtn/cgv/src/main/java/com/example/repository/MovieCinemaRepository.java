package com.example.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.example.entity.MovieCinema;
import com.example.entity.MovieCinema.MovieCinemaPk;

@Repository
public interface MovieCinemaRepository extends JpaRepository<MovieCinema, MovieCinemaPk> , JpaSpecificationExecutor<MovieCinema>{

}