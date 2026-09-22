import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/auth/data/models/auth_outcome.dart';

part 'auth_state.freezed.dart';

@freezed
sealed class AuthState with _$AuthState {
  const factory AuthState.initial() = AuthInitial;
  const factory AuthState.loading() = AuthLoading;
  const factory AuthState.success(AuthOutcome outcome) = AuthSuccess;
  const factory AuthState.failure(AppException error) = AuthFailure;
}
