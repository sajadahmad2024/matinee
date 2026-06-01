import 'package:crypto/crypto.dart';
import 'dart:convert';

import 'package:dio/dio.dart';

/// Signs HTTP requests with HMAC-SHA256 to prevent tampering
class RequestSigner {
  final String apiSecret;

  RequestSigner({required this.apiSecret});

  /// Generate request signature
  String generateSignature({
    required String method,
    required String path,
    required int timestamp,
    String? body,
    String? nonce,
  }) {
    // Format: METHOD|PATH|TIMESTAMP|NONCE|BODY
    final toSign = [
      method.toUpperCase(),
      path,
      timestamp.toString(),
      nonce ?? '',
      body ?? '',
    ].join('|');

    // Sign with HMAC-SHA256
    return _hmacSha256(toSign, apiSecret);
  }

  /// Verify request signature (for server validation)
  bool verifySignature({
    required String signature,
    required String method,
    required String path,
    required int timestamp,
    String? body,
    String? nonce,
    int maxAgeSeconds = 300, // 5 minutes
  }) {
    // Check timestamp to prevent replay attacks
    final now = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    if ((now - timestamp).abs() > maxAgeSeconds) {
      return false;
    }

    // Regenerate signature and compare
    final expectedSignature = generateSignature(
      method: method,
      path: path,
      timestamp: timestamp,
      body: body,
      nonce: nonce,
    );

    return _constantTimeEquals(signature, expectedSignature);
  }

  /// HMAC-SHA256 hash
  static String _hmacSha256(String message, String secret) {
    return Hmac(sha256, utf8.encode(secret))
        .convert(utf8.encode(message))
        .toString();
  }

  /// Constant-time string comparison (prevent timing attacks)
  static bool _constantTimeEquals(String a, String b) {
    if (a.length != b.length) return false;

    int result = 0;
    for (int i = 0; i < a.length; i++) {
      result |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    }

    return result == 0;
  }
}

/// Dio interceptor for request signing
class SigningInterceptor extends Interceptor {
  final RequestSigner signer;

  SigningInterceptor({required this.signer});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final timestamp = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    final nonce = _generateNonce();
    final body =
        options.data is String ? options.data : jsonEncode(options.data ?? {});

    final signature = signer.generateSignature(
      method: options.method,
      path: options.path,
      timestamp: timestamp,
      body: body,
      nonce: nonce,
    );

    // Add signature headers
    options.headers['X-Signature'] = signature;
    options.headers['X-Timestamp'] = timestamp.toString();
    options.headers['X-Nonce'] = nonce;

    handler.next(options);
  }

  static String _generateNonce() {
    return DateTime.now().millisecondsSinceEpoch.toString();
  }
}
