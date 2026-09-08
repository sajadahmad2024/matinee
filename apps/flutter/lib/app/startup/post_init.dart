import 'dart:async';

import 'package:template/core/error/report.dart';

///
/// Post-init. Fired once by App when startup succeeds. Nothing here may block
/// the UI, and every task is guarded so a failure degrades silently.
///
/// Add one line per task:
///
/// ```dart
/// unawaited(guardPostInit(() => getIt<FeedRepository>().prefetch()));
/// ```
///
void runPostInit() {}

Future<void> guardPostInit(Future<void> Function() task) async {
  try {
    await task();
  } on Object catch (e, s) {
    report(e, s);
  }
}
