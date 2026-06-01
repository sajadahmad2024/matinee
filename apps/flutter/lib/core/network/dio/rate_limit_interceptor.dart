import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

/// Rate limit interceptor for Dio HTTP client.
///
/// Limits how many requests are sent within a time window to avoid
/// hitting server rate limits (429). Uses a sliding window: requests
/// older than [window] are discarded; if the count reaches [maxRequests],
/// outgoing requests are delayed until a slot is free.
class RateLimitInterceptor extends Interceptor {
  /// Maximum number of requests allowed in [window].
  final int maxRequests;

  /// Time window for the limit (e.g. 60 requests per 1 minute).
  final Duration window;

  final List<DateTime> _requestTimestamps = [];

  RateLimitInterceptor({
    this.maxRequests = 60,
    this.window = const Duration(minutes: 1),
  }) : assert(maxRequests > 0, 'maxRequests must be positive'),
       assert(window.inMilliseconds > 0, 'window must be positive');

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    _throttle()
        .then((_) {
          _recordRequest();
          handler.next(options);
        })
        .catchError((Object e, StackTrace s) {
          handler.reject(
            DioException(requestOptions: options, error: e, stackTrace: s),
            true,
          );
        });
  }

  /// Remove timestamps outside the current window.
  void _dropExpired() {
    final cutoff = DateTime.now().subtract(window);
    _requestTimestamps.removeWhere((t) => t.isBefore(cutoff));
  }

  /// Record that a request is being sent now.
  void _recordRequest() {
    _requestTimestamps.add(DateTime.now());
  }

  /// Wait until we are under the limit, then complete.
  Future<void> _throttle() async {
    _dropExpired();

    if (_requestTimestamps.length < maxRequests) {
      return;
    }

    final oldest = _requestTimestamps.first;
    final allowedAgain = oldest.add(window);
    final waitDuration = allowedAgain.difference(DateTime.now());

    if (waitDuration.isNegative || waitDuration.inMilliseconds == 0) {
      _dropExpired();
      return;
    }

    if (kDebugMode) {
      debugPrint(
        '[RATE_LIMIT] Throttling: waiting ${waitDuration.inMilliseconds}ms '
        '(${_requestTimestamps.length}/$maxRequests in window)',
      );
    }

    await Future<void>.delayed(waitDuration);
    _dropExpired();
  }
}
