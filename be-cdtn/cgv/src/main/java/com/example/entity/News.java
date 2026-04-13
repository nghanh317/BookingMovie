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
@Table ( name = "News")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class News implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column ( name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column ( name = "title", length = 200, nullable = false)
	@NonNull
	private String title;
	
	@Column ( name = "content", nullable = false)
	@NonNull
	private String content;
	
	@Column (name = "image_url", length = 255)
	private String imageUrl;
	
	@Column ( name = "create_at")
	@Temporal (TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createDate;
	
	@Column ( name = "update_at")
	@Temporal ( TemporalType.TIMESTAMP)
	@UpdateTimestamp
	private Date updateDate;
	
	@Column ( name = "is_deleted")
	private Boolean isDeleted;
	
	@PrePersist
	public void prePersist() {
		if (isDeleted == null) {
			isDeleted = false;
		}
	}
}
