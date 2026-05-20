package com.example.form.Movie;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMovieForm {

    private String title;

    private String description;

    private Integer duration;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date releaseDate;

    private String director;

    private String cast;

    private String genre;

    private String language;

    private String posterUrl;

    private String trailerUrl;

    private String status;
}
