import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit(this._repository) : super(const ProfileState.initial());

  final ProfileRepository _repository;

  Future<void> load() => _run(_repository.fetchProfile);

  ///
  /// Saving answers with the stored profile, so the screen the user returns to
  /// shows the edit without fetching again.
  ///
  Future<void> save({
    required String name,
    required String email,
    required String phoneNumber,
  }) {
    return _run(
      () => _repository.updateProfile(name: name, email: email, phoneNumber: phoneNumber),
    );
  }

  Future<void> _run(Future<Profile> Function() call) async {
    emit(const ProfileState.loading());
    try {
      emit(ProfileState.success(await call()));
    } on AppException catch (e) {
      emit(ProfileState.failure(e));
    }
  }
}
