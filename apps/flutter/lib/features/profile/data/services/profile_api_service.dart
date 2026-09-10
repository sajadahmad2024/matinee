import 'dart:async';

import 'package:matinee/features/profile/data/models/profile.dart';

///
/// Stands in for the profile endpoints until the API exists. It answers after
/// a short delay so the screens exercise their loading states, and holds the
/// edits in memory so a save is visible on the way back to the profile.
///
class ProfileApiService {
  ProfileApiService();

  static const Duration mockLatency = Duration(milliseconds: 600);

  final StreamController<Profile> _changes = StreamController<Profile>.broadcast();

  ///
  /// The stored profile, every time it changes. Edit and profile are separate
  /// screens with a cubit each, so the one behind has to hear about a save
  /// rather than hold what it fetched before it.
  ///
  Stream<Profile> get changes => _changes.stream;

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
    _profile = _profile.copyWith(name: name, email: email, phoneNumber: phoneNumber);
    _changes.add(_profile);
    return _profile;
  }
}
