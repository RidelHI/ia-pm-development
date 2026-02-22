package com.ia.integration.apispring.auth;

import com.ia.integration.apispring.auth.dto.AccessTokenResponse;
import com.ia.integration.apispring.auth.dto.LoginRequest;
import com.ia.integration.apispring.auth.dto.RegisterUserRequest;
import com.ia.integration.apispring.auth.dto.RegisteredUserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public RegisteredUserResponse register(@Valid @RequestBody RegisterUserRequest input) {
    return RegisteredUserResponse.fromDomain(authService.registerUser(input.getUsername(), input.getPassword()));
  }

  @PostMapping("/token")
  public AccessTokenResponse createToken(@Valid @RequestBody LoginRequest input) {
    return authService.issueAccessToken(input.getUsername(), input.getPassword());
  }
}
