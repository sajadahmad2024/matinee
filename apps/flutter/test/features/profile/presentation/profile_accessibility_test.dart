import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';
import 'package:matinee/features/profile/presentation/edit_profile_screen.dart';
import 'package:matinee/features/profile/presentation/profile_screen.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_field.dart';
import 'package:matinee/features/profile/presentation/widgets/refer_sheet.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockProfileCubit extends MockCubit<ProfileState> implements ProfileCubit {}

void main() {
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

  Future<void> pump(WidgetTester tester, Widget view) {
    usePhoneSurface(tester);
    return tester.pumpApp(BlocProvider<ProfileCubit>.value(value: cubit, child: view));
  }

  group('profile screens meet the guidelines', () {
    testWidgets('profile', (tester) async {
      await pump(tester, const ProfileView());
      await expectMeetsGuidelines(tester);
    });

    testWidgets('edit profile', (tester) async {
      await pump(tester, const EditProfileView());
      await expectMeetsGuidelines(tester);
    });

    testWidgets('refer sheet', (tester) async {
      usePhoneSurface(tester);
      await tester.pumpApp(const ReferSheet(referralCode: 'CH8362'));
      await expectMeetsGuidelines(tester);
    });
  });

  testWidgets('a counter is read as one figure with its unit', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, const ProfileView());

    // The value and its label are drawn as two lines, which a screen reader
    // would otherwise offer as a bare number and a stray word.
    expect(find.bySemanticsLabel('2,500 Total Points'), findsOne);
    expect(find.bySemanticsLabel('257 Streaks'), findsOne);
    expect(find.bySemanticsLabel('#260 Rank'), findsOne);
    handle.dispose();
  });

  testWidgets('a menu row is a button, and an inert one says so', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, const ProfileView());

    expect(
      tester.getSemantics(find.bySemanticsLabel('Refer a Friend')),
      isSemantics(isButton: true, isEnabled: true),
    );
    // My Earns has no screen yet, so the row is drawn but does nothing.
    expect(
      tester.getSemantics(find.bySemanticsLabel('My Earns')),
      isSemantics(isButton: true, isEnabled: false),
    );
    handle.dispose();
  });

  testWidgets('the edit form names each field', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, const EditProfileView());

    for (final name in ['Full Name', 'Email ID', 'Phone No.']) {
      expect(
        tester.getSemantics(
          find.descendant(
            of: find.ancestor(
              of: find.text(name.toUpperCase()),
              matching: find.byType(ProfileField),
            ),
            matching: find.byType(TextField),
          ),
        ),
        isSemantics(label: name, isTextField: true),
      );
    }
    handle.dispose();
  });

  testWidgets('a refused save marks the offending field invalid', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, const EditProfileView());

    await tester.enterText(find.byType(TextField).first, '');
    await tester.tap(find.text('Save Changes'));
    await tester.pumpAndSettle();

    expect(
      tester.getSemantics(find.byType(TextField).first).validationResult,
      SemanticsValidationResult.invalid,
    );
    handle.dispose();
  });

  testWidgets('the share discs do not announce their stand-in letter', (tester) async {
    final handle = tester.ensureSemantics();
    usePhoneSurface(tester);
    await tester.pumpApp(const ReferSheet(referralCode: 'CH8362'));

    // The letter stands where a brand mark will go; it is drawing, not content.
    expect(find.bySemanticsLabel('W\nWhatsApp'), findsNothing);
    expect(find.bySemanticsLabel('WhatsApp'), findsOne);
    handle.dispose();
  });

  group('nothing is cut off as text grows', () {
    for (final scale in <double>[1.5, 2]) {
      testWidgets('the refer sheet scrolls at ${scale}x', (tester) async {
        usePhoneSurface(tester);
        await tester.pumpApp(
          MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(scale)),
            child: const ReferSheet(referralCode: 'CH8362'),
          ),
        );
        expect(tester.takeException(), isNull);
        expect(find.byType(Scrollable), findsWidgets);
      });
    }
  });

  ///
  /// Every path that shows a message or swaps a screen, pumped with semantics
  /// on: a role reaches the tree only when something is listening.
  ///
  /// Each asserts the message actually appeared — an exception check on a flow
  /// that never ran passes for the wrong reason.
  ///
  group('announcing flows survive a semantics update', () {
    testWidgets('a saved profile', (tester) async {
      final handle = tester.ensureSemantics();
      whenListen(
        cubit,
        Stream.fromIterable([const ProfileState.loading(), ProfileState.success(profile)]),
        initialState: ProfileState.success(profile),
      );
      await pump(tester, const EditProfileView());
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('a save that fails', (tester) async {
      final handle = tester.ensureSemantics();
      whenListen(
        cubit,
        Stream.fromIterable([
          const ProfileState.loading(),
          const ProfileState.failure(NetworkException()),
        ]),
        initialState: ProfileState.success(profile),
      );
      await pump(tester, const EditProfileView());
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('copying the referral code', (tester) async {
      // The copy awaits the platform clipboard, and the message comes after it.
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        (call) async => null,
      );
      addTearDown(
        () => TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
          SystemChannels.platform,
          null,
        ),
      );
      final handle = tester.ensureSemantics();
      usePhoneSurface(tester);
      await tester.pumpApp(const ReferSheet(referralCode: 'CH8362'));

      await tester.tap(find.text('Copy Code'));
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('the loading and failure screens', (tester) async {
      final handle = tester.ensureSemantics();
      when(() => cubit.state).thenReturn(const ProfileState.loading());
      await pump(tester, const ProfileView());
      await tester.pump();
      expect(tester.takeException(), isNull);

      when(() => cubit.state).thenReturn(const ProfileState.failure(NetworkException()));
      await pump(tester, const ProfileView());
      await tester.pump();
      expect(tester.takeException(), isNull);
      handle.dispose();
    });
  });
}
