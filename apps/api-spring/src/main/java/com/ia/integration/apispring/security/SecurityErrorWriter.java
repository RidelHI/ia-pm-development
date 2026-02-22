package com.ia.integration.apispring.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;

final class SecurityErrorWriter {

  private SecurityErrorWriter() {
  }

  static void write(
      HttpServletRequest request,
      HttpServletResponse response,
      int status,
      String error,
      String message)
      throws IOException {
    response.setStatus(status);
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    final var body = String.format(
        "{\"timestamp\":\"%s\",\"status\":%d,\"error\":\"%s\",\"message\":\"%s\",\"path\":\"%s\"}",
        Instant.now(),
        status,
        escape(error),
        escape(message),
        escape(request.getRequestURI()));
    response.getWriter().write(body);
  }

  private static String escape(String input) {
    if (input == null) {
      return "";
    }

    return input.replace("\\", "\\\\").replace("\"", "\\\"");
  }
}
