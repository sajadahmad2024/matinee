import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_boilerplate/core/di/injection_container.dart';
import 'package:flutter_boilerplate/core/errors/exceptions.dart';
import 'package:flutter_boilerplate/core/network/security_interceptor.dart';
import 'package:flutter_boilerplate/core/security/request_signer.dart';
import '../http_client.dart';
import 'package:dio_cache_interceptor/dio_cache_interceptor.dart';
import 'package:dio_cache_interceptor_hive_store/dio_cache_interceptor_hive_store.dart';
import 'package:path_provider/path_provider.dart';
import '../../security/certificate_pinning_client.dart';
import '../../utils/constants/log_constants.dart';
import 'rate_limit_interceptor.dart';

/// Dio implementation of HttpClient with security features
class DioHttpClient implements HttpClient {
  late final Dio _dio;
  String? _authToken;
  CacheStore? _cacheStore;

  DioHttpClient({
    required String baseUrl,
    bool enableCertificatePinning = true,
    bool enableCaching = true,
  }) {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        sendTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Setup certificate pinning in production
    if (enableCertificatePinning && !kDebugMode) {
      _dio.setupCertificatePinning();
    }

    // Setup caching
    if (enableCaching) {
      _setupCaching();
    }

    // Add interceptors
    _setupInterceptors();
  }

  Future<void> _setupCaching() async {
    try {
      final dir = await getTemporaryDirectory();
      _cacheStore = HiveCacheStore(dir.path);

      final cacheOptions = CacheOptions(
        store: _cacheStore,
        policy: CachePolicy.request,
        priority: CachePriority.high,
        maxStale: const Duration(days: 7),
        hitCacheOnErrorExcept: [401, 403],
        keyBuilder: (request) {
          return request.uri.toString();
        },
      );

      _dio.interceptors.add(DioCacheInterceptor(options: cacheOptions));
    } catch (e) {
      if (kDebugMode) {
        debugPrint('[CACHE] Failed to setup caching: $e');
      }
    }
  }

  void _setupInterceptors() {
    _dio.interceptors.add(RateLimitInterceptor());

    if (kDebugMode) {
      _dio.interceptors.add(LoggingInterceptor());
    }

    _dio.interceptors.add(AuthInterceptor(this));
    _dio.interceptors.add(SecurityInterceptor(signer: getIt<RequestSigner>()));

    _dio.interceptors.add(ErrorInterceptor());
  }

  @override
  Future<HttpResponse> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _dio.get(
        path,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      );

      return HttpResponse(
        data: response.data,
        statusCode: response.statusCode ?? 200,
        headers: response.headers.map,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<HttpResponse> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      );

      return HttpResponse(
        data: response.data,
        statusCode: response.statusCode ?? 200,
        headers: response.headers.map,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<HttpResponse> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      );

      return HttpResponse(
        data: response.data,
        statusCode: response.statusCode ?? 200,
        headers: response.headers.map,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<HttpResponse> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      );

      return HttpResponse(
        data: response.data,
        statusCode: response.statusCode ?? 200,
        headers: response.headers.map,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  Future<HttpResponse> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: Options(headers: headers),
      );

      return HttpResponse(
        data: response.data,
        statusCode: response.statusCode ?? 200,
        headers: response.headers.map,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  @override
  void setAuthToken(String token) {
    _authToken = token;
    _dio.options.headers['Authorization'] = 'Bearer $token';
  }

  @override
  void clearAuthToken() {
    _authToken = null;
    _dio.options.headers.remove('Authorization');
  }

  @override
  String? get authToken => _authToken;

  Exception _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return RequestTimeoutException('Request timeout');

      case DioExceptionType.badResponse:
        final data = error.response?.data;
        final String message = data is Map && data.containsKey('message')
            ? data['message'].toString()
            : 'Server error';
        return ServerException(message);
      case DioExceptionType.unknown:
        if (error.error is SocketException) {
          return NetworkException('No internet connection');
        }
        return ServerException('Unknown error: ${error.message}');

      default:
        return ServerException(error.message ?? 'Unknown error');
    }
  }
}

/// Logging interceptor for debug
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode && LogConstants.enableDebugLogs) {
      debugPrint(
        '[${LogConstants.tagNetwork}] ➡️  ${options.method} ${options.path}',
      );
      debugPrint(
        '[${LogConstants.tagNetwork}] Headers: ${_sanitizeHeaders(options.headers)}',
      );
      debugPrint(
        '[${LogConstants.tagNetwork}] Params: ${options.queryParameters}',
      );
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode && LogConstants.enableDebugLogs) {
      debugPrint(
        '[${LogConstants.tagNetwork}] ✅ ${response.statusCode} ${response.requestOptions.path}',
      );
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode && LogConstants.enableDebugLogs) {
      debugPrint(
        '[${LogConstants.tagNetwork}] ❌ ${err.response?.statusCode} ${err.requestOptions.path}',
      );
      debugPrint('[${LogConstants.tagNetwork}] Error: ${err.message}');
    }
    handler.next(err);
  }

  // Sanitize sensitive headers
  Map<String, dynamic> _sanitizeHeaders(Map<String, dynamic> headers) {
    final sanitized = Map<String, dynamic>.from(headers);
    sanitized.remove('Authorization');
    sanitized.remove('X-API-Key');
    return sanitized;
  }
}

/// Auth interceptor to add token to requests
class AuthInterceptor extends Interceptor {
  final DioHttpClient httpClient;

  AuthInterceptor(this.httpClient);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (httpClient.authToken != null) {
      options.headers['Authorization'] = 'Bearer ${httpClient.authToken}';
    }
    handler.next(options);
  }
}

/// Error interceptor for handling common errors
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode && LogConstants.enableDebugLogs) {
      debugPrint(
        '[${LogConstants.tagNetwork}] Error: ${err.response?.statusCode}',
      );
    }
    handler.next(err);
  }
}
