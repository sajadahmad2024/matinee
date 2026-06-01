library;

import 'package:flutter_bloc/flutter_bloc.dart';

import 'home_event.dart';
import 'home_state.dart';

/// BLoC for the home feature.
///
/// Manages the counter value shown on the home page and reacts
/// to [HomeEvent]s by emitting new [HomeState]s.
class HomeBloc extends Bloc<HomeEvent, HomeState> {
  /// Create a [HomeBloc] with an initial counter value of zero.
  HomeBloc() : super(const HomeState(counter: 0)) {
    on<HomeCounterIncrementRequested>(_onCounterIncrementRequested);
  }

  Future<void> _onCounterIncrementRequested(
    HomeCounterIncrementRequested event,
    Emitter<HomeState> emit,
  ) async {
    emit(state.copyWith(counter: state.counter + 1));
  }
}

