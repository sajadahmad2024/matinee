import 'dart:async';
import 'dart:developer' as developer;

import 'package:sentry_flutter/sentry_flutter.dart';

///
/// The single sink for errors the app catches on purpose. Uncaught errors go
/// to Sentry's own integrations instead, never here.
///
void report(Object error, StackTrace? stack) {
  if (Sentry.isEnabled) {
    unawaited(Sentry.captureException(error, stackTrace: stack));
    return;
  }
  developer.log('Reported error', error: error, stackTrace: stack);
}
