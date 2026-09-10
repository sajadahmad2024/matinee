import 'dart:developer' as developer;

import 'package:flutter_bloc/flutter_bloc.dart';

///
/// Emits after [close] are dropped instead of throwing, which is what
/// `Bloc.on`'s emitter already does. Subscriptions, timers and cancel tokens
/// the cubit owns must still be cancelled in [close]; this class does not do
/// it.
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
