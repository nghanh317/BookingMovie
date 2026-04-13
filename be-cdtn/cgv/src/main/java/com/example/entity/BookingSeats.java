package com.example.entity;

import java.io.Serializable;
import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table (name = "BookingSeats", uniqueConstraints = {@UniqueConstraint(columnNames = {"tickets_id", "seat_id"})})
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class BookingSeats implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column ( name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column (name = "seat_price", precision = 10, scale = 2)
	@NonNull
	private BigDecimal seatPrice;
	
	@Column ( name = "is_deleted")
	private Boolean isDeleted;
	
	@ManyToOne
	@JoinColumn (name = "tickets_id")
	private Tickets tickets;
	
	@ManyToOne
	@JoinColumn ( name = "seat_id")
	private Seats seats;
	
	@PrePersist
	public void prePersist() {
		if (isDeleted == null) {
			isDeleted = false;
		}
	}
}
