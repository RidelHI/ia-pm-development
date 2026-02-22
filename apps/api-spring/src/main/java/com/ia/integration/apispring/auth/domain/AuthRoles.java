package com.ia.integration.apispring.auth.domain;

import java.util.Set;

public final class AuthRoles {
  public static final String ADMIN = "admin";
  public static final String USER = "user";
  public static final Set<String> ALL = Set.of(ADMIN, USER);

  private AuthRoles() {
  }
}
