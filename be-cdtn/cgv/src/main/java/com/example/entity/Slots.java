package com.example.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
@Table (name = "Slots")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Slots implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column(name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	@Column (name = "show_time", nullable = false)
	@Temporal (TemporalType.TIMESTAMP)
	@NonNull
	private Date showTime;
	
	@Column ( name = "end_time", nullable = false)
	@Temporal ( TemporalType.TIMESTAMP)
	@NonNull
	private Date endTime;
	
	@Column (name = "price", precision = 10, scale = 2)
	@NonNull
	private BigDecimal price;
	
	@Column (name ="empty_seats", nullable = false)
	@NonNull
	private Integer emptySeats;
	
	@Column (name = "create_at")
	@Temporal (TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createDate;
	
	@Column ( name = "is_deleted")
	private Boolean isDeleted;
	
	@ManyToOne
	@JoinColumn ( name = "movie_id")
	private Movies movies;
	
	@ManyToOne
	@JoinColumn ( name = "room_id")
	private Rooms rooms;
	
	@OneToMany(mappedBy =  "slots")
	private List<Tickets> tickets;
	
	@PrePersist
	public void prePersists() {
		if (isDeleted == null) {
			isDeleted = false;
		}
	}

}
