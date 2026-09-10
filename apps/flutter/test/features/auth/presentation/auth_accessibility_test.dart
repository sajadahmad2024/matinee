import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/auth/data/models/auth_outcome.dart';
import 'package:matinee/features/auth/presentation/create_account_screen.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/sign_in_screen.dart';
import 'package:matinee/features/auth/presentation/subscribe_screen.dart';
import 'package:matinee/features/auth/presentation/subscribe_sheet.dart';
import 'package:matinee/features/auth/presentation/verify_otp_screen.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_submit_button.dart';
import 'package:matinee/features/auth/presentation/widgets/otp_input.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockAuthCubit extends MockCubit<AuthState> implements AuthCubit {}

void main() {
  late AuthCubit cubit;

  setUp(() {
    cubit = _MockAuthCubit();
    when(() => cubit.state).thenReturn(const AuthState.initial());
    when(() => cubit.requestOtp(any())).thenAnswer((_) async {});
    when(
      () => cubit.verifyOtp(
        phoneNumber: any(named: 'phoneNumber'),
        code: any(named: 'code'),
      ),
    ).thenAnswer((_) async {});
  });

  Future<void> pump(WidgetTester tester, Widget view) {
    usePhoneSurface(tester);
    return tester.pumpApp(BlocProvider<AuthCubit>.value(value: cubit, child: view));
  }

  group('auth screens meet the guidelines', () {
    testWidgets('sign in', (tester) async {
      await pump(tester, const SignInView());
      await expectMeetsGuidelines(tester);
    });

    testWidgets('create account', (tester) async {
      await pump(tester, const CreateAccountView());
      await expectMeetsGuidelines(tester);
    });

    testWidgets('verify otp', (tester) async {
      await pump(tester, const VerifyOtpView(dialCode: '91', phoneNumber: '9876543210'));
      await expectMeetsGuidelines(tester);
    });

    testWidgets('subscribe', (tester) async {
      await pump(tester, const SubscribeView());
      await expectMeetsGuidelines(tester);
    });
  });

  group('form fields carry their own name', () {
    testWidgets('the phone field is named, not just labelled beside', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SignInView());

      // The design draws the label above the frame, so the field would reach a
      // screen reader as a nameless edit box; the hint merges in after it.
      final field = tester.getSemantics(find.byType(TextField));
      expect(field.getSemanticsData().flagsCollection.isTextField, isTrue);
      expect(field.label, startsWith('Phone Number'));
      handle.dispose();
    });

    testWidgets('an invalid field says so and carries the reason', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SignInView());

      await tester.enterText(find.byType(TextField), '12');
      FocusManager.instance.primaryFocus?.unfocus();
      await tester.pumpAndSettle();

      final field = tester.getSemantics(find.byType(TextField));
      expect(field.validationResult, SemanticsValidationResult.invalid);
      expect(field.getSemanticsData().hint, isNotEmpty);
      handle.dispose();
    });
  });

  group('the one-time code field', () {
    testWidgets('exists in the semantics tree and holds the code', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const VerifyOtpView(dialCode: '91', phoneNumber: '9876543210'));

      // Zero opacity drops a subtree from the semantics tree unless it is
      // asked to stay, leaving the six drawn digits and nothing to type into.

      // Three of the four digits: a complete code submits itself.
      await tester.enterText(
        find.descendant(of: find.byType(OtpInput), matching: find.byType(TextField)),
        '123',
      );
      await tester.pump();

      expect(
        tester.getSemantics(
          find.descendant(of: find.byType(OtpInput), matching: find.byType(TextField)),
        ),
        isSemantics(label: 'Verification code', value: '123', isTextField: true),
      );
      handle.dispose();
    });

    testWidgets('leaves the drawn digits out of the tree', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const VerifyOtpView(dialCode: '91', phoneNumber: '9876543210'));
      await tester.enterText(find.descendant(of: find.byType(OtpInput), matching: find.byType(TextField)), '12');
      await tester.pump();

      expect(find.bySemanticsLabel('1'), findsNothing);
      expect(find.bySemanticsLabel('2'), findsNothing);
      handle.dispose();
    });

    testWidgets('allows a pasted code, which authentication has to', (tester) async {
      await pump(tester, const VerifyOtpView(dialCode: '91', phoneNumber: '9876543210'));
      final field = tester.widget<TextField>(
        find.descendant(of: find.byType(OtpInput), matching: find.byType(TextField)),
      );
      expect(field.enableInteractiveSelection, isNot(false));
    });
  });

  testWidgets('the submit button keeps its name while it is busy', (tester) async {
    when(() => cubit.state).thenReturn(const AuthState.loading());
    final handle = tester.ensureSemantics();
    await pump(tester, const SignInView());

    // The spinner replaces the label, which leaves the control nameless at the
    // moment it most needs to say what it is doing.
    expect(
      tester.getSemantics(
        find.descendant(of: find.byType(AuthSubmitButton), matching: find.byType(FilledButton)),
      ),
      isSemantics(label: 'Get OTP'),
    );
    handle.dispose();
  });

  ///
  /// The auth flows that show a message, pumped with semantics on: a role is
  /// only checked once flushed, so these assert only on a real device.
  ///
  group('announcing flows survive a semantics update', () {
    testWidgets('a failed sign-in', (tester) async {
      final handle = tester.ensureSemantics();
      whenListen(
        cubit,
        Stream.fromIterable([
          const AuthState.loading(),
          const AuthState.failure(NetworkException()),
        ]),
        initialState: const AuthState.initial(),
      );
      await pump(tester, const SignInView());
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('a resent code', (tester) async {
      final handle = tester.ensureSemantics();
      whenListen(
        cubit,
        Stream.fromIterable([
          const AuthState.loading(),
          const AuthState.success(AuthOutcome.otpSent),
        ]),
        initialState: const AuthState.initial(),
      );
      await pump(tester, const VerifyOtpView(dialCode: '91', phoneNumber: '9876543210'));
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('a field that turns invalid under a screen reader', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SignInView());

      await tester.enterText(find.byType(TextField), '12');
      FocusManager.instance.primaryFocus?.unfocus();
      await pumpAnnouncement(tester);

      // The error is a status region of the app's own; nothing in the framework
      // marks it live, so the two cannot collide — this pins that down.
      expect(
        find.text('Enter the 10 digits of your number, without the dialling code.'),
        findsOne,
      );
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('the subscribe sheet, which carries its own messenger', (tester) async {
      final handle = tester.ensureSemantics();
      whenListen(
        cubit,
        Stream.fromIterable([
          const AuthState.loading(),
          const AuthState.failure(NetworkException()),
        ]),
        initialState: const AuthState.initial(),
      );
      usePhoneSurface(tester);
      await tester.pumpApp(
        BlocProvider<AuthCubit>.value(value: cubit, child: const SubscribeSheet()),
      );
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });
  });
}
