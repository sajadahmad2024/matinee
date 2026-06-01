import 'package:dio/dio.dart';
import 'package:flutter_boilerplate/core/errors/exceptions.dart';
import 'package:flutter_boilerplate/modules/auth/domain/repositories/auth_repository.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenService {
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _tokenExpiryKey = 'token_expiry';
  static const _deviceIdKey = 'device_id';

  final FlutterSecureStorage _secureStorage;

  TokenService(this._secureStorage);

  /// Save tokens securely
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
    required DateTime expiresAt,
  }) async {
    try {
      await Future.wait([
        _secureStorage.write(key: _accessTokenKey, value: accessToken),
        _secureStorage.write(key: _refreshTokenKey, value: refreshToken),
        _secureStorage.write(
          key: _tokenExpiryKey,
          value: expiresAt.toIso8601String(),
        ),
      ]);
    } catch (e) {
      throw CacheException('Failed to save tokens: $e');
    }
  }

  /// Get current access token
  Future<String?> getAccessToken() async {
    try {
      return await _secureStorage.read(key: _accessTokenKey);
    } catch (e) {
      throw CacheException('Failed to read access token: $e');
    }
  }

  /// Get refresh token
  Future<String?> getRefreshToken() async {
    try {
      return await _secureStorage.read(key: _refreshTokenKey);
    } catch (e) {
      throw CacheException('Failed to read refresh token: $e');
    }
  }

  /// Check if token is expired
  Future<bool> isTokenExpired() async {
    try {
      final expiryStr = await _secureStorage.read(key: _tokenExpiryKey);
      if (expiryStr == null) return true;

      final expiry = DateTime.parse(expiryStr);
      // Add 5 minute buffer before actual expiry
      return DateTime.now().isAfter(expiry.subtract(Duration(minutes: 5)));
    } catch (e) {
      return true;
    }
  }

  /// Get time remaining before token expiry
  Future<Duration?> getTokenTimeRemaining() async {
    try {
      final expiryStr = await _secureStorage.read(key: _tokenExpiryKey);
      if (expiryStr == null) return null;

      final expiry = DateTime.parse(expiryStr);
      final remaining = expiry.difference(DateTime.now());

      return remaining.isNegative ? Duration.zero : remaining;
    } catch (e) {
      return null;
    }
  }

  /// Clear all tokens (on logout)
  Future<void> clearTokens() async {
    try {
      await Future.wait([
        _secureStorage.delete(key: _accessTokenKey),
        _secureStorage.delete(key: _refreshTokenKey),
        _secureStorage.delete(key: _tokenExpiryKey),
      ]);
    } catch (e) {
      throw CacheException('Failed to clear tokens: $e');
    }
  }

  /// Check if valid token exists
  Future<bool> hasValidToken() async {
    try {
      final token = await getAccessToken();
      final isExpired = await isTokenExpired();
      return token != null && !isExpired;
    } catch (e) {
      return false;
    }
  }

  /// Save device ID for device-specific security
  Future<void> saveDeviceId(String deviceId) async {
    try {
      await _secureStorage.write(key: _deviceIdKey, value: deviceId);
    } catch (e) {
      throw CacheException('Failed to save device ID: $e');
    }
  }

  /// Get stored device ID
  Future<String?> getDeviceId() async {
    try {
      return await _secureStorage.read(key: _deviceIdKey);
    } catch (e) {
      return null;
    }
  }
}

// Token refresh interceptor
class TokenRefreshInterceptor extends Interceptor {
  final TokenService tokenService;
  final AuthRepository authRepository;
  final Dio dio;

  TokenRefreshInterceptor({
    required this.tokenService,
    required this.authRepository,
    required this.dio,
  });

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Check if token is expired and refresh if needed
    final isExpired = await tokenService.isTokenExpired();

    if (isExpired) {
      try {
        final newToken = await _refreshToken();
        if (newToken != null) {
          options.headers['Authorization'] = 'Bearer $newToken';
        }
      } catch (e) {
        // Redirect to login if refresh fails
        return handler.reject(
          DioException(
            requestOptions: options,
            error: 'Token refresh failed',
          ),
        );
      }
    }

    handler.next(options);
  }

  Future<String?> _refreshToken() async {
    try {
      final refreshToken = await tokenService.getRefreshToken();
      if (refreshToken == null) return null;

      // Call refresh endpoint
      final response = await dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200) {
        final newAccessToken = response.data['accessToken'];
        final newRefreshToken = response.data['refreshToken'] ?? refreshToken;
        final expiresIn = response.data['expiresIn'] ?? 3600; // 1 hour default

        // Save new tokens
        await tokenService.saveTokens(
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt: DateTime.now().add(Duration(seconds: expiresIn)),
        );

        return newAccessToken;
      }
    } catch (e) {
      print('Token refresh failed: $e');
    }
    return null;
  }
}
