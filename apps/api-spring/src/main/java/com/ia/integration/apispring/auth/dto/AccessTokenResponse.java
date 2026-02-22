package com.ia.integration.apispring.auth.dto;

public class AccessTokenResponse {
  private final String accessToken;
  private final String tokenType;
  private final int expiresInSeconds;

  public AccessTokenResponse(String accessToken, String tokenType, int expiresInSeconds) {
    this.accessToken = accessToken;
    this.tokenType = tokenType;
    this.expiresInSeconds = expiresInSeconds;
  }

  public String getAccessToken() {
    return accessToken;
  }

  public String getTokenType() {
    return tokenType;
  }

  public int getExpiresInSeconds() {
    return expiresInSeconds;
  }
}
