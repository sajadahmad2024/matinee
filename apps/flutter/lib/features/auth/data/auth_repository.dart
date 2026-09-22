import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/auth/data/services/auth_api_service.dart';

///
/// Source of truth for the sign-in and sign-up flow. Every method is one
/// guardApi call, so a DioException never leaves the data layer.
///
class AuthRepository {
  const AuthRepository(this._api);

  final AuthApiService _api;

  Future<void> requestOtp(String phoneNumber) => guardApi(() => _api.requestOtp(phoneNumber: phoneNumber));

  Future<void> verifyOtp({required String phoneNumber, required String code}) =>
      guardApi(() => _api.verifyOtp(phoneNumber: phoneNumber, code: code));

  Future<void> createAccount({required String name, required String? referralCode}) =>
      guardApi(() => _api.createAccount(name: name, referralCode: referralCode));

  Future<void> subscribe() => guardApi(_api.subscribe);
}
