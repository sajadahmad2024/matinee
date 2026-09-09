import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockProfileRepository extends Mock implements ProfileRepository {}

void main() {
  group(ProfileCubit, () {
    late ProfileRepository repository;

    final profile = Profile(
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

    setUp(() => repository = _MockProfileRepository());

    group('load', () {
      blocTest<ProfileCubit, ProfileState>(
        'emits [loading, success] with the fetched profile',
        setUp: () => when(repository.fetchProfile).thenAnswer((_) async => profile),
        build: () => ProfileCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => [const ProfileState.loading(), ProfileState.success(profile)],
      );

      blocTest<ProfileCubit, ProfileState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetchProfile).thenThrow(const NetworkException()),
        build: () => ProfileCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => [
          const ProfileState.loading(),
          const ProfileState.failure(NetworkException()),
        ],
      );
    });

    group('save', () {
      Future<void> act(ProfileCubit cubit) => cubit.save(
        name: 'Sarah Smith',
        email: 'sarah.smith@example.com',
        phoneNumber: '+91 98765 43210',
      );

      blocTest<ProfileCubit, ProfileState>(
        'emits [loading, success] with the profile the save answered with',
        setUp: () => when(
          () => repository.updateProfile(
            name: any(named: 'name'),
            email: any(named: 'email'),
            phoneNumber: any(named: 'phoneNumber'),
          ),
        ).thenAnswer((_) async => profile),
        build: () => ProfileCubit(repository),
        act: act,
        expect: () => [const ProfileState.loading(), ProfileState.success(profile)],
      );

      blocTest<ProfileCubit, ProfileState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(
          () => repository.updateProfile(
            name: any(named: 'name'),
            email: any(named: 'email'),
            phoneNumber: any(named: 'phoneNumber'),
          ),
        ).thenThrow(const ServerException(500)),
        build: () => ProfileCubit(repository),
        act: act,
        expect: () => [
          const ProfileState.loading(),
          const ProfileState.failure(ServerException(500)),
        ],
      );
    });
  });
}
