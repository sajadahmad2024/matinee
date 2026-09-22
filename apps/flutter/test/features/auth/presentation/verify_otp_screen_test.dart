import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/verify_otp_screen.dart';
import 'package:matinee/features/auth/presentation/widgets/otp_input.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockAuthCubit extends MockCubit<AuthState> implements AuthCubit {}

void main() {
  group(VerifyOtpView, () {
    const dialCode = '91';
    const phoneNumber = '9876543210';
    const dialled = '+$dialCode$phoneNumber';
    late AuthCubit cubit;

    setUp(() {
      cubit = _MockAuthCubit();
      when(() => cubit.state).thenReturn(const AuthState.initial());
    });

    Future<void> pumpView(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        BlocProvider<AuthCubit>.value(
          value: cubit,
          child: const VerifyOtpView(dialCode: dialCode, phoneNumber: phoneNumber),
        ),
      );
    }

    Finder field() => find.descendant(of: find.byType(OtpInput), matching: find.byType(TextField));

    Future<void> enterCode(WidgetTester tester, String code) async {
      await tester.enterText(field(), code);
      await tester.pump();
    }

    void whenVerifySucceeds() {
      when(
        () => cubit.verifyOtp(
          phoneNumber: any(named: 'phoneNumber'),
          code: any(named: 'code'),
        ),
      ).thenAnswer((_) async {});
    }

    group('renders', () {
      testWidgets('the boxes over a single field that holds the whole code', (tester) async {
        await pumpView(tester);

        expect(find.byType(OtpInput), findsOneWidget);
        expect(field(), findsOneWidget);
      });

      testWidgets('a digit per box as the code is typed', (tester) async {
        await pumpView(tester);
        await enterCode(tester, '12');

        expect(find.text('1'), findsOneWidget);
        expect(find.text('2'), findsOneWidget);
      });

      testWidgets('every digit when a whole code arrives at once, as a paste does', (tester) async {
        whenVerifySucceeds();

        await pumpView(tester);
        await enterCode(tester, '1234');

        for (final digit in ['1', '2', '3', '4']) {
          expect(find.text(digit), findsOneWidget);
        }
      });
    });

    group('calls verifyOtp', () {
      testWidgets('never while the code is incomplete', (tester) async {
        await pumpView(tester);
        await enterCode(tester, '12');

        expect(tester.widget<FilledButton>(find.byType(FilledButton)).onPressed, isNull);
        verifyNever(
          () => cubit.verifyOtp(
            phoneNumber: any(named: 'phoneNumber'),
            code: any(named: 'code'),
          ),
        );
      });

      testWidgets('as soon as the last digit lands', (tester) async {
        whenVerifySucceeds();

        await pumpView(tester);
        await enterCode(tester, '1234');

        verify(() => cubit.verifyOtp(phoneNumber: dialled, code: '1234')).called(1);
      });

      testWidgets('once while the code stays complete', (tester) async {
        whenVerifySucceeds();

        await pumpView(tester);
        await enterCode(tester, '1234');
        // A second delivery of an already-complete code — an SMS autofill
        // landing after a paste, say — must not send it again.
        await enterCode(tester, '1234');

        verify(
          () => cubit.verifyOtp(
            phoneNumber: any(named: 'phoneNumber'),
            code: any(named: 'code'),
          ),
        ).called(1);
      });

      testWidgets('again once the code is cleared and completed afresh', (tester) async {
        whenVerifySucceeds();

        await pumpView(tester);
        await enterCode(tester, '1234');
        await enterCode(tester, '');
        await enterCode(tester, '5678');

        verify(
          () => cubit.verifyOtp(
            phoneNumber: any(named: 'phoneNumber'),
            code: any(named: 'code'),
          ),
        ).called(2);
      });
    });
  });
}
