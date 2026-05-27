package com.torreal.api.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.torreal.api.config.JwtProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

  private final JwtProperties props;
  private final SecretKey key;

  public JwtService(JwtProperties props) throws Exception {
    this.props = props;
    byte[] digest =
        MessageDigest.getInstance("SHA-256").digest(props.getSecret().getBytes(StandardCharsets.UTF_8));
    this.key = Keys.hmacShaKeyFor(digest);
  }

  public String crearToken(long userId, String rol) {
    Instant now = Instant.now();
    Instant exp = now.plus(props.getExpirationDays(), ChronoUnit.DAYS);
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("rol", rol)
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .signWith(key)
        .compact();
  }

  public Optional<JwtPayload> parsearValidar(String token) {
    try {
      Claims c = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
      long uid = Long.parseLong(c.getSubject());
      String rol = c.get("rol", String.class);
      if (rol == null) {
        return Optional.empty();
      }
      return Optional.of(new JwtPayload(uid, rol));
    } catch (JwtException | IllegalArgumentException e) {
      return Optional.empty();
    }
  }

  public record JwtPayload(long userId, String rol) {}
}
