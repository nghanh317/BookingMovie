package com.example.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
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
@Table ( name = "Cinemas")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Cinemas implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column (name = "id")
	@Id
	@GeneratedValue( strategy = GenerationType.IDENTITY)
	private Integer id;

	
	@Column ( name = "cinema_name", length = 100, nullable = false)
	@NonNull
	private String cinemaName;
	
	@Column ( name = "address", length = 255, nullable = false)
	@NonNull
	private String address;
	
	@Column (name = "latitude", precision = 10, scale = 8 )
	private BigDecimal latitude;
	
	@Column (name = "longitude", precision = 11, scale = 8)
	private BigDecimal longitude;
	
	@Column ( name = "status")
	@Convert(converter = CinemaStatusConverter.class)
	private Status status;
	
	@Column ( name = "phone", length = 10)
	@NonNull
	private String phone;
	
	@Column ( name = "email", length = 50)
	@NonNull
	private String email;
	
	@Column ( name = "create_at")
	@Temporal (TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createDate;
	
	@Column (name = "is_deleted")
	private Boolean isDeleted;
	
	@ManyToOne 
	@JoinColumn (name = "province_id")
	private Provinces provinces;
	
	
	@OneToMany (mappedBy =  "cinemas")
	private List<Rooms> rooms;
	
	@ManyToMany (mappedBy = "cinemas")
	private List<Movies> movies;
	
	@OneToMany(mappedBy = "cinemas")
	private List<MovieCinema> movieCinemas; 
	
	@PrePersist
	public void prePersist() {
		if (status == null) {
			status = Cinemas.Status.ACTIVE;
		}
		if (isDeleted == null) {
			isDeleted = false;
		}
	}
@Getter
@NoArgsConstructor
public enum Status{
	ACTIVE("active"), INACTIVE("inactive");
	
	private String value;
	
	private Status(String value) {
		this.value=value;
	}
	
	public static Status toEnum(String sqlValue) {
		for (Status status : Status.values()) {
			if (status.getValue().equals(sqlValue)) {
				return status;
			}
		}
		return null;
	}
	
}
}
@Converter(autoApply = true)
class CinemaStatusConverter implements AttributeConverter<Cinemas.Status, String>{

	@Override
	public String convertToDatabaseColumn(Cinemas.Status status) {
		if (status == null) {
			return  null;
		}
		return status.getValue();
	}

	@Override
	public Cinemas.Status convertToEntityAttribute(String sqlStatus) {
		if (sqlStatus == null){
			return null;
		}
		return Cinemas.Status.toEnum(sqlStatus);
	}
	
}