package com.example.service.Account;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.stereotype.Service;

import com.example.dto.AccountDTO;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class JWTTokenService implements IJWTTokenService{
	
	@Value("${jwt.token.time.expiration}")
    private long EXPIRATION_TIME;
	
	@Value("${jwt.token.secret}")
	private String SECRET;
	
	@Value("${jwt.token.header.authorization}")
	private String TOKEN_AUTHORIZATION;
	
	@Value("${jwt.token.prefix}")
	private String TOKEN_PREFIX;
	
	@Autowired
	private IAccountService accountService;

    @Override
    public String generateJWTToken(String userName) {
        return Jwts.builder()
                .setSubject(userName)
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
    }
    
    public Authentication parseTokenToUserInformation(HttpServletRequest request) {
        String token = request.getHeader(TOKEN_AUTHORIZATION);
        
        if (token == null) {
        	return null;
        }
        
        try {
        String userName = Jwts.parser()
                .setSigningKey(SECRET)
                .parseClaimsJws(token.replace(TOKEN_PREFIX, ""))
                .getBody()
                .getSubject();
        
        AccountDTO account = accountService.getAccountByUserName(userName);

        return userName != null ?
                new UsernamePasswordAuthenticationToken(
                		account.getUserName(), 
                		null, 
                		AuthorityUtils.createAuthorityList(account.getRole().toString())) :
                null;
        } catch (Exception e) {
			return null;
		}
    }
}

