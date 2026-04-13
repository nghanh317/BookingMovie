package com.example.entity;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;
import jakarta.persistence.Entity;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
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
@Table ( name = "Accounts")
@Getter
@Setter
@NoArgsConstructor 
@RequiredArgsConstructor
public class Accounts implements Serializable {
	public static final long serialVersionUID =1L;
	
	@Column ( name = "id")
	@Id
	@GeneratedValue (strategy =  GenerationType.IDENTITY)
	private Integer id;
	
	@Column ( name = "username",length = 50, unique = true, nullable = false)
	@NonNull
	private String userName;
	
	@Column ( name = "password_hash", length = 255, nullable = false)
	@NonNull
	private String passwordHash;
	
	@Column (name = "email", length = 50, unique = true, nullable = false)
	@NonNull
	private String email;
	
	@Column ( name = "phone", length = 15, unique =  true, nullable = false)
	@NonNull
	private String phone;
	
	@Column ( name = "full_name", length =  50, nullable = false)
	@NonNull
	private String fullName;
	
	@Column ( name = "role" , nullable = false)
	@Convert (converter = AccountRoleConverter.class)
	private Role role;
	
	@Column(name = "create_at")
	@Temporal (TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createDate;
	
	@Column (name = "is_deleted")
	private Boolean isDeleted;
	
	@OneToMany (mappedBy = "accounts")
	private List<Tickets> tickets;
	
	@OneToMany (mappedBy = "accounts")
	private List<Favorites> favorites;
	
	@OneToMany (mappedBy = "account")
	private List<Reviews> reviews;
	
	@OneToMany (mappedBy = "account")
	private List<PromotionUsage> promotionUsages;
	
	@PrePersist
	public void prePersist() {
		if (role == null) {
			role = Role.USER;
		}
		if (isDeleted == null) {
			isDeleted = false;
		}
	}
@Getter
@NoArgsConstructor
public enum Role {
		ADMIN("admin"), USER("user");
		
		private String value;
		
		private Role(String value) {
			this.value=value;
		}
		
		public static Role toEnum(String sqlStatus)  {
			for(Role roles : Role.values()) {
				if (roles.getValue().equals(sqlStatus)) {
					return roles;
				}
			}
			return null;
		}
	}
	
}

@Converter (autoApply = true)

class AccountRoleConverter implements AttributeConverter<Accounts.Role, String>{
	public String convertToDatabaseColumn (Accounts.Role role) {
		if (role == null) {
			return null;
		}
		return role.getValue();
	}
	
	public Accounts.Role convertToEntityAttribute (String sqlRole){
		if (sqlRole == null) {
			return null;
		}
		return Accounts.Role.toEnum(sqlRole);
	}
}
