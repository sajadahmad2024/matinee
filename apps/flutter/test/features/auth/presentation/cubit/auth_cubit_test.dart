import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/data/models/auth_outcome.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:mocktail/mocktail.dart';

class _MockAuthRepository extends Mock implements AuthRepository {}

void main() {
  group(AuthCubit, () {
    const phoneNumber = '9876543210';
    const code = '1234';
    late _MockAuthRepository repository;

    setUp(() {
      repository = _MockAuthRepository();
    });

    AuthCubit build() => AuthCubit(repository);

    group('requestOtp', () {
      blocTest<AuthCubit, AuthState>(
        'emits [loading, success] carrying $AuthOutcome.otpSent',
        setUp: () => when(() => repository.requestOtp(any())).thenAnswer((_) async {}),
        build: build,
        act: (cubit) => cubit.requestOtp(phoneNumber),
        expect: () => const [AuthState.loading(), AuthState.success(AuthOutcome.otpSent)],
        verify: (_) => verify(() => repository.requestOtp(phoneNumber)).called(1),
      );

      blocTest<AuthCubit, AuthState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(() => repository.requestOtp(any())).thenThrow(const NetworkException()),
        build: build,
        act: (cubit) => cubit.requestOtp(phoneNumber),
        expect: () => const [AuthState.loading(), AuthState.failure(NetworkException())],
      );
    });

    group('verifyOtp', () {
      blocTest<AuthCubit, AuthState>(
        'emits [loading, success] carrying $AuthOutcome.otpVerified',
        setUp: () => when(
          () => repository.verifyOtp(
            phoneNumber: any(named: 'phoneNumber'),
            code: any(named: 'code'),
          ),
        ).thenAnswer((_) async {}),
        build: build,
        act: (cubit) => cubit.verifyOtp(phoneNumber: phoneNumber, code: code),
        expect: () => const [AuthState.loading(), AuthState.success(AuthOutcome.otpVerified)],
      );

      blocTest<AuthCubit, AuthState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(
          () => repository.verifyOtp(
            phoneNumber: any(named: 'phoneNumber'),
            code: any(named: 'code'),
          ),
        ).thenThrow(const ValidationException(400)),
        build: build,
        act: (cubit) => cubit.verifyOtp(phoneNumber: phoneNumber, code: code),
        expect: () => const [AuthState.loading(), AuthState.failure(ValidationException(400))],
      );
    });

    group('createAccount', () {
      blocTest<AuthCubit, AuthState>(
        'emits [loading, success] carrying $AuthOutcome.accountCreated',
        setUp: () => when(
          () => repository.createAccount(
            name: any(named: 'name'),
            referralCode: any(named: 'referralCode'),
          ),
        ).thenAnswer((_) async {}),
        build: build,
        act: (cubit) => cubit.createAccount(name: 'Dash', referralCode: null),
        expect: () => const [AuthState.loading(), AuthState.success(AuthOutcome.accountCreated)],
      );

      blocTest<AuthCubit, AuthState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(
          () => repository.createAccount(
            name: any(named: 'name'),
            referralCode: any(named: 'referralCode'),
          ),
        ).thenThrow(const ServerException(500)),
        build: build,
        act: (cubit) => cubit.createAccount(name: 'Dash', referralCode: 'CH8362'),
        expect: () => const [AuthState.loading(), AuthState.failure(ServerException(500))],
      );
    });

    group('subscribe', () {
      blocTest<AuthCubit, AuthState>(
        'emits [loading, success] carrying $AuthOutcome.subscribed',
        setUp: () => when(repository.subscribe).thenAnswer((_) async {}),
        build: build,
        act: (cubit) => cubit.subscribe(),
        expect: () => const [AuthState.loading(), AuthState.success(AuthOutcome.subscribed)],
      );

      blocTest<AuthCubit, AuthState>(
        'emits [loading, failure] when the repository throws an $AppException',
        setUp: () => when(repository.subscribe).thenThrow(const NetworkException()),
        build: build,
        act: (cubit) => cubit.subscribe(),
        expect: () => const [AuthState.loading(), AuthState.failure(NetworkException())],
      );
    });
  });
}
