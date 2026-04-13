package com.example.entity;

import java.io.Serializable;
import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table ( name = "Reviews")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Reviews implements Serializable{
	private static final long serialVersionUID = 1L;

@Column (name ="id")
@Id
@GeneratedValue (strategy = GenerationType.IDENTITY)
private Integer id;

@ManyToOne
@JoinColumn (name = "account_id")
private Accounts account;

@ManyToOne
@JoinColumn ( name = "movie_id")
private Movies movie;

@Min((long) 1.0)
@Max((long) 5.0)
@NonNull
@Column (name ="rating", nullable = false)
private Double rating;

@NonNull
@Column (name = "comment")
private String comment;

@Column (name = "create_at")
@Temporal (TemporalType.TIMESTAMP)
@CreationTimestamp
private Date createDate;

@Column ( name ="update_at")
@Temporal (TemporalType.TIMESTAMP)
@UpdateTimestamp
private Date updateDate;

@Column (name = "is_deleted")
private Boolean isDeleted;

@PrePersist
public void prePersist() {
	if (isDeleted == null) {
		isDeleted = false;
	}
}


}
