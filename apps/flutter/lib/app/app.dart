import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/router/app_router.dart';
import 'package:matinee/app/router/stream_listenable.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';
import 'package:matinee/app/startup/post_init.dart';
import 'package:matinee/core/theme/app_theme.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final startup = AppStartupCubit(getIt, registerStartupDependencies);
        unawaited(startup.start());
        return startup;
      },
      child: const _AppView(),
    );
  }
}

class _AppView extends StatefulWidget {
  const _AppView();

  @override
  State<_AppView> createState() => _AppViewState();
}

class _AppViewState extends State<_AppView> {
  late final StreamListenable _startupChanges;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    // The router is created once; rebuilding it on theme changes would reset navigation.
    final startup = context.read<AppStartupCubit>();
    _startupChanges = StreamListenable(startup.stream);
    _router = createRouter(startup, refreshListenable: _startupChanges);
  }

  @override
  void dispose() {
    _router.dispose();
    _startupChanges.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocListener<AppStartupCubit, AppStartupState>(
      listenWhen: (_, current) => current is StartupSuccess,
      listener: (_, _) => runPostInit(),
      // The design is dark-only: one ThemeData, no mode to switch.
      child: MaterialApp.router(
        routerConfig: _router,
        theme: AppTheme.dark,
        localizationsDelegates: AppLocalizations.localizationsDelegates,
        supportedLocales: AppLocalizations.supportedLocales,
      ),
    );
  }
}
