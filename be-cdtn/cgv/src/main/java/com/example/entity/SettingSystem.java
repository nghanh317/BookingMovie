package com.example.entity;

import java.io.Serializable;
import java.util.Date;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Table (name = "setting_system")
@Getter
@Setter
@NoArgsConstructor
@RequiredArgsConstructor
public class SettingSystem implements Serializable{
	public static final long serialVersionUID = 1L;
	
	@Column (name = "id")
	@Id
	@GeneratedValue (strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column (name = "create_at")
	@Temporal (TemporalType.TIMESTAMP)
	@CreationTimestamp
	private Date createDate;
	
	@Column(name = "config_data", nullable = false, columnDefinition = "JSON")
	@NonNull
    private String configData;
	
	@Column ( name = "type", length =  100 , unique = true, nullable = false)
	@NonNull
	private String type;
}
