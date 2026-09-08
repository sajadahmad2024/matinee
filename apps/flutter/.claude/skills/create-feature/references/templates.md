# Feature templates

The example feature is `profile`. Replace `profile` / `Profile` with the feature name and `template` with the package name from `pubspec.yaml`. Transitional: once `lib/features/example` exists and compiles, that folder is the template and this file is deleted.

## `data/models/profile_dto.dart` (only without a generated client)

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'profile_dto.freezed.dart';
part 'profile_dto.g.dart';

@freezed
abstract class ProfileDto with _$ProfileDto {
  const factory ProfileDto({
    required String id,
    required String name,
    @JsonKey(name: 'avatar_url') String? avatarUrl,
  }) = _ProfileDto;

  factory ProfileDto.fromJson(Map<String, dynamic> json) => _$ProfileDtoFromJson(json);
}
```

## `data/services/profile_api_service.dart` (only without a generated client)

```dart
import 'package:dio/dio.dart';
import 'package:matinee/features/profile/data/models/profile_dto.dart';

///
/// One service per data source. It speaks HTTP and returns DTOs; it does not
/// catch or translate errors, guardApi in the repository does that.
///
class ProfileApiService {
  const ProfileApiService(this._dio);

  final Dio _dio;

  Future<ProfileDto> getProfile() async {
    final response = await _dio.get<Map<String, dynamic>>('/profile');
    return ProfileDto.fromJson(response.data!);
  }
}
```

With a generated client from add-api, the repository takes the generated `ProfileClient` instead and this file does not exist.

## `data/profile_repository.dart`

```dart
import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/profile/data/models/profile_dto.dart';
import 'package:matinee/features/profile/data/services/profile_api_service.dart';

///
/// Source of truth for profile data. Every method is one guardApi call, so a
/// DioException never leaves the data layer and no method needs its own catch.
///
class ProfileRepository {
  const ProfileRepository(this._api);

  final ProfileApiService _api;

  Future<ProfileDto> fetch() => guardApi(_api.getProfile);
}
```

A separate domain model, when earned, is mapped here: `Future<UserProfile> fetch() async => (await guardApi(_api.getProfile)).toDomain();`.

## `presentation/cubit/profile_state.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/profile/data/models/profile_dto.dart';

part 'profile_state.freezed.dart';

@freezed
sealed class ProfileState with _$ProfileState {
  const factory ProfileState.initial() = ProfileInitial;
  const factory ProfileState.loading() = ProfileLoading;
  const factory ProfileState.success(ProfileDto data) = ProfileSuccess;
  const factory ProfileState.failure(AppException error) = ProfileFailure;
}
```

## `presentation/cubit/profile_cubit.dart`

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';

class ProfileCubit extends Cubit<ProfileState> {
  ProfileCubit(this._repository) : super(const ProfileState.initial());

  final ProfileRepository _repository;

  Future<void> load() async {
    emit(const ProfileState.loading());
    try {
      final profile = await _repository.fetch();
      emit(ProfileState.success(profile));
    } on AppException catch (e) {
      // Only domain failures land here; programming errors propagate to the global net.
      emit(ProfileState.failure(e));
    }
  }
}
```

Bloc variant, only when events are needed:

```dart
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';

part 'profile_event.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  ProfileBloc(this._repository) : super(const ProfileState.initial()) {
    on<ProfileLoadRequested>(_onLoadRequested);
  }

  final ProfileRepository _repository;

  Future<void> _onLoadRequested(ProfileLoadRequested event, Emitter<ProfileState> emit) async {
    emit(const ProfileState.loading());
    try {
      final profile = await _repository.fetch();
      emit(ProfileState.success(profile));
    } on AppException catch (e) {
      emit(ProfileState.failure(e));
    }
  }
}
```

```dart
part of 'profile_bloc.dart';

sealed class ProfileEvent {
  const ProfileEvent();
}

final class ProfileLoadRequested extends ProfileEvent {
  const ProfileLoadRequested();
}
```

