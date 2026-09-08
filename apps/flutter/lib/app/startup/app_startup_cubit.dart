import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'package:template/app/startup/app_startup_state.dart';
import 'package:template/core/error/report.dart';

///
/// Main-init orchestrator. It sequences and maps to state; the actual work
/// lives in the services registered by registerStartupDependencies. Provided
/// by BlocProvider at the root, never registered in get_it.
///
class AppStartupCubit extends Cubit<AppStartupState> {
  AppStartupCubit(this._locator, this._registerStartup) : super(const StartupInProgress());

  static const _scope = 'startup';

  final GetIt _locator;
  final void Function(GetIt locator) _registerStartup;

  Future<void> start() async {
    try {
      // get_it caches allReady() and never re-runs a failed factory, so every
      // attempt registers the main-init services in a fresh scope.
      if (_locator.hasScope(_scope)) {
        await _locator.popScopesTill(_scope);
      }
      _locator.pushNewScope(scopeName: _scope, init: _registerStartup);
      await _locator.allReady(timeout: const Duration(seconds: 15));
      emit(const StartupSuccess());
    } on Object catch (e, s) {
      // Startup is the one place every failure maps to a screen the user can retry from.
      report(e, s);
      emit(StartupFailure(e));
    }
  }

  Future<void> retry() async {
    emit(const StartupInProgress());
    await start();
  }
}
