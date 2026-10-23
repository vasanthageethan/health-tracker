package com.vasanth.healthtracker.auth;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final Duration TOKEN_TTL = Duration.ofDays(30);

    private final SecretKey key;

    public JwtService(@Value("${app.auth-secret:}") String configuredSecret) {
        String secret = configuredSecret;
        if (secret == null || secret.isBlank()) {
            secret = UUID.randomUUID() + UUID.randomUUID().toString();
            log.warn("AUTH_SECRET not set -- using a random key for this run. Every session will be "
                    + "logged out on restart. Set AUTH_SECRET to keep sessions across restarts.");
        }
        this.key = Keys.hmacShaKeyFor(sha256(secret));
    }

    public String issueToken() {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject("health-tracker-user")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(TOKEN_TTL)))
                .signWith(key)
                .compact();
    }

    public boolean isValid(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private static byte[] sha256(String value) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
