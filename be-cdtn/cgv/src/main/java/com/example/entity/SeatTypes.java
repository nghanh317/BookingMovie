package com.example.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table ( name = "`SeatTypes`")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class SeatTypes implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column (name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column (name = "type_name", length = 50, nullable = false)
	@NonNull
	private String typeName;
	
	@Column ( name = "price_multiplier" , precision = 3, scale = 2)
	private BigDecimal priceMultiplier;
	
	@Column (name = "description" , length = 255)
	@NonNull
	private String description;
	
	@Column (name = "is_deleted")
	private Boolean isDeleted;
	
	@OneToMany (mappedBy = "seatTypes")
	private List<Seats> seats;
	
	@PrePersist
	public void prePersist() {
		if (priceMultiplier == null) {
			priceMultiplier = BigDecimal.valueOf(1.00);
		}
		if (isDeleted == null) {
			isDeleted = false;
		}
	}

}
