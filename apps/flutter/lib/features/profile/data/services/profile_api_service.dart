import 'package:matinee/features/profile/data/models/profile.dart';

///
/// Stands in for the profile endpoints until the API exists. It answers after
/// a short delay so the screens exercise their loading states, and holds the
/// edits in memory so a save is visible on the way back to the profile.
///
class ProfileApiService {
  ProfileApiService();

  static const Duration mockLatency = Duration(milliseconds: 600);

  Profile _profile = Profile(
    name: 'Sarah Smith',
    email: 'sarah.smith@example.com',
    phoneNumber: '+91 98765 43210',
    totalPoints: 2500,
    streaks: 257,
    rank: 260,
    referralCode: 'CH8362',
    planName: 'Pro plan',
    planExpiresOn: DateTime.utc(2026, 6, 30),
  );

  Future<Profile> fetchProfile() async {
    await Future<void>.delayed(mockLatency);
    return _profile;
  }

  Future<Profile> updateProfile({
    required String name,
    required String email,
    required String phoneNumber,
  }) async {
    await Future<void>.delayed(mockLatency);
    return _profile = _profile.copyWith(name: name, email: email, phoneNumber: phoneNumber);
  }
}
