import 'dart:developer' as developer;

import 'package:flutter_bloc/flutter_bloc.dart';

///
/// Emits after [close] are dropped instead of throwing, as `Bloc.on` already
/// does. Subscriptions and timers are not covered; [close] still cancels them.
///
abstract class SafeCubit<S> extends Cubit<S> {
  SafeCubit(super.initialState);

  @override
  void emit(S state) {
    if (isClosed) {
      assert(() {
        developer.log('dropped emit after close: $runtimeType');
        return true;
      }(), 'The breadcrumb above always holds; the assert only runs it in debug.');
      return;
    }
    super.emit(state);
  }
}
