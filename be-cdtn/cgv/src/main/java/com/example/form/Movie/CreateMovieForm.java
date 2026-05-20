package com.example.form.Movie;

import java.util.Date;

import com.example.entity.Movies.AgeRating;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMovieForm {
    private String title;
    
    private String description;
    
    private Integer duration;
    
    // BẮT BUỘC phải có dòng này để đọc được ngày 2026-02-17 từ Postman
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date releaseDate;
    
    private String director;
    
    private String cast;
    
    private String genre;
    
    private String language;
    
    // Thêm lại 2 trường này để khớp với Postman
    private String posterUrl;
    
    private String trailerUrl;
    
    private String status;

    private AgeRating ageRating;
}