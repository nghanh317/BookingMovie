package com.example.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table ( name = "Movies")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Movies implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column ( name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column ( name = "title", length = 255, nullable = false)
	@NonNull
	private String title;
	
	@Column ( name = "description" )
	@NonNull
	private String description;
	
	@Column ( name = "duration" , nullable =  false)
	@NonNull
	private Integer duration;
	
	@Column ( name = "release_date")
	@Temporal (TemporalType.DATE)
	@CreationTimestamp
	@NonNull
	private Date releaseDate;
	
	@Column ( name ="director", length = 100)
	@NonNull
	private String director;
	
	@Column (name ="cast")
	@NonNull
	private String cast;
	
	@Column ( name = "genre", length = 100)
	@NonNull
	private String genre;
	
	@Column ( name ="language", length = 50)
	@NonNull
	private String language;
	
	@Column ( name = "poster_url", length = 255)
	private String posterUrl;
	
	@Column ( name = "trailer_url", length = 255)
	private String trailerUrl;
	
	@Column ( name = "status")
	@Convert (converter = moviesStatusConverter.class)
	private Status status;
	
	@Column ( name = "create_at")
	@Temporal (TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createDate;
	
	@Column ( name = "update_at")
	@Temporal (TemporalType.TIMESTAMP)
	@UpdateTimestamp
	private Date updateDate;
	
	@Column ( name = "is_deleted")
	private Boolean isDeleted;
	
	@OneToMany (mappedBy = "movies")
	private List<Slots> slots;
	
	@OneToMany (mappedBy = "movies")
	private List<Favorites> favorites;
	
	@OneToMany (mappedBy = "movie")
	private List<Reviews> reviews;
	
	@ManyToMany
	@JoinTable(
			name = "MovieCinemas",
			joinColumns = {@JoinColumn(name = "movie_id")},
			inverseJoinColumns = {@JoinColumn (name = "cinema_id")}
			)
	private List<Cinemas> cinemas;
	
	
	
	@PrePersist
	public void prePersist() {
		if ( isDeleted == null) {
			isDeleted = false;
		}
	}
	
	
@Getter
@NoArgsConstructor
public enum Status{
		COMING_SOON("coming_soon"), NOW_SHOWING("now_showing"), ENDED("ended");
		
		private String value;
		
		private Status(String value) {
			this.value=value;
		}
		
		public static Status toEnum(String sqlValue) {
			for ( Status status : Status.values()) {
				if (status.getValue().equals(sqlValue)) {
					return status;
				}
			}
			return null;
		}
	}
}
@Converter (autoApply = true)
class moviesStatusConverter implements AttributeConverter<Movies.Status, String>{
	
	public String convertToDatabaseColumn (Movies.Status status) {
		if ( status == null) {
			return null;
		}
		return status.getValue();
	}
	
	public Movies.Status convertToEntityAttribute (String sqlStatus){
		if ( sqlStatus == null) {
			return null;
		}
		return Movies.Status.toEnum(sqlStatus);
	}
}