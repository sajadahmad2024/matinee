import 'dart:async';
import 'dart:developer' as developer;

import 'package:sentry_flutter/sentry_flutter.dart';

///
/// The single sink for errors the app catches on purpose (startup failure,
/// post-init tasks, bloc observer). Uncaught errors never come here; Sentry's
/// own integrations capture those when a DSN is configured.
///
void report(Object error, StackTrace? stack) {
  if (Sentry.isEnabled) {
    unawaited(Sentry.captureException(error, stackTrace: stack));
    return;
  }
  developer.log('Reported error', error: error, stackTrace: stack);
}
