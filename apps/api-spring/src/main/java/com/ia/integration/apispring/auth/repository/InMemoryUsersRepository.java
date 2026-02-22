package com.ia.integration.apispring.auth.repository;

import com.ia.integration.apispring.auth.domain.AuthUser;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryUsersRepository implements UsersRepository {
  private final Map<String, AuthUser> usersById = new ConcurrentHashMap<>();
  private final Map<String, String> userIdByUsername = new ConcurrentHashMap<>();

  @Override
  public Optional<AuthUser> findByUsername(String username) {
    final var normalizedUsername = normalizeUsername(username);
    final var userId = userIdByUsername.get(normalizedUsername);
    if (userId == null) {
      return Optional.empty();
    }

    return Optional.ofNullable(usersById.get(userId));
  }

  @Override
  public AuthUser create(AuthUser user) {
    final var normalizedUsername = normalizeUsername(user.username());
    if (userIdByUsername.containsKey(normalizedUsername)) {
      throw new DuplicateUsernameException();
    }

    final var normalizedUser = new AuthUser(
        user.id(),
        normalizedUsername,
        user.passwordHash(),
        user.role(),
        user.createdAt(),
        user.updatedAt());
    usersById.put(normalizedUser.id(), normalizedUser);
    userIdByUsername.put(normalizedUsername, normalizedUser.id());
    return normalizedUser;
  }

  private String normalizeUsername(String username) {
    return username == null ? "" : username.trim().toLowerCase();
  }
}
