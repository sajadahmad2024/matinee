library;

import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/errors/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../../domain/usecases/get_current_user.dart';
import '../../domain/usecases/login.dart';
import '../../domain/usecases/logout.dart';
import '../../domain/usecases/register.dart';
import 'auth_event.dart';
import 'auth_state.dart';

/// BLoC for managing authentication state
///
/// Handles all authentication-related events and emits appropriate states.
/// Uses use cases to execute business logic (never calls repositories directly).
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final GetCurrentUser _getCurrentUser;
  final Login _login;
  final Register _register;
  final Logout _logout;

  AuthBloc({
    required GetCurrentUser getCurrentUser,
    required Login login,
    required Register register,
    required Logout logout,
  }) : _getCurrentUser = getCurrentUser,
       _login = login,
       _register = register,
       _logout = logout,
       super(const AuthState.initial()) {
    on<AuthInitialized>(_onAuthInitialized);
    on<AuthLoginRequested>(_onAuthLoginRequested);
    on<AuthRegisterRequested>(_onAuthRegisterRequested);
    on<AuthLogoutRequested>(_onAuthLogoutRequested);
    on<AuthTokenRefreshRequested>(_onAuthTokenRefreshRequested);
  }

  /// Handle app initialization - check if user is authenticated
  Future<void> _onAuthInitialized(
    AuthInitialized event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthState.loading());

    try {
      final user = await _getCurrentUser(NoParams());

      if (user != null) {
        emit(AuthState.authenticated(user: user));
      } else {
        emit(const AuthState.unauthenticated());
      }
    } on Failure catch (_) {
      emit(const AuthState.unauthenticated());
    } catch (_) {
      emit(const AuthState.unauthenticated());
    }
  }

  /// Handle login request
  Future<void> _onAuthLoginRequested(
    AuthLoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthState.loading());

    try {
      final user = await _login(
        LoginParams(email: event.email, password: event.password),
      );

      emit(AuthState.authenticated(user: user));
    } on Failure catch (failure) {
      emit(AuthState.error(message: failure.message));
    } catch (_) {
      emit(const AuthState.error(message: 'Unexpected error occurred'));
    }
  }

  /// Handle registration request
  Future<void> _onAuthRegisterRequested(
    AuthRegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthState.loading());

    try {
      final user = await _register(
        RegisterParams(
          email: event.email,
          password: event.password,
          name: event.name,
        ),
      );

      emit(AuthState.authenticated(user: user));
    } on Failure catch (failure) {
      emit(AuthState.error(message: failure.message));
    } catch (_) {
      emit(const AuthState.error(message: 'Unexpected error occurred'));
    }
  }

  /// Handle logout request
  Future<void> _onAuthLogoutRequested(
    AuthLogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthState.loading());

    try {
      await _logout(NoParams());
      emit(const AuthState.unauthenticated());
    } on Failure catch (failure) {
      emit(AuthState.error(message: failure.message));
    } catch (_) {
      emit(const AuthState.error(message: 'Unexpected error occurred'));
    }
  }

  /// Handle token refresh - re-fetch current user to get updated token/session
  Future<void> _onAuthTokenRefreshRequested(
    AuthTokenRefreshRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthState.loading());

    try {
      final user = await _getCurrentUser(NoParams());

      if (user != null) {
        emit(AuthState.authenticated(user: user));
      } else {
        emit(const AuthState.unauthenticated());
      }
    } on Failure catch (_) {
      emit(const AuthState.unauthenticated());
    } catch (_) {
      emit(const AuthState.unauthenticated());
    }
  }
}
