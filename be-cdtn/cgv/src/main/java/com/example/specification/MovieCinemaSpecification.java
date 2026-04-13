package com.example.specification;

import org.springframework.data.jpa.domain.Specification;

import com.example.entity.MovieCinema;
import com.example.form.MovieCinema.MovieCinemaFilterForm;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

public class MovieCinemaSpecification {
@SuppressWarnings ("removal")
    public static Specification<MovieCinema> buildWhere(MovieCinemaFilterForm filterForm) {
        Specification<MovieCinema> where = Specification.where(null);

        if (filterForm == null) {
            return where;
        }

        if (filterForm.getMovieId() != null) {
            CustomSpecification movieIdSpec = new CustomSpecification("movieId", filterForm.getMovieId());
            where = where.and(movieIdSpec);
        }
        if (filterForm.getCinemaId() != null) {
            CustomSpecification cinemaIdSpec = new CustomSpecification("cinemaId", filterForm.getCinemaId());
            where = where.and(cinemaIdSpec);
        }

   
        if (filterForm.getMovieName() != null && !filterForm.getMovieName().isEmpty()) {
            CustomSpecification movieNameSpec = new CustomSpecification("movie.name", filterForm.getMovieName());
            where = where.and(movieNameSpec);
        }


        if (filterForm.getCinemaName() != null && !filterForm.getCinemaName().isEmpty()) {
            CustomSpecification cinemaNameSpec = new CustomSpecification("cinema.name", filterForm.getCinemaName());
            where = where.and(cinemaNameSpec);
        }

        return where;
    }
@SuppressWarnings("serial")
@RequiredArgsConstructor
    static class CustomSpecification implements Specification<MovieCinema> {

        @NonNull
        private String field;

        @NonNull
        private Object value;

        @Override
        public Predicate toPredicate(
                Root<MovieCinema> root,
                CriteriaQuery<?> query,
                CriteriaBuilder criteriaBuilder) {
            
  
            if (field.equalsIgnoreCase("movieId")) {
                return criteriaBuilder.equal(root.get("pk").get("movieId"), value);
            }
            
       
            if (field.equalsIgnoreCase("cinemaId")) {
                return criteriaBuilder.equal(root.get("pk").get("cinemaId"), value);
            }
            
         
            if (field.equalsIgnoreCase("movie.name")) {
                return criteriaBuilder.like(root.get("movie").get("title"),"%" + value.toString().toLowerCase() + "%");
            }
            
  
            if (field.equalsIgnoreCase("cinema.name")) {
                return criteriaBuilder.like(root.get("cinema").get("cinemaName"),"%" + value.toString().toLowerCase() + "%");
            }
            
            return null;
        }
    }
}