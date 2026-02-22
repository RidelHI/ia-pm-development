package com.ia.integration.apispring;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.stream.Collectors;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class ApiSpringApplicationTests {
  private static final String JWT_SECRET = "development-only-secret-change-in-production";
  private static final String JWT_ISSUER = "warehouse-api";
  private static final String JWT_AUDIENCE = "warehouse-clients";

  @LocalServerPort
  private int port;

  @Test
  void shouldExposeLivenessEndpoint() throws Exception {
    final var response = sendGet("/v1/health/live", null);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"status\":\"UP\"");
    assertThat(response.body()).contains("\"service\":\"api-spring\"");
    assertThat(response.body()).contains("\"timestamp\":");
  }

  @Test
  void shouldExposeVersionEndpoint() throws Exception {
    final var response = sendGet("/v1/version", null);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"service\":\"api-spring\"");
    assertThat(response.body()).contains("\"version\":\"0.1.0\"");
    assertThat(response.body()).contains("\"framework\":\"spring-boot\"");
  }

  @Test
  void shouldRegisterUser() throws Exception {
    final var username = uniqueUsername();
    final var response = registerUser("  " + username.toUpperCase() + "  ", "StrongPassword123!");

    assertThat(response.statusCode()).isEqualTo(201);
    assertThat(response.body()).contains("\"id\":\"usr_");
    assertThat(response.body()).contains("\"username\":\"" + username + "\"");
    assertThat(response.body()).contains("\"role\":\"user\"");
    assertThat(response.body()).contains("\"createdAt\":");
    assertThat(response.body()).contains("\"updatedAt\":");
  }

  @Test
  void shouldReturnConflictWhenRegisteringDuplicateUsername() throws Exception {
    final var username = uniqueUsername();
    registerUser(username, "StrongPassword123!");
    final var duplicated = registerUser(username.toUpperCase(), "StrongPassword123!");

    assertThat(duplicated.statusCode()).isEqualTo(409);
    assertThat(duplicated.body()).contains("\"message\":\"Username already exists\"");
  }

  @Test
  void shouldIssueAccessTokenForValidCredentials() throws Exception {
    final var username = uniqueUsername();
    final var password = "StrongPassword123!";
    registerUser(username, password);

    final var response = requestToken(username, password);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"tokenType\":\"Bearer\"");
    assertThat(response.body()).contains("\"expiresInSeconds\":900");
    assertThat(response.body()).contains("\"accessToken\":\"");
  }

  @Test
  void shouldReturnUnauthorizedWhenCredentialsAreInvalid() throws Exception {
    final var username = uniqueUsername();
    registerUser(username, "StrongPassword123!");

    final var response = requestToken(username, "WrongPassword123!");

    assertThat(response.statusCode()).isEqualTo(401);
    assertThat(response.body()).contains("\"message\":\"Invalid credentials\"");
  }

  @Test
  void shouldAllowProductsAccessWithIssuedToken() throws Exception {
    final var username = uniqueUsername();
    final var password = "StrongPassword123!";
    registerUser(username, password);
    final var tokenResponse = requestToken(username, password);
    final var token = extractField(tokenResponse.body(), "accessToken");

    final var response = sendGet("/v1/products", token);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"meta\":");
  }

  @Test
  void shouldReturnUnauthorizedWhenNoTokenIsProvided() throws Exception {
    final var response = sendGet("/v1/products", null);

    assertThat(response.statusCode()).isEqualTo(401);
    assertThat(response.body()).contains("\"message\":\"Invalid or expired token\"");
  }

  @Test
  void shouldReturnForbiddenWhenTokenHasNoRoles() throws Exception {
    final var token = createJwt(new String[] {});
    final var response = sendGet("/v1/products", token);

    assertThat(response.statusCode()).isEqualTo(403);
    assertThat(response.body()).contains("\"message\":\"Insufficient permissions\"");
  }

  @Test
  void shouldReturnUnauthorizedWhenTokenHasInvalidRoles() throws Exception {
    final var token = createJwt(new String[] {"guest"});
    final var response = sendGet("/v1/products", token);

    assertThat(response.statusCode()).isEqualTo(401);
    assertThat(response.body()).contains("\"message\":\"Token contains invalid roles\"");
  }

  @Test
  void shouldListProductsWithDefaultPagination() throws Exception {
    final var token = createJwt(new String[] {"user"});
    final var response = sendGet("/v1/products", token);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"id\":\"prod-001\"");
    assertThat(response.body()).contains("\"id\":\"prod-002\"");
    assertThat(response.body()).contains("\"meta\":{\"page\":1,\"limit\":20,\"total\":2,\"totalPages\":1}");
  }

  @Test
  void shouldFilterProductsByQuery() throws Exception {
    final var token = createJwt(new String[] {"user"});
    final var response = sendGet("/v1/products?q=milk", token);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"id\":\"prod-002\"");
    assertThat(response.body()).doesNotContain("\"id\":\"prod-001\"");
    assertThat(response.body()).contains("\"meta\":{\"page\":1,\"limit\":20,\"total\":1,\"totalPages\":1}");
  }

  @Test
  void shouldGetProductById() throws Exception {
    final var token = createJwt(new String[] {"user"});
    final var response = sendGet("/v1/products/prod-001", token);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"id\":\"prod-001\"");
    assertThat(response.body()).contains("\"sku\":\"SKU-APPLE-001\"");
    assertThat(response.body()).contains("\"status\":\"active\"");
  }

  @Test
  void shouldReturnNotFoundWhenProductDoesNotExist() throws Exception {
    final var token = createJwt(new String[] {"user"});
    final var response = sendGet("/v1/products/prod-999", token);

    assertThat(response.statusCode()).isEqualTo(404);
    assertThat(response.body()).contains("Product prod-999 not found");
  }

  @Test
  void shouldCreateProduct() throws Exception {
    final var token = createJwt(new String[] {"user"});
    final var payload = """
        {
          "sku": "SKU-COFFEE-003",
          "name": "Coffee Pack",
          "quantity": 20,
          "unitPriceCents": 899
        }
        """;

    final var response = sendJson("POST", "/v1/products", payload, token);

    assertThat(response.statusCode()).isEqualTo(201);
    assertThat(response.body()).contains("\"sku\":\"SKU-COFFEE-003\"");
    assertThat(response.body()).contains("\"name\":\"Coffee Pack\"");
    assertThat(response.body()).contains("\"status\":\"active\"");
  }

  @Test
  void shouldUpdateProduct() throws Exception {
    final var token = createJwt(new String[] {"user"});
    final var createPayload = """
        {
          "sku": "SKU-WATER-004",
          "name": "Water Bottle",
          "quantity": 10,
          "unitPriceCents": 199
        }
        """;
    final var created = sendJson("POST", "/v1/products", createPayload, token);
    final var productId = extractField(created.body(), "id");

    final var updatePayload = """
        {
          "quantity": 99,
          "notes": "Updated stock"
        }
        """;
    final var response = sendJson("PATCH", "/v1/products/" + productId, updatePayload, token);

    assertThat(response.statusCode()).isEqualTo(200);
    assertThat(response.body()).contains("\"quantity\":99");
    assertThat(response.body()).contains("\"notes\":\"Updated stock\"");
  }

  @Test
  void shouldReturnBadRequestForEmptyUpdatePayload() throws Exception {
    final var token = createJwt(new String[] {"user"});
    final var response = sendJson("PATCH", "/v1/products/prod-001", "{}", token);

    assertThat(response.statusCode()).isEqualTo(400);
    assertThat(response.body()).contains("At least one field is required");
  }

  @Test
  void shouldDeleteProduct() throws Exception {
    final var token = createJwt(new String[] {"user"});
    final var createPayload = """
        {
          "sku": "SKU-JUICE-005",
          "name": "Juice Box",
          "quantity": 5,
          "unitPriceCents": 350
        }
        """;
    final var created = sendJson("POST", "/v1/products", createPayload, token);
    final var productId = extractField(created.body(), "id");

    final var deleted = sendJson("DELETE", "/v1/products/" + productId, null, token);
    assertThat(deleted.statusCode()).isEqualTo(204);

    final var notFound = sendGet("/v1/products/" + productId, token);
    assertThat(notFound.statusCode()).isEqualTo(404);
  }

  private HttpResponse<String> sendGet(String path, String bearerToken) throws Exception {
    return send("GET", path, null, bearerToken);
  }

  private HttpResponse<String> registerUser(String username, String password) throws Exception {
    final var payload = String.format(
        "{\"username\":\"%s\",\"password\":\"%s\"}",
        username,
        password);
    return sendJson("POST", "/v1/auth/register", payload, null);
  }

  private HttpResponse<String> requestToken(String username, String password) throws Exception {
    final var payload = String.format(
        "{\"username\":\"%s\",\"password\":\"%s\"}",
        username,
        password);
    return sendJson("POST", "/v1/auth/token", payload, null);
  }

  private HttpResponse<String> sendJson(String method, String path, String body, String bearerToken)
      throws Exception {
    return send(method, path, body, bearerToken);
  }

  private HttpResponse<String> send(String method, String path, String body, String bearerToken)
      throws Exception {
    final var client = HttpClient.newHttpClient();
    final var builder = HttpRequest.newBuilder(new URI("http://localhost:" + port + path))
        .header("Content-Type", "application/json");

    if (bearerToken != null) {
      builder.header("Authorization", "Bearer " + bearerToken);
    }

    final var publisher = body == null
        ? HttpRequest.BodyPublishers.noBody()
        : HttpRequest.BodyPublishers.ofString(body);
    final var request = builder.method(method, publisher).build();

    return client.send(request, BodyHandlers.ofString());
  }

  private String extractField(String json, String field) {
    final var marker = "\"" + field + "\":\"";
    final var start = json.indexOf(marker);
    if (start < 0) {
      return "";
    }
    final var from = start + marker.length();
    final var end = json.indexOf("\"", from);
    if (end < 0) {
      return "";
    }
    return json.substring(from, end);
  }

  private String createJwt(String[] roles) throws Exception {
    final var now = Instant.now().getEpochSecond();
    final var exp = now + 3600;

    final var headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
    final var rolesJson = Arrays.stream(roles)
        .map((role) -> "\"" + role + "\"")
        .collect(Collectors.joining(","));
    final var payloadJson = String.format(
        "{\"sub\":\"usr_test\",\"username\":\"integration-tester\",\"roles\":[%s],\"iss\":\"%s\",\"aud\":\"%s\",\"iat\":%d,\"exp\":%d}",
        rolesJson,
        JWT_ISSUER,
        JWT_AUDIENCE,
        now,
        exp);

    final var unsignedToken = base64UrlEncode(headerJson) + "." + base64UrlEncode(payloadJson);

    final var mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(JWT_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    final var signatureBytes = mac.doFinal(unsignedToken.getBytes(StandardCharsets.UTF_8));

    return unsignedToken + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);
  }

  private String base64UrlEncode(String value) {
    return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
  }

  private String uniqueUsername() {
    return "warehouse.user" + System.nanoTime();
  }
}
