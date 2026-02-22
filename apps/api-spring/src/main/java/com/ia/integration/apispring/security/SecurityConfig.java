package com.ia.integration.apispring.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.proc.SecurityContext;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  private static final Set<String> ALLOWED_ROLES = Set.of("admin", "user");

  @Bean
  SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      SecurityAuthenticationEntryPoint authenticationEntryPoint,
      SecurityAccessDeniedHandler accessDeniedHandler,
      Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter)
      throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable)
        .authorizeHttpRequests((auth) -> auth
            .requestMatchers("/health", "/health/live", "/version").permitAll()
            .requestMatchers("/auth/register", "/auth/token").permitAll()
            .requestMatchers("/products/**").hasAnyAuthority("ROLE_admin", "ROLE_user")
            .anyRequest().authenticated())
        .oauth2ResourceServer((oauth2) -> oauth2
            .jwt((jwt) -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
            .authenticationEntryPoint(authenticationEntryPoint)
            .accessDeniedHandler(accessDeniedHandler))
        .exceptionHandling((exceptions) -> exceptions
            .authenticationEntryPoint(authenticationEntryPoint)
            .accessDeniedHandler(accessDeniedHandler))
        .httpBasic(Customizer.withDefaults());

    return http.build();
  }

  @Bean
  JwtDecoder jwtDecoder(
      @Value("${auth.jwt.secret:${AUTH_JWT_SECRET:development-only-secret-change-in-production}}") String secret,
      @Value("${auth.jwt.issuer:${AUTH_JWT_ISSUER:warehouse-api}}") String issuer,
      @Value("${auth.jwt.audience:${AUTH_JWT_AUDIENCE:warehouse-clients}}") String audience) {
    final var secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    final var decoder = NimbusJwtDecoder.withSecretKey(secretKey).build();

    final OAuth2TokenValidator<Jwt> issuerValidator = JwtValidators.createDefaultWithIssuer(issuer);
    final OAuth2TokenValidator<Jwt> audienceValidator = (jwt) -> jwt.getAudience().contains(audience)
        ? OAuth2TokenValidatorResult.success()
        : OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_token", "Token has invalid audience", null));

    final OAuth2TokenValidator<Jwt> rolesValidator = (jwt) -> {
      final List<String> roles = jwt.getClaimAsStringList("roles");
      if (roles == null || roles.stream().anyMatch((role) -> !ALLOWED_ROLES.contains(role))) {
        return OAuth2TokenValidatorResult.failure(
            new OAuth2Error("invalid_token", "Token contains invalid roles", null));
      }
      return OAuth2TokenValidatorResult.success();
    };

    decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(issuerValidator, audienceValidator, rolesValidator));
    return decoder;
  }

  @Bean
  JwtEncoder jwtEncoder(
      @Value("${auth.jwt.secret:${AUTH_JWT_SECRET:development-only-secret-change-in-production}}") String secret) {
    final var secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    final var secretSource = new ImmutableSecret<SecurityContext>(secretKey);
    return new NimbusJwtEncoder(secretSource);
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
    return (jwt) -> {
      final var roles = jwt.getClaimAsStringList("roles");
      final var authorities = roles == null
          ? List.<SimpleGrantedAuthority>of()
          : roles.stream().map((role) -> new SimpleGrantedAuthority("ROLE_" + role)).toList();

      return new JwtAuthenticationToken(jwt, authorities, jwt.getSubject());
    };
  }
}
