import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../security/request_signer.dart';

/// Comprehensive security interceptor
class SecurityInterceptor extends Interceptor {
  final RequestSigner signer;

  SecurityInterceptor({required this.signer});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Add request signature
    final timestamp = DateTime.now().millisecondsSinceEpoch ~/ 1000;
    final nonce = DateTime.now().millisecondsSinceEpoch.toString();

    final signature = signer.generateSignature(
      method: options.method,
      path: options.path,
      timestamp: timestamp,
      nonce: nonce,
    );

    options.headers
      ..['X-Signature'] = signature
      ..['X-Timestamp'] = timestamp
      ..['X-Nonce'] = nonce;

    // Log request (without sensitive data)
    _logRequest(options);

    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('❌ Error: ${err.response?.statusCode}');
    }
    handler.next(err);
  }

  void _logRequest(RequestOptions options) {
    if (kDebugMode) {
      debugPrint('📤 ${options.method} ${options.path}');
      final safeHeaders = Map<String, dynamic>.from(options.headers);
      safeHeaders.remove('Authorization');
      debugPrint('Headers: $safeHeaders');
    }
  }
}
