package com.example.entity;

import java.io.Serializable;
import java.util.List;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table ( name = "Seats",uniqueConstraints = {
        @UniqueConstraint(columnNames = {"room_id", "seat_row", "seat_number"})})
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Seats implements Serializable {
	public static final long serialVersionUID = 1L;
	
	@Column ( name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	
	@Column ( name = "seat_row", length = 5, nullable = false)
	@NonNull
	private String seatRow;
	
	@Column (name = "seat_number", nullable = false)
	@NonNull
	private Integer seatNumber;

	
	@Column (name = "status")
	@Convert (converter = SeatStatusConverter.class)
	private Status status;
	
	@ManyToOne
	@JoinColumn (name = "room_id")
	private Rooms rooms;
	
	@ManyToOne (fetch = FetchType.EAGER)
	@JoinColumn (name = "seat_type_id")
	private SeatTypes seatTypes;
	
	@OneToMany (mappedBy = "seats")
	private List<BookingSeats> bookingSeats;
	
	
	@PrePersist
	public void prePersist() {
		if (status == null) {
			status = Seats.Status.ACTIVE;
		}
	}
@Getter
@NoArgsConstructor
public enum Status{
	ACTIVE("active"), BROKEN("broken");
	
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
class SeatStatusConverter implements AttributeConverter<Seats.Status, String>{

	@Override
	public String convertToDatabaseColumn(Seats.Status status) {
		if (status == null) {
			return  null;
		}
		return status.getValue();
	}

	@Override
	public Seats.Status convertToEntityAttribute(String sqlStatus) {
		if (sqlStatus == null){
			return null;
		}
		return Seats.Status.toEnum(sqlStatus);
	}
}
