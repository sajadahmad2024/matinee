///
/// Stands in for the auth API until there is one. It keeps the shape the real
/// service will have — futures that speak in domain arguments and can fail —
/// and answers from memory after a short delay so the demo flow feels like a
/// network call. Replace the body of each method with a Dio call and nothing
/// above this file changes.
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