## `presentation/profile_screen.dart`

```dart
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = ProfileCubit(getIt<ProfileRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const ProfileView(),
    );
  }
}

@visibleForTesting
class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.l10n.profileTitle)),
      body: ContentContainer(
        maxWidth: 720,
        child: BlocBuilder<ProfileCubit, ProfileState>(
          builder: (context, state) => switch (state) {
            ProfileInitial() => const SizedBox.shrink(),
            ProfileLoading() => const Center(child: CircularProgressIndicator()),
            ProfileSuccess(:final data) => Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Text(data.name, style: Theme.of(context).textTheme.headlineMedium),
              ),
            ProfileFailure(:final error) => ErrorView(
                message: error.localizedMessage(context.l10n),
                onRetry: context.read<ProfileCubit>().load,
              ),
          },
        ),
      ),
    );
  }
}
```

## Route, in `app/router/app_routes.dart`

```dart
@TypedGoRoute<ProfileRoute>(path: '/profile')
class ProfileRoute extends GoRouteData with $ProfileRoute {
  const ProfileRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const ProfileScreen();
}
```

A detail route takes its identifier in the path: `path: '/orders/:id'`, `final String id`, navigated with `OrderRoute(id: order.id).go(context)`.

## `profile_di.dart`

```dart
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/data/services/profile_api_service.dart';

void registerProfileDependencies() {
  getIt
    ..registerLazySingleton<ProfileApiService>(() => ProfileApiService(getIt()))
    ..registerLazySingleton<ProfileRepository>(() => ProfileRepository(getIt()));
}
```

## Append to `di/service_locator.dart`

One import and one line inside `registerDependencies`, after the core registrations:

```dart
import 'package:matinee/features/profile/profile_di.dart';
```

```dart
  registerProfileDependencies();
```

## Strings, in `lib/l10n/arb/app_en.arb`

```json
  "profileTitle": "Profile"
```

## `test/features/profile/presentation/cubit/profile_cubit_test.dart`

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/profile/data/models/profile_dto.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';

class _MockProfileRepository extends Mock implements ProfileRepository {}

void main() {
  group(ProfileCubit, () {
    late _MockProfileRepository repository;

    setUp(() {
      repository = _MockProfileRepository();
    });

    group('load', () {
      const profile = ProfileDto(id: '1', name: 'Dash');

      blocTest<ProfileCubit, ProfileState>(
        'emits [loading, success] when the repository returns a profile',
        setUp: () => when(repository.fetch).thenAnswer((_) async => profile),
        build: () => ProfileCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [ProfileState.loading(), ProfileState.success(profile)],
      );

      blocTest<ProfileCubit, ProfileState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.fetch).thenThrow(const NetworkException()),
        build: () => ProfileCubit(repository),
        act: (cubit) => cubit.load(),
        expect: () => const [ProfileState.loading(), ProfileState.failure(NetworkException())],
      );
    });
  });
}
```

## Widget test, only for non-trivial rendering

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';
import 'package:matinee/features/profile/presentation/profile_screen.dart';

import '../../../helpers/helpers.dart';

class _MockProfileCubit extends MockCubit<ProfileState> implements ProfileCubit {}

void main() {
  group(ProfileView, () {
    late ProfileCubit cubit;

    setUp(() {
      cubit = _MockProfileCubit();
    });

    Widget buildSubject() => BlocProvider<ProfileCubit>.value(value: cubit, child: const ProfileView());

    testWidgets('shows $ErrorView when the state is failure', (tester) async {
      when(() => cubit.state).thenReturn(const ProfileState.failure(NetworkException()));

      await tester.pumpApp(buildSubject());

      expect(find.byType(ErrorView), findsOneWidget);
    });
  });
}
```

The view widget is public and marked `@visibleForTesting` so tests can provide a mocked cubit above it; only `ProfileScreen` (which creates the real cubit) is used by routes.
