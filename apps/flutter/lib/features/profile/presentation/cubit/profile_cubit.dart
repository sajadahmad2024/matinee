import 'dart:async';

import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';

class ProfileCubit extends SafeCubit<ProfileState> {
  ProfileCubit(this._repository) : super(const ProfileState.initial()) {
    _changes = _repository.profileChanges.listen(_onProfileChanged);
  }

  final ProfileRepository _repository;

  late final StreamSubscription<Profile> _changes;

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

  ///
  /// A save on the edit screen is a save to the same profile this one shows,
  /// so the loaded state is replaced in place rather than left behind.
  ///
  void _onProfileChanged(Profile profile) {
    if (state is ProfileSuccess) {
      emit(ProfileState.success(profile));
    }
  }

  @override
  Future<void> close() async {
    await _changes.cancel();
    await super.close();
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
