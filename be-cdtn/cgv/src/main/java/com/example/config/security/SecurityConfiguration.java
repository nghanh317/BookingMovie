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
						// Chatbot AI - Æ°u tiÃªn cao nháº¥t
						.requestMatchers("/api/v1/ai/**").permitAll()
						.requestMatchers("/api/v1/accounts/**").permitAll()
						// Movie
						.requestMatchers(HttpMethod.GET, "/api/v1/movies/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/movies/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/v1/movies/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/movies/**").hasAuthority("ADMIN")
						// PROMOTIONS
						.requestMatchers("/api/v1/promotions/**").permitAll()
						// PROVINCE
						.requestMatchers(HttpMethod.GET, "/api/v1/provinces/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/provinces/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/v1/provinces/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/provinces/**").hasAuthority("ADMIN")
						// CINEMAS
						.requestMatchers(HttpMethod.GET, "/api/v1/cinemas/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/cinemas/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/v1/cinemas/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/cinemas/**").hasAuthority("ADMIN")
						// ROOM
						.requestMatchers(HttpMethod.GET, "/api/v1/rooms/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/rooms/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/v1/rooms/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/rooms/**").hasAuthority("ADMIN")
						//SLOTS
						.requestMatchers(HttpMethod.GET, "/api/v1/slots/**", "/api/v1/slots").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/slots/**", "/api/v1/slots").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/v1/slots/**", "/api/v1/slots").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/slots/**", "/api/v1/slots").hasAuthority("ADMIN")
						// PRODUCTS
						.requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/products/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/v1/products/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").hasAuthority("ADMIN")
						//MOVIE REVIEW
						.requestMatchers(HttpMethod.GET, "/api/v1/movie-reviews/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/movie-reviews/**").hasAuthority("USER")
						.requestMatchers(HttpMethod.PUT, "/api/v1/movie-reviews/**").hasAuthority("USER")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/movie-reviews/**").hasAuthority("USER")
						//CINEMA REVIEW
						.requestMatchers(HttpMethod.GET, "/api/v1/cinema-reviews/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/cinema-reviews/**").hasAuthority("USER")
						.requestMatchers(HttpMethod.PUT, "/api/v1/cinema-reviews/**").hasAuthority("USER")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/cinema-reviews/**").hasAuthority("USER")
						//SEAT
						.requestMatchers(HttpMethod.GET, "/api/v1/seats/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/seats/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/v1/seats/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/seats/**").hasAuthority("ADMIN")

						.requestMatchers("/api/v1/auth/**").permitAll()
						.requestMatchers("/api/v1/tickets/**").permitAll()
						.requestMatchers("/api/v1/payments/**").permitAll()
						// SEAT LOCKS - GET public (ai cũng xem được ghế đang giữ), POST/DELETE cần login
						.requestMatchers(HttpMethod.GET, "/api/v1/seat-locks/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/seat-locks/**").hasAnyAuthority("USER", "ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/seat-locks/**").hasAnyAuthority("USER", "ADMIN")
						// NEWS - public read, admin write
						.requestMatchers(HttpMethod.GET, "/api/v1/news/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/v1/news/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.PUT, "/api/v1/news/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.DELETE, "/api/v1/news/**").hasAuthority("ADMIN")
						.requestMatchers("/error").permitAll()
						.requestMatchers("/api/v1/**").hasAuthority("ADMIN")
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
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
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
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


