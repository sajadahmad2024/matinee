/// Abstract HTTP client interface
///
/// This interface allows switching between different HTTP implementations
/// (Dio or http package) without changing the rest of the codebase.
///
/// Both Dio and HTTP package implementations must follow this contract.
abstract class HttpClient {
  /// GET request
  ///
  /// [path] - API endpoint path (will be appended to base URL)
  /// [queryParameters] - Query parameters to append to the URL
  /// [headers] - Additional headers for this request
  Future<HttpResponse> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  });

  /// POST request
  ///
  /// [path] - API endpoint path
  /// [data] - Request body data (will be JSON encoded)
  /// [queryParameters] - Query parameters
  /// [headers] - Additional headers
  Future<HttpResponse> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  });

  /// PUT request
  ///
  /// [path] - API endpoint path
  /// [data] - Request body data
  /// [queryParameters] - Query parameters
  /// [headers] - Additional headers
  Future<HttpResponse> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  });

  /// PATCH request
  ///
  /// [path] - API endpoint path
  /// [data] - Request body data
  /// [queryParameters] - Query parameters
  /// [headers] - Additional headers
  Future<HttpResponse> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  });

  /// DELETE request
  ///
  /// [path] - API endpoint path
  /// [data] - Optional request body data
  /// [queryParameters] - Query parameters
  /// [headers] - Additional headers
  Future<HttpResponse> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  });

  /// Set authorization token
  ///
  /// This will add "Authorization: Bearer {token}" header to all requests
  void setAuthToken(String token);

  /// Clear authorization token
  ///
  /// This will remove the Authorization header from all requests
  void clearAuthToken();

  /// Get current auth token
  String? get authToken;
}

/// Unified HTTP Response
///
/// This class wraps responses from different HTTP clients
/// into a single, consistent format regardless of the underlying implementation.
class HttpResponse {
  /// Response data (usually Map or List)
  final dynamic data;

  /// HTTP status code (200, 404, 500, etc.)
  final int statusCode;

  /// Response headers
  final Map<String, dynamic>? headers;

  /// Status message (OK, Not Found, etc.)
  final String? message;

  HttpResponse({
    required this.data,
    required this.statusCode,
    this.headers,
    this.message,
  });

  /// Check if the response is successful (2xx status code)
  bool get isSuccess => statusCode >= 200 && statusCode < 300;

  /// Check if the response is a client error (4xx status code)
  bool get isClientError => statusCode >= 400 && statusCode < 500;

  /// Check if the response is a server error (5xx status code)
  bool get isServerError => statusCode >= 500 && statusCode < 600;

  /// Check if the response is unauthorized (401)
  bool get isUnauthorized => statusCode == 401;

  /// Check if the response is forbidden (403)
  bool get isForbidden => statusCode == 403;

  /// Check if the response is not found (404)
  bool get isNotFound => statusCode == 404;

  @override
  String toString() {
    return 'HttpResponse{statusCode: $statusCode, isSuccess: $isSuccess, message: $message}';
  }
}
