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
@Table (name = "Tickets")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Tickets implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column ( name = "id")
	@Id
	@GeneratedValue ( strategy = GenerationType.IDENTITY)
	private Integer id;
	@Column (name = "tickets_code", length = 20 , unique = true, nullable = false)
	@NonNull
	private String ticketsCode;
	
	@Column(name = "promotion_code" , length = 50)
	private String promotionCode;
	
	@Column( name = "qr_code_url", length = 255)
	@NonNull
	private String qrCodeUrl;
	
	@Column (name = "qr_code_data")
	@NonNull
	private String qrCodeData;
	
	@Column ( name = "tickets_date")
	@Temporal (TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date ticketsDate;
	
	@Column ( name = "total_amount", nullable = false, precision = 10, scale = 2)
	@NonNull
	private BigDecimal totalAmount;
	
	@Column(name = "discount_amount")
	@NonNull
	private BigDecimal discountAmount;
	
	@Column (name = "final_amount", nullable = false)
	@NonNull
	private BigDecimal finalAmount;
	
	@Column ( name = "payment_status" , nullable = false)
	@Convert (converter = ticketPaymentStatusConverter.class)
	private PaymentStatus paymentStatus;
	
	@Column ( name = "status")
	@Convert (converter = ticketStatusConverter.class)
	private Status status;
	
	@Column (name = "note")
	private String note;
	
	
	@Column (name = "is_deleted")
	private Boolean isDeleted;
	
	@ManyToOne 
	@JoinColumn ( name = "account_id")
	private Accounts accounts;
	
	@ManyToOne
	@JoinColumn (name = "slot_id")
	private Slots slots;
	
	@ManyToOne
	@JoinColumn (name ="promotion_id")
	private Promotions promotion;
	
	@OneToMany (mappedBy = "tickets")
	private List<BookingSeats> bookingSeats;
	
	@OneToMany (mappedBy = "tickets")
	private List<TicketsDetails> ticketsDetails;
	
	@OneToMany (mappedBy = "ticket")
	private List<PromotionUsage> promotionUsages;
	
	@PrePersist
	public void prePersist() {
		if (isDeleted == null) {
			isDeleted = false;
		}
		if (paymentStatus == null) {
			paymentStatus = PaymentStatus.UNPAID;
		}
		if (status == null) {
			status = Status.PENDING;
		}
	}
	
@Getter
@NoArgsConstructor
public enum PaymentStatus{
	UNPAID("unpaid"), PAID("paid"), REFUNDED("refunded");
	
	private String value;
	
	private PaymentStatus(String value) {
		this.value=value;
	}
	
	public static PaymentStatus toEnum(String sqlValue) {
		for (PaymentStatus paymentStatus : PaymentStatus.values()) {
			if (paymentStatus.getValue().equals(sqlValue)) {
				return paymentStatus;
			}
		}
		return null;
	}
}



@Getter
@NoArgsConstructor
public enum Status{
	PENDING("pending"), CONFIRMED("confirmed"), CANCELLED("cancelled");
	
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
class ticketPaymentStatusConverter implements AttributeConverter<Tickets.PaymentStatus, String>{

	@Override
	public String convertToDatabaseColumn(Tickets.PaymentStatus paymentStatus) {
		if (paymentStatus == null) {
			return  null;
		}
		return paymentStatus.getValue();
	}

	@Override
	public Tickets.PaymentStatus convertToEntityAttribute(String sqlStatus) {
		if (sqlStatus == null){
			return null;
		}
		return Tickets.PaymentStatus.toEnum(sqlStatus);
	}


}



@Converter(autoApply = true)
class ticketStatusConverter implements AttributeConverter<Tickets.Status, String>{

	@Override
	public String convertToDatabaseColumn(Tickets.Status status) {
		if (status == null) {
			return  null;
		}
		return status.getValue();
	}

	@Override
	public Tickets.Status convertToEntityAttribute(String sqlStatus) {
		if (sqlStatus == null){
			return null;
		}
		return Tickets.Status.toEnum(sqlStatus);
	}


}
