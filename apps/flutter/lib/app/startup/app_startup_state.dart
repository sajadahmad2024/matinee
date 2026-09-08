///
/// Hand-written rather than freezed: two variants carry no fields, so const
/// canonicalisation already gives value equality, and boot does not depend on
/// build_runner output.
///
sealed class AppStartupState {
  const AppStartupState();
}

final class StartupInProgress extends AppStartupState {
  const StartupInProgress();
}

final class StartupSuccess extends AppStartupState {
  const StartupSuccess();
}

final class StartupFailure extends AppStartupState {
  const StartupFailure(this.error);

  final Object error;
}
