import 'package:freezed_annotation/freezed_annotation.dart';

part 'profile.freezed.dart';
part 'profile.g.dart';

///
/// The signed-in user as the profile screens show them: who they are, the
/// three counters above the menu, and the plan the upgrade row talks about.
///
@freezed
abstract class Profile with _$Profile {
  const factory Profile({
    required String name,
    required String email,
    required String phoneNumber,
    required int totalPoints,
    required int streaks,
    required int rank,
    required String referralCode,
    required String planName,
    required DateTime planExpiresOn,
    String? avatarUrl,
  }) = _Profile;

  factory Profile.fromJson(Map<String, dynamic> json) => _$ProfileFromJson(json);
}
