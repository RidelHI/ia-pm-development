package com.ia.integration.apispring.auth.repository;

public final class DuplicateUsernameException extends RuntimeException {
  public DuplicateUsernameException() {
    super("Username already exists");
  }
}
