///
/// Stands in for the auth API until there is one, keeping the shape the real
/// service will have. Replace each body with a Dio call; nothing above moves.
///
class AuthApiService {
  const AuthApiService();

  /// How long a mocked call takes, so the CTA's progress state is visible.
  static const Duration mockLatency = Duration(milliseconds: 600);

  Future<void> requestOtp({required String phoneNumber}) => _mockCall();

  Future<void> verifyOtp({required String phoneNumber, required String code}) => _mockCall();

  Future<void> createAccount({required String name, required String? referralCode}) => _mockCall();

  Future<void> subscribe() => _mockCall();

  Future<void> _mockCall() => Future<void>.delayed(mockLatency);
}
