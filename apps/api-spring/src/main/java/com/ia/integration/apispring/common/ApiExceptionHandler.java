package com.ia.integration.apispring.common;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<Map<String, Object>> handleResponseStatusException(
      ResponseStatusException exception,
      HttpServletRequest request) {
    final var statusCode = exception.getStatusCode().value();
    final var httpStatus = HttpStatus.resolve(statusCode);
    final var message = exception.getReason() == null ? "Unexpected error" : exception.getReason();

    final Map<String, Object> body = new LinkedHashMap<>();
    body.put("timestamp", Instant.now().toString());
    body.put("status", statusCode);
    body.put("error", httpStatus == null ? "Error" : httpStatus.getReasonPhrase());
    body.put("message", message);
    body.put("path", request.getRequestURI());

    return ResponseEntity.status(statusCode).body(body);
  }
}
