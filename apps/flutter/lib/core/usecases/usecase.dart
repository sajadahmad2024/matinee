library;

/// Base class for all domain use cases.
///
/// A use case represents a single, focused piece of business logic.
/// Concrete implementations specify the return [Type] and the [Params]
/// they require. Use [NoParams] when no input is needed.
abstract class UseCase<Type, Params> {
  Future<Type> call(Params params);
}

/// Marker type for use cases that require no parameters.
///
/// Pass [NoParams] as the [Params] type argument when a use case
/// does not need any input data.
class NoParams {}
