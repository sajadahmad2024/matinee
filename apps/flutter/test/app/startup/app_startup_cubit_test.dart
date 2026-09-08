import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';

class _Gate {}

void _nothing(GetIt locator) {}

void _broken(GetIt locator) {
  locator.registerSingletonAsync<_Gate>(() async => throw StateError('boom'));
}

void main() {
  group(AppStartupCubit, () {
    late GetIt locator;

    setUp(() {
      locator = GetIt.asNewInstance();
    });

    blocTest<AppStartupCubit, AppStartupState>(
      'emits [success] when every startup registration completes',
      build: () => AppStartupCubit(locator, _nothing),
      act: (cubit) => cubit.start(),
      expect: () => const [StartupSuccess()],
    );

    blocTest<AppStartupCubit, AppStartupState>(
      'emits [failure] when a startup registration throws',
      build: () => AppStartupCubit(locator, _broken),
      act: (cubit) => cubit.start(),
      expect: () => [isA<StartupFailure>()],
    );

    blocTest<AppStartupCubit, AppStartupState>(
      'retry recovers when the registration succeeds on the second attempt',
      build: () {
        var attempts = 0;
        return AppStartupCubit(locator, (getIt) {
          attempts++;
          if (attempts == 1) {
            _broken(getIt);
          } else {
            getIt.registerSingletonAsync<_Gate>(() async => _Gate());
          }
        });
      },
      act: (cubit) async {
        await cubit.start();
        await cubit.retry();
      },
      expect: () => [isA<StartupFailure>(), const StartupInProgress(), const StartupSuccess()],
    );
  });
}
