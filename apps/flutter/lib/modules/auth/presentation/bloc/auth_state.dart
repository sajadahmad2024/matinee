library;

import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/user.dart';

part 'auth_state.freezed.dart';

/// Authentication state
///
/// Represents the current authentication status of the application.
/// Uses Freezed union types for type-safe state management.
@freezed
class AuthState with _$AuthState {
  /// Initial state - before checking authentication
  const factory AuthState.initial() = AuthInitial;

  /// Loading state - processing authentication request
  const factory AuthState.loading() = AuthLoading;

  /// Authenticated state - user is logged in
  const factory AuthState.authenticated({required User user}) =
      AuthAuthenticated;

  /// Unauthenticated state - user is not logged in
  const factory AuthState.unauthenticated() = AuthUnauthenticated;

  /// Error state - authentication failed
  const factory AuthState.error({required String message}) = AuthError;
}
