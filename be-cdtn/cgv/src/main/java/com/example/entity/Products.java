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
@Table (name = "Products")
@Setter
@Getter
@NoArgsConstructor
@RequiredArgsConstructor
public class Products implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column (name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column (name = "product_name", length = 100, nullable = false)
	@NonNull
	private String productName;
	
	@Column (name = "category", nullable = false)
	@Convert (converter = productCategoryConverter.class)
	private Category category;
	
	@Column (name = "description")
	@NonNull
	private String description;
	
	@Column (name = "price", nullable =  false,precision = 10, scale = 2)
	@NonNull
	private BigDecimal price;
	
	@Column (name = "image_url")
	@NonNull
	private String imageUrl;
	
	@Column (name = "create_at")
	@Temporal (TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createDate;
	
	@Column (name = "is_deleted")
	private Boolean isDeleted;
	
	@OneToMany (mappedBy = "products")
	private List<TicketsDetails> ticketsDetails;
	
	@PrePersist
	public void prePersist () {
		if (isDeleted == null){
			isDeleted = false;
		}
	}
@Getter
@NoArgsConstructor
public enum Category{
		FOOD("food"), DRINK("drink"), COMBO("combo"), VOUCHER("voucher");
		
		private String value;
		
		private Category(String value) {
			this.value=value;
		}
		
		public static Category toEnum(String sqlValue) {
			for (Category category : Category.values()) {
				if (category.getValue().equals(sqlValue)) {
					return category;
				}
			}
			return null;
		}
		
	}
	}
	@Converter(autoApply = true)
	class productCategoryConverter implements AttributeConverter<Products.Category, String>{

		@Override
		public String convertToDatabaseColumn(Products.Category category) {
			if (category == null) {
				return  null;
			}
			return category.getValue();
		}

		@Override
		public Products.Category convertToEntityAttribute(String sqlCatergory) {
			if (sqlCatergory == null){
				return null;
			}
			return Products.Category.toEnum(sqlCatergory);
		}
	}
