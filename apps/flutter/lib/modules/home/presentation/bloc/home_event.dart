library;

/// Events for the home feature.
///
/// These events represent user interactions or lifecycle triggers
/// that can cause the home screen state to change.
abstract class HomeEvent {
  const HomeEvent();
}

/// Event dispatched when the counter should be incremented.
class HomeCounterIncrementRequested extends HomeEvent {
  const HomeCounterIncrementRequested();
}

