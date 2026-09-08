import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/app/router/app_router.dart';
import 'package:matinee/app/router/stream_listenable.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/splash_screen.dart';
import 'package:matinee/features/home/presentation/home_screen.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';

class _Gate {}

void main() {
  group('createRouter', () {
    testWidgets('shows $SplashScreen until startup succeeds, then $HomeScreen', (tester) async {
      final gate = Completer<void>();
      final startup = AppStartupCubit(GetIt.asNewInstance(), (locator) {
        locator.registerSingletonAsync<_Gate>(() async {
          await gate.future;
          return _Gate();
        });
      });
      final changes = StreamListenable(startup.stream);
      final router = createRouter(startup, refreshListenable: changes);
      addTearDown(() async {
        router.dispose();
        changes.dispose();
        await startup.close();
      });

      await tester.pumpWidget(
        BlocProvider.value(
          value: startup,
          child: MaterialApp.router(
            routerConfig: router,
            localizationsDelegates: AppLocalizations.localizationsDelegates,
            supportedLocales: AppLocalizations.supportedLocales,
          ),
        ),
      );
      unawaited(startup.start());
      await tester.pump();

      expect(find.byType(SplashScreen), findsOneWidget);

      gate.complete();
      await tester.pump();
      await tester.pump();

      expect(find.byType(HomeScreen), findsOneWidget);
    });
  });
}
