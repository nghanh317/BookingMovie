package com.example.entity;

import java.io.Serializable;
import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

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
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "Favorites")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Favorites implements Serializable{
	private static final long serialVersionUID = 1L;

@Column (name ="id")
@Id
@GeneratedValue (strategy = GenerationType.IDENTITY)
private Integer id;

@Column (name = "create_at")
@Temporal(TemporalType.TIMESTAMP)
@CreationTimestamp
private Date createDate;

@Column ( name ="is_deleted")
private Boolean isDeleted;

@ManyToOne
@JoinColumn (name = "account_id")
private Accounts accounts;

@ManyToOne
@JoinColumn ( name ="movie_id")
private Movies movies;

@PrePersist
public void prePersist() {
	if (isDeleted == null) {
		isDeleted = false;
	}
}

}
