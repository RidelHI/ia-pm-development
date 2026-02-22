package com.ia.integration.apispring.auth.repository;

import com.ia.integration.apispring.auth.domain.AuthUser;
import java.util.Optional;

public interface UsersRepository {
  Optional<AuthUser> findByUsername(String username);

  AuthUser create(AuthUser user);
}
