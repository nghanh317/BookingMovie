package com.example.entity;

import java.io.Serializable;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table (name= "MovieCinemas")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class MovieCinema implements Serializable{
	
	private static final long serialVersionUID = 1L;
	
	@EmbeddedId
	@NonNull
	private MovieCinemaPk pk;

	
	@ManyToOne
	@MapsId("movieId")
	@JoinColumn(name = "movie_id")
	private Movies movies;
	
	@ManyToOne
	@MapsId("cinemaId")
	@JoinColumn(name = "cinema_id")
	private Cinemas cinemas;
	
	@Embeddable
	@Getter
	@Setter
	@NoArgsConstructor
	@RequiredArgsConstructor
	public static class MovieCinemaPk implements Serializable{
		private static final long serialVersionUID = 1L;
		
		@Column(name = "movie_id")
		@NonNull
		private Integer movieId;
		
		@Column (name = "cinema_id")
		@NonNull
		private Integer cinemaId;
		
		
	}
}
