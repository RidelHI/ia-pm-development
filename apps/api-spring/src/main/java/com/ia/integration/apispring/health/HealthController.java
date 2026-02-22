package com.ia.integration.apispring.health;

import java.time.Instant;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

  @GetMapping({"/health", "/health/live"})
  public Map<String, Object> getLiveness() {
    return Map.of(
        "status", "UP",
        "service", "api-spring",
        "timestamp", Instant.now().toString());
  }
}
