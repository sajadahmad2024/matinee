// ignore_for_file: always_specify_types

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_boilerplate/app.dart';
import 'package:flutter_boilerplate/config/environment_config.dart';
import 'package:flutter_boilerplate/config/theme/theme_provider.dart';
import 'package:flutter_boilerplate/core/di/injection_container.dart';
import 'package:flutter_boilerplate/modules/auth/presentation/bloc/auth_bloc.dart';
import 'package:provider/provider.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EnvironmentConfig.initialize(environment: Environment.dev);

  // Initialize sentry if enabled in environment config
  // if (EnvironmentConfig.instance.enableCrashReporting) {
  //   await SentryFlutter.init(
  //     (options) {
  //       options.dsn = 'https://xxxxx@xxxxx.ingest.sentry.io/xxxxxx';
  //       options.environment = EnvironmentConfig.instance.isProduction
  //           ? 'production'
  //           : 'development';
  //       options.tracesSampleRate =
  //           EnvironmentConfig.instance.isProduction ? 1.0 : 0.1;
  //       options.attachStacktrace = true;
  //       options.recordHttpBreadcrumbs = true;
  //     },
  //   );
  // }

  if (EnvironmentConfig.instance.useFirebase) {
    await Firebase.initializeApp();
  }
  await initDependencies();

  runApp(
    BlocProvider<AuthBloc>(
      create: (_) => getIt<AuthBloc>(),
      child: ChangeNotifierProvider(
        create: (_) => ThemeProvider(),
        child: const MyApp(),
      ),
    ),
  );
}

Future<void> runSentryApp() async {
  if (EnvironmentConfig.instance.enableCrashReporting) {
    await SentryFlutter.init(
      (options) {
        options.dsn = 'https://xxxxx@xxxxx.ingest.sentry.io/xxxxxx';
      },
      appRunner: () => runApp(
        ChangeNotifierProvider(
          create: (_) => ThemeProvider(),
          child: const MyApp(),
        ),
      ),
    );
  }
}
