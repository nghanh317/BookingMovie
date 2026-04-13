package com.example.entity;

import java.io.Serializable;
import java.util.List;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table ( name = "Rooms")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Rooms implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column ( name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column ( name = "room_name", length = 50, nullable = false)
	@NonNull
	private String roomName;
	
	@Column ( name = "room_type", length =  50)
	@NonNull
	private String roomType;
	
	@Column (name = "total_seats", nullable = false)
	@NonNull
	private Integer totalSeats;
	
	@Column ( name = "status")
	@Convert (converter = RoomStatusConverter.class)
	private Status status;
	
	@Column (name = "is_deleted")
	private Boolean isDeleted;
	
	@ManyToOne 
	@JoinColumn (name = "cinema_id")
	private Cinemas cinemas;
	
	@OneToMany (mappedBy = "rooms")
	private List<Seats> seats;
	
	@OneToMany (mappedBy = "rooms")
	private List<Slots> slots;
	
	@PrePersist
	public void prePersist() {
		if (status == null) {
			status = Rooms.Status.ACTIVE;
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
class RoomStatusConverter implements AttributeConverter<Rooms.Status, String>{

	@Override
	public String convertToDatabaseColumn(Rooms.Status status) {
		if (status == null) {
			return  null;
		}
		return status.getValue();
	}

	@Override
	public Rooms.Status convertToEntityAttribute(String sqlStatus) {
		if (sqlStatus == null){
			return null;
		}
		return Rooms.Status.toEnum(sqlStatus);
	}


}