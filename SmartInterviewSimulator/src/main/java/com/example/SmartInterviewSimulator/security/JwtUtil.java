package com.example.SmartInterviewSimulator.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

	// ✅ Proper key (no Base64 error)
	private final SecretKey SECRET_KEY =
		    Keys.hmacShaKeyFor("mySuperSecretKey12345678901234567890".getBytes());
	public String generateToken(String email) {
		return Jwts.builder().setSubject(email).setIssuedAt(new Date())
				.setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60)).signWith(SECRET_KEY) // ✅ correct
				.compact();
	}

	public String extractEmail(String token) {
		return Jwts.parserBuilder().setSigningKey(SECRET_KEY).build().parseClaimsJws(token).getBody().getSubject();
	}
}