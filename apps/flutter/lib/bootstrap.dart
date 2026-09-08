import 'package:flutter/widgets.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/app.dart';
import 'package:matinee/app/bootstrap_error_app.dart';
import 'package:matinee/core/config/env.dart';
import 'package:matinee/core/error/report.dart';
import 'package:matinee/core/observer/app_bloc_observer.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

///
/// Pre-init. Runs before any widget exists, so it stays minimal: binding,
/// bloc observer, synchronous DI registration, then hand off to the UI.
/// Anything that awaits real work belongs in main-init behind the splash.
///
Future<void> bootstrap(Env env) async {
  WidgetsFlutterBinding.ensureInitialized();
  Bloc.observer = const AppBlocObserver();

  try {
    registerDependencies(env);
  } on Object catch (e, s) {
    // No UI exists yet, so the fallback app is the only way to show anything.
    report(e, s);
    runApp(const BootstrapErrorApp());
    return;
  }

  final dsn = env.sentryDsn;
  if (dsn == null) {
    runApp(const App());
    return;
  }

  // Sentry installs FlutterError.onError and PlatformDispatcher.onError itself,
  // so the app sets neither by hand. On web it falls back to a zone instead;
  // web is secondary and the DSN is production-only, so that is accepted.
  await SentryFlutter.init(
    (options) {
      options
        ..dsn = dsn
        ..environment = env.flavor.name;
    },
    appRunner: () => runApp(const App()),
  );
}
