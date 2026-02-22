package com.ia.integration.apispring.auth.dto;

import com.ia.integration.apispring.auth.domain.AuthUser;

public class RegisteredUserResponse {
  private final String id;
  private final String username;
  private final String role;
  private final String createdAt;
  private final String updatedAt;

  public RegisteredUserResponse(
      String id,
      String username,
      String role,
      String createdAt,
      String updatedAt) {
    this.id = id;
    this.username = username;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static RegisteredUserResponse fromDomain(AuthUser user) {
    return new RegisteredUserResponse(
        user.id(),
        user.username(),
        user.role(),
        user.createdAt(),
        user.updatedAt());
  }

  public String getId() {
    return id;
  }

  public String getUsername() {
    return username;
  }

  public String getRole() {
    return role;
  }

  public String getCreatedAt() {
    return createdAt;
  }

  public String getUpdatedAt() {
    return updatedAt;
  }
}
