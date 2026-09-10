import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/app/router/app_router.dart';
import 'package:matinee/app/router/stream_listenable.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/splash_screen.dart';
import 'package:matinee/core/theme/app_theme.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/onboarding/data/onboarding_repository.dart';
import 'package:matinee/features/onboarding/presentation/onboarding_screen.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';
import 'package:mocktail/mocktail.dart';

class _Gate {}

class _MockOnboardingRepository extends Mock implements OnboardingRepository {}

void main() {
  group('createRouter', () {
    testWidgets('shows $SplashScreen until startup succeeds, then $OnboardingScreen', (tester) async {
      // The landing route resolves its repository from the composition root,
      // mocked because the real one needs a SharedPreferences binding.
      getIt.registerLazySingleton<OnboardingRepository>(_MockOnboardingRepository.new);
      addTearDown(getIt.reset);

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
            theme: AppTheme.dark,
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

      expect(find.byType(OnboardingScreen), findsOneWidget);
    });
  });
}
