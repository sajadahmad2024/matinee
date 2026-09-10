import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/data/models/auth_outcome.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';

///
/// One cubit for the whole flow. Each screen builds its own instance and calls
/// the one method it owns, so a success it hears can only be its own.
///
class AuthCubit extends SafeCubit<AuthState> {
  AuthCubit(this._repository) : super(const AuthState.initial());

  final AuthRepository _repository;

  Future<void> requestOtp(String phoneNumber) =>
      _submit(() => _repository.requestOtp(phoneNumber), AuthOutcome.otpSent);

  Future<void> verifyOtp({required String phoneNumber, required String code}) =>
      _submit(() => _repository.verifyOtp(phoneNumber: phoneNumber, code: code), AuthOutcome.otpVerified);

  Future<void> createAccount({required String name, required String? referralCode}) =>
      _submit(() => _repository.createAccount(name: name, referralCode: referralCode), AuthOutcome.accountCreated);

  Future<void> subscribe() => _submit(_repository.subscribe, AuthOutcome.subscribed);

  ///
  /// The one shape every method here has: emit loading, run the call, emit the
  /// outcome. Only domain errors land in the catch.
  ///
  Future<void> _submit(Future<void> Function() call, AuthOutcome outcome) async {
    emit(const AuthState.loading());
    try {
      await call();
      emit(AuthState.success(outcome));
    } on AppException catch (e) {
      emit(AuthState.failure(e));
    }
  }
}
