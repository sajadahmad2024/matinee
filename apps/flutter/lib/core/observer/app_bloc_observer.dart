import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/report.dart';

final class AppBlocObserver extends BlocObserver {
  const AppBlocObserver();

  @override
  void onError(BlocBase<dynamic> bloc, Object error, StackTrace stackTrace) {
    report(error, stackTrace);
    super.onError(bloc, error, stackTrace);
  }
}
