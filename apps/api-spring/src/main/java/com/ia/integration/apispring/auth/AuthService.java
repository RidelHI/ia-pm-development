package com.ia.integration.apispring.auth;

import com.ia.integration.apispring.auth.domain.AuthRoles;
import com.ia.integration.apispring.auth.domain.AuthUser;
import com.ia.integration.apispring.auth.dto.AccessTokenResponse;
import com.ia.integration.apispring.auth.repository.DuplicateUsernameException;
import com.ia.integration.apispring.auth.repository.UsersRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
  private final JwtEncoder jwtEncoder;
  private final PasswordEncoder passwordEncoder;
  private final UsersRepository usersRepository;
  private final String issuer;
  private final String audience;
  private final int expiresInSeconds;

  public AuthService(
      JwtEncoder jwtEncoder,
      PasswordEncoder passwordEncoder,
      UsersRepository usersRepository,
      @Value("${auth.jwt.issuer:${AUTH_JWT_ISSUER:warehouse-api}}") String issuer,
      @Value("${auth.jwt.audience:${AUTH_JWT_AUDIENCE:warehouse-clients}}") String audience,
      @Value("${auth.jwt.expires-in-seconds:${AUTH_JWT_EXPIRES_IN_SECONDS:900}}") int expiresInSeconds) {
    this.jwtEncoder = jwtEncoder;
    this.passwordEncoder = passwordEncoder;
    this.usersRepository = usersRepository;
    this.issuer = issuer;
    this.audience = audience;
    this.expiresInSeconds = expiresInSeconds;
  }

  public AuthUser registerUser(String username, String password) {
    final var normalizedUsername = normalizeUsername(username);
    final var now = Instant.now().toString();
    final var user = new AuthUser(
        "usr_" + UUID.randomUUID().toString().replace("-", ""),
        normalizedUsername,
        passwordEncoder.encode(password),
        AuthRoles.USER,
        now,
        now);

    try {
      return usersRepository.create(user);
    } catch (DuplicateUsernameException exception) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already exists");
    }
  }

  public AccessTokenResponse issueAccessToken(String username, String password) {
    final var normalizedUsername = normalizeUsername(username);
    final var user = usersRepository.findByUsername(normalizedUsername)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (!passwordEncoder.matches(password, user.passwordHash())) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    final var issuedAt = Instant.now();
    final var expiresAt = issuedAt.plusSeconds(expiresInSeconds);
    final var headers = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
    final var claims = JwtClaimsSet.builder()
        .subject(user.id())
        .claim("username", user.username())
        .claim("roles", List.of(user.role()))
        .issuer(issuer)
        .audience(List.of(audience))
        .issuedAt(issuedAt)
        .expiresAt(expiresAt)
        .build();

    final var accessToken = jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue();
    return new AccessTokenResponse(accessToken, "Bearer", expiresInSeconds);
  }

  private String normalizeUsername(String username) {
    return username == null ? "" : username.trim().toLowerCase();
  }
}
