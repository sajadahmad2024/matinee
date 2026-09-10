import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/data/services/profile_api_service.dart';

class ProfileRepository {
  const ProfileRepository(this._service);

  final ProfileApiService _service;

  ///
  /// The profile, every time it changes. Editing is its own screen with its
  /// own cubit, so the profile behind it observes this instead of keeping the
  /// copy it fetched on the way in.
  ///
  Stream<Profile> get profileChanges => _service.changes;

  Future<Profile> fetchProfile() => guardApi(_service.fetchProfile);

  Future<Profile> updateProfile({
    required String name,
    required String email,
    required String phoneNumber,
  }) {
    return guardApi(
      () => _service.updateProfile(name: name, email: email, phoneNumber: phoneNumber),
    );
  }
}
