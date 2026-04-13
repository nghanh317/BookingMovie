package com.example.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.config.exception.AuthExceptionHandler;

import static org.springframework.security.config.Customizer.withDefaults;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

	
	@Autowired
	private AuthExceptionHandler authExceptionHandler;
	
	@Autowired
	private JWTAuthorizationFilter jwtAuthorizationFilter;
	
	@Bean
	public AuthenticationManager authenticationManager(
			AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}

	@SuppressWarnings("removal")
	@Bean
	public SecurityFilterChain configureSecurity(HttpSecurity http) throws Exception {
		http
			.cors(withDefaults())
			.csrf((csrf) -> csrf.disable())
			.authorizeHttpRequests((requests) -> requests
//					AUTH - public (phải đặt trước các rule khác)
					.requestMatchers("/api/v1/auth/**").permitAll()
//					MOVIE - cho phép xem phim mà không cần đăng nhập
					.requestMatchers(HttpMethod.GET, "/api/v1/movies/**").permitAll()
//					ACCOUNT (USER được lấy thông tin tài khoản của mình)
					.requestMatchers(HttpMethod.GET, "/api/v1/accounts/**").hasAnyAuthority( "USER", "ADMIN")
					.requestMatchers(HttpMethod.POST, "/api/v1/accounts/**").hasAuthority("ADMIN")
					.requestMatchers(HttpMethod.PUT, "/api/v1/accounts/**").hasAnyAuthority("USER", "ADMIN") // Cho phép user update
					.requestMatchers(HttpMethod.DELETE, "/api/v1/accounts/**").hasAuthority("ADMIN")
//					Movie - CUD cần ADMIN
					.requestMatchers(HttpMethod.POST, "/api/v1/movies/**").hasAuthority("ADMIN")
					.requestMatchers(HttpMethod.PUT, "/api/v1/movies/**").hasAuthority("ADMIN")
					.requestMatchers(HttpMethod.DELETE, "/api/v1/movies/**").hasAuthority("ADMIN")
//					PROVINCE, CINEMAS, ROOMS, SLOTS, SEATS, PROMOTIONS - Public GET
					.requestMatchers(HttpMethod.GET, "/api/v1/provinces/**", "/api/v1/cinemas/**", "/api/v1/rooms/**", 
							"/api/v1/slots/**", "/api/v1/seats/**", "/api/v1/promotions/**").permitAll()
					
//					TICKET & BOOKING SEAT - USER & ADMIN can create/view
					.requestMatchers(HttpMethod.GET, "/api/v1/tickets/**", "/api/v1/bookingSeats/**").hasAnyAuthority("USER", "ADMIN")
					.requestMatchers(HttpMethod.POST, "/api/v1/tickets/**", "/api/v1/bookingSeats/**").hasAnyAuthority("USER", "ADMIN")
					
//					Other methods for PROVINCE, CINEMA, etc. still require ADMIN
					.requestMatchers(HttpMethod.POST, "/api/v1/provinces/**", "/api/v1/cinemas/**", "/api/v1/rooms/**", "/api/v1/slots/**", "/api/v1/seats/**", "/api/v1/promotions/**").hasAuthority("ADMIN")
					.requestMatchers(HttpMethod.PUT, "/api/v1/provinces/**", "/api/v1/cinemas/**", "/api/v1/rooms/**", "/api/v1/slots/**", "/api/v1/seats/**", "/api/v1/promotions/**").hasAuthority("ADMIN")
					.requestMatchers(HttpMethod.DELETE, "/api/v1/provinces/**", "/api/v1/cinemas/**", "/api/v1/rooms/**", "/api/v1/slots/**", "/api/v1/seats/**", "/api/v1/promotions/**").hasAuthority("ADMIN")

					.requestMatchers("/api/v1/**").hasAuthority("ADMIN")
					.anyRequest().authenticated())
			.httpBasic(withDefaults())
			.addFilterBefore(jwtAuthorizationFilter, UsernamePasswordAuthenticationFilter.class)
			.exceptionHandling()
			.authenticationEntryPoint(authExceptionHandler)
			.accessDeniedHandler(authExceptionHandler);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		final CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
		configuration.applyPermitDefaultValues();
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
