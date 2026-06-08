package com.example.service.Account;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class JWTTokenService implements IJWTTokenService {

    @Value("${jwt.secret}")
    private String SECRET;

    @Value("${jwt.access.expiration}")
    private long ACCESS_EXPIRATION; // 900000ms = 15 phút

    @Value("${jwt.refresh.expiration}")
    private long REFRESH_EXPIRATION; // 604800000ms = 7 ngày

    @Value("${jwt.header}")
    private String HEADER; // Authorization

    @Value("${jwt.prefix}")
    private String PREFIX; // Bearer

    @Autowired
    private IAccountService accountService; // implements UserDetailsService

    // ── Tạo access token (15 phút) ──────────────────────────
    @Override
    public String generateAccessToken(String username) {
        return buildToken(username, ACCESS_EXPIRATION);
    }

    // ── Tạo refresh token (7 ngày) ──────────────────────────
    @Override
    public String generateRefreshToken(String username) {
        return buildToken(username, REFRESH_EXPIRATION);
    }

    private String buildToken(String username, long expirationMs) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
    }

    @Override
    public String generateResetPasswordToken(String email, String passwordHash) {
        return Jwts.builder()
                .setSubject(email)
                .claim("purpose", "password_reset")
                .claim("user_password_hash", passwordHash)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_EXPIRATION))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
    }

    // ── Lấy username từ token ────────────────────────────────
    @Override
    public String getUsernameFromToken(String token) {
        try {
            return getClaims(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    // ── Kiểm tra token hợp lệ (chưa hết hạn, đúng chữ ký) ──
    @Override
    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            return !claims.getExpiration().before(new Date());
        } catch (ExpiredJwtException e) {
            return false; // Hết hạn
        } catch (Exception e) {
            return false; // Sai chữ ký hoặc token dị dạng
        }
    }

    // ── Parse access token từ request HTTP ──────────────────
    @Override
    public Authentication parseAccessToken(HttpServletRequest request) {
        String header = request.getHeader(HEADER);
        if (header == null || !header.startsWith(PREFIX)) {
            return null;
        }

        String token = header.substring(PREFIX.length()).trim();

        if (!isTokenValid(token)) {
            return null;
        }

        try {
            String username = getUsernameFromToken(token);
            if (username == null) return null;

            // Dùng loadUserByUsername — đọc thẳng từ entity, không qua ModelMapper
            // Đảm bảo authority được tạo đúng từ Role enum (không bị null)
            UserDetails userDetails = accountService.loadUserByUsername(username);

            return new UsernamePasswordAuthenticationToken(
                    userDetails.getUsername(),
                    null,
                    userDetails.getAuthorities());
        } catch (Exception e) {
            return null;
        }
    }

    // ── Helper: parse claims ─────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token)
                .getBody();
    }

    @Override
    public Claims getClaimsFromToken(String token) {
        try {
            return getClaims(token);
        } catch (Exception e) {
            return null;
        }
    }
}
