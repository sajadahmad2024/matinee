import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';
import 'package:matinee/features/profile/presentation/edit_profile_screen.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_field.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockProfileCubit extends MockCubit<ProfileState> implements ProfileCubit {}

void main() {
  group(EditProfileView, () {
    late ProfileCubit cubit;

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

    setUp(() {
      cubit = _MockProfileCubit();
      when(() => cubit.state).thenReturn(ProfileState.success(profile));
      when(
        () => cubit.save(
          name: any(named: 'name'),
          email: any(named: 'email'),
          phoneNumber: any(named: 'phoneNumber'),
        ),
      ).thenAnswer((_) async {});
    });

    Future<void> pumpView(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        BlocProvider<ProfileCubit>.value(value: cubit, child: const EditProfileView()),
      );
    }

    group('renders', () {
      testWidgets('the three fields filled in from the loaded profile', (tester) async {
        await pumpView(tester);

        expect(find.byType(ProfileField), findsNWidgets(3));
        expect(find.text(profile.name), findsOneWidget);
        expect(find.text(profile.email), findsOneWidget);
        expect(find.text(profile.phoneNumber), findsOneWidget);
      });
    });

    group('keeps the form', () {
      testWidgets('when a save fails, rather than replacing it with an error', (tester) async {
        whenListen(
          cubit,
          Stream<ProfileState>.fromIterable([
            const ProfileState.loading(),
            const ProfileState.failure(NetworkException()),
          ]),
          initialState: ProfileState.success(profile),
        );

        await pumpView(tester);
        await tester.pump();
        await tester.pump();

        // Everything the user typed would be gone if the body rebuilt.
        expect(find.byType(ProfileField), findsNWidgets(3));
        expect(find.byType(ErrorView), findsNothing);
      });
    });

    group('explains itself', () {
      testWidgets('when save is refused because a value arrived invalid', (tester) async {
        await pumpView(tester);

        await tester.enterText(find.byType(TextField).at(1), 'not-an-email');
        // Tapping straight away, without leaving the field, is what a value
        // that arrived invalid from the server would look like.
        await tester.tap(find.text('Save Changes'));
        await tester.pump();

        expect(find.text('Enter a valid email address.'), findsOneWidget);
      });
    });

    group('calls save', () {
      testWidgets('with what the user typed', (tester) async {
        await pumpView(tester);

        await tester.enterText(find.byType(TextField).first, 'Sarah Jones');
        await tester.tap(find.text('Save Changes'));
        await tester.pump();

        verify(
          () => cubit.save(
            name: 'Sarah Jones',
            email: profile.email,
            phoneNumber: profile.phoneNumber,
          ),
        ).called(1);
      });

      testWidgets('never while a field is invalid', (tester) async {
        await pumpView(tester);

        await tester.enterText(find.byType(TextField).at(1), 'not-an-email');
        await tester.tap(find.text('Save Changes'));
        await tester.pump();

        verifyNever(
          () => cubit.save(
            name: any(named: 'name'),
            email: any(named: 'email'),
            phoneNumber: any(named: 'phoneNumber'),
          ),
        );
      });
    });
  });
}
