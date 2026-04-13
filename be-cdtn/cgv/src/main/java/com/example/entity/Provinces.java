package com.example.entity;

import java.io.Serializable;
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
@Table ( name = "`Provinces`")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class Provinces implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column ( name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	
	@Column (name = "province_name", length = 100, nullable = false)
	@NonNull
	private String provinceName;
	
	@Column( name = "is_deleted")
	private Boolean isDeleted;
	
	
	@OneToMany (mappedBy = "provinces")
	private List<Cinemas> cinemas;
	
	
	@PrePersist 
	public void prePesist() {
		if (isDeleted == null) {
			isDeleted = false;
		}
	}

}
