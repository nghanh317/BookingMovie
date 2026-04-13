package com.example.entity;

import java.io.Serializable;
import java.math.BigDecimal;
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
@Table (name = "Promotions")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Promotions implements Serializable{
	static final long serialVersionUID = 1L;
	
@Column ( name = "id")
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id;

@Column ( name = "promotion_code" , length = 50 , nullable = false , unique = true)
@NonNull
private String promotionCode;

@Column ( name ="promotion_name", length = 200, nullable = false)
@NonNull
private String promotionName;

@Column ( name = "description")
@NonNull
private String description;

@Column (name = "discount_type")
@NonNull
@Convert (converter = promotionDiscountType.class)
private DiscountType discountType;

@Column (name = "discount_value" ,nullable = false, precision = 10, scale = 2)
@NonNull
private BigDecimal discountValue;

@NonNull
@Column (name = "max_discount_amount" , precision = 10 , scale = 2)
private BigDecimal maxDiscountAmount;

@NonNull
@Column ( name = "min_order_amount", precision = 10 , scale = 2)
private BigDecimal minOrderAmount;

@NonNull
@Column ( name ="usage_limit")
private Integer usageLimit;

@NonNull
@Column ( name = "usage_count")
private Integer usageCount;

@NonNull
@Column ( name = "usage_per_user")
private Integer usagePerUser;

@NonNull
@Column ( name = "start_date", nullable =  false)
@Temporal(TemporalType.TIMESTAMP)
private Date startDate;

@NonNull
@Column (name = "end_date", nullable = false)
@Temporal (TemporalType.TIMESTAMP)
private Date endDate;

@NonNull
@Column (name = "applicable_days", length = 50)
private String applicableDay;

@NonNull
@Column (name = "applicable_movies")
private String applicableMovie;

@NonNull
@Column (name = "applicable_cinemas")
private String applicableCinema;

@NonNull
@Column ( name = "status")
@Convert (converter = promotionStatus.class)
private Status status;

@NonNull
@Column ( name = "image_url" , length = 255)
private String imageUrl;

@Column ( name = "create_at")
@Temporal(TemporalType.TIMESTAMP)
@CreationTimestamp
private Date createDate;

@Column ( name = "update_at")
@Temporal (TemporalType.TIMESTAMP)
@UpdateTimestamp
private Date updateDate;

@Column (name = "is_deleted")
private Boolean isDeleted;

@OneToMany ( mappedBy = "promotion")
private List<PromotionUsage> promotionUsages;

@OneToMany (mappedBy = "promotion")
private List<Tickets> tickets;

@PrePersist
public void prePersist() {
	if (usagePerUser == null) {
		usagePerUser = 1;
	}
	if (status == null) {
		status = Status.ACTIVE;
	}
	if (isDeleted == null) {
		isDeleted = false;
	}
	if (usageCount == null) {
		usageCount = 0;
	}
}

@Getter
@NoArgsConstructor
public enum DiscountType{
	PERCENTAGE("percentage") , FIXED_AMOUNT("fixed_amount");
	
	private String value;
	
	private DiscountType (String value) {
		this.value=value;
	}
	
	public static DiscountType toEnum(String splValue) {
		 for (DiscountType discountType : DiscountType.values()) {
			 if (discountType.getValue().equals(splValue)) {
				 return discountType;
			 }
		}
		 return null;
	}
}

@Getter
@NoArgsConstructor
public enum Status {
	ACTIVE("active"), INACTIVE ("inactive") , EXPIRED ("expired");
	
	private String value;
	
	private Status (String value) {
		this.value = value ;
	}
	public static Status toEnum(String splValue) {
		for (Status status : Status.values()) {
			if (status.getValue().equals(splValue)) {
				return status;
			}
		}
		return null;
	}
}
}

@Converter (autoApply = true)
class promotionDiscountType implements AttributeConverter<Promotions.DiscountType, String>{

	@Override
	public String convertToDatabaseColumn(Promotions.DiscountType discountType) {
		if ( discountType == null) {
			return null;
		}
			return discountType.getValue();
	}

	@Override
	public Promotions.DiscountType convertToEntityAttribute(String sqlDiscountType) {
		if ( sqlDiscountType == null){
			return null;
		}
			return Promotions.DiscountType.toEnum(sqlDiscountType);
	}
}


@Converter (autoApply = true)
class promotionStatus implements AttributeConverter<Promotions.Status, String>{
	
	@Override
	public String convertToDatabaseColumn (Promotions.Status status) {
		if (status == null) {
			return null;
		}
		return status.getValue();
	}
	
	@Override
	public Promotions.Status convertToEntityAttribute (String sqlStatus){
		if (sqlStatus == null) {
			return null;
		}
		return Promotions.Status.toEnum(sqlStatus);
	}
}