package com.ia.integration.apispring.auth.domain;

public record AuthUser(
    String id,
    String username,
    String passwordHash,
    String role,
    String createdAt,
    String updatedAt) {
}
