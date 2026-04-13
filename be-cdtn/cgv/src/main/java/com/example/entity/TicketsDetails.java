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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity 
@Table ( name = "TicketsDetails")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class TicketsDetails implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column (name ="id")
	@Id
	@GeneratedValue (strategy =  GenerationType.IDENTITY)
	private Integer id;

	@Column ( name = "quantity", nullable = false)
	@NonNull
	private Integer quantity;
	
	@Column ( name = "unit_price", nullable = false, precision = 10, scale = 2)
	@NonNull
	private BigDecimal unitPrice;
	
	@Column ( name = "total_price", nullable = false, precision = 10,scale = 2)
	@NonNull
	private BigDecimal totalPrice;
	
	@Column ( name = "is_deleted")
	private Boolean isDeleted;
	
	@ManyToOne
	@JoinColumn ( name ="tickets_id")
	private Tickets tickets;
	
	@ManyToOne 
	@JoinColumn (name = "product_id")
	private Products products;
	
	@PrePersist
	public void prePersist () {
		if ( isDeleted == null) {
			isDeleted = false;
		}
	}
}
