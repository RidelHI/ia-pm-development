package com.ia.integration.apispring.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class SecurityAuthenticationEntryPoint implements AuthenticationEntryPoint {

  @Override
  public void commence(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException authException)
      throws IOException, ServletException {
    final var sourceMessage = authException.getMessage();
    final var message =
        sourceMessage != null && sourceMessage.contains("Token contains invalid roles")
            ? "Token contains invalid roles"
            : "Invalid or expired token";

    SecurityErrorWriter.write(request, response, 401, "Unauthorized", message);
  }
}
