package com.example.entity;

import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table ( name = "PromotionUsage")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class PromotionUsage implements Serializable{
	private static final long serialVersionUID = 1L ;
	
@Column ( name = "id")
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id;

@Column ( name = "discount_amount", nullable = false , precision = 10 , scale = 2)
private BigDecimal discountAmount;

@Column (name = "used_at")
@Temporal(TemporalType.TIMESTAMP)
@CreationTimestamp
private Date usedAt;

@ManyToOne
@JoinColumn ( name = "promotion_id")
@NonNull
private Promotions promotion;

@ManyToOne
@JoinColumn ( name = "account_id")
@NonNull
private Accounts account;

@ManyToOne 
@JoinColumn ( name = "tickets_id")
@NonNull
private Tickets ticket;
}
