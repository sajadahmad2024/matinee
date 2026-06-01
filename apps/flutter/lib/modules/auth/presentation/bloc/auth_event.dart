library;

import 'package:freezed_annotation/freezed_annotation.dart';

part 'auth_event.freezed.dart';

/// Authentication events
///
/// Represents all possible user actions and system events
/// that can trigger authentication state changes.
@freezed
class AuthEvent with _$AuthEvent {
  /// App initialized - Check if user is already authenticated
  const factory AuthEvent.initialized() = AuthInitialized;

  /// User requested login with email and password
  const factory AuthEvent.loginRequested({
    required String email,
    required String password,
  }) = AuthLoginRequested;

  /// User requested registration with email, password, and name
  const factory AuthEvent.registerRequested({
    required String email,
    required String password,
    required String name,
  }) = AuthRegisterRequested;

  /// User requested logout
  const factory AuthEvent.logoutRequested() = AuthLogoutRequested;

  /// Token refresh requested
  const factory AuthEvent.tokenRefreshRequested() = AuthTokenRefreshRequested;
}
