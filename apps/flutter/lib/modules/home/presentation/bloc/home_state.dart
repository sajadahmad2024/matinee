library;

/// State for the home feature.
///
/// Holds the current counter value displayed on the home screen.
class HomeState {
  /// Current value of the counter.
  final int counter;

  /// Create a new immutable home state.
  const HomeState({required this.counter});

  /// Convenience method for creating a modified copy of this state.
  HomeState copyWith({int? counter}) {
    return HomeState(
      counter: counter ?? this.counter,
    );
  }
}

