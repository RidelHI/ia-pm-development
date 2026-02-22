package com.ia.integration.apispring.version;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringBootVersion;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VersionController {
  private final String appVersion;

  public VersionController(@Value("${app.version:0.1.0}") String appVersion) {
    this.appVersion = appVersion;
  }

  @GetMapping("/version")
  public Map<String, String> getVersion() {
    return Map.of(
        "service", "api-spring",
        "version", appVersion,
        "framework", "spring-boot",
        "frameworkVersion", SpringBootVersion.getVersion());
  }
}
