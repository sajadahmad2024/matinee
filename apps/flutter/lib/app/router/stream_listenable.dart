import 'dart:async';

import 'package:flutter/foundation.dart';

///
/// Adapts a Stream to the Listenable go_router expects for refreshListenable.
/// go_router dropped its own stream adapter years ago, so this is the app's.
///
final class StreamListenable extends ChangeNotifier {
  StreamListenable(Stream<Object?> stream) {
    _subscription = stream.listen((_) => notifyListeners());
  }

  late final StreamSubscription<Object?> _subscription;

  @override
  void dispose() {
    unawaited(_subscription.cancel());
    super.dispose();
  }
}
