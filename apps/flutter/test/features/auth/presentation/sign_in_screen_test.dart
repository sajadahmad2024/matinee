import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/sign_in_screen.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_field.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_social_button.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockAuthCubit extends MockCubit<AuthState> implements AuthCubit {}

void main() {
  group(SignInView, () {
    const validNumber = '9876543210';
    // The screen sends the number under its dialling code.
    const dialled = '+91$validNumber';
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
        BlocProvider<AuthCubit>.value(value: cubit, child: const SignInView()),
      );
    }

    group('renders', () {
      testWidgets('the phone field and both provider buttons', (tester) async {
        await pumpView(tester);

        expect(find.byType(AuthField), findsOneWidget);
        expect(find.byType(AuthSocialButton), findsNWidgets(2));
      });

      testWidgets('the whole form without overflowing at a text scale of 1.3', (tester) async {
        tester.view.physicalSize = const Size(1170, 2532);
        tester.view.devicePixelRatio = 3;
        addTearDown(tester.view.reset);

        await tester.pumpApp(
          MediaQuery(
            data: const MediaQueryData(textScaler: TextScaler.linear(1.3)),
            child: BlocProvider<AuthCubit>.value(value: cubit, child: const SignInView()),
          ),
        );

        // The column scrolls rather than overflowing, so what matters is that
        // nothing threw and the CTA still stands at its designed height.
        expect(tester.takeException(), isNull);
        expect(find.byType(AuthField), findsOneWidget);
        expect(tester.getRect(find.byType(FilledButton)).height, greaterThanOrEqualTo(52));
      });
    });

    group('updates', () {
      testWidgets('the dialling code and clears the number when a country is chosen', (tester) async {
        await pumpView(tester);
        await tester.enterText(find.byType(TextField), validNumber);
        await tester.pump();

        await tester.tap(find.text('+91'));
        await tester.pumpAndSettle();
        await tester.tap(find.text('Singapore'));
        await tester.pumpAndSettle();

        expect(find.text('+65'), findsOneWidget);
        expect(find.text(validNumber), findsNothing);
        expect(tester.widget<FilledButton>(find.byType(FilledButton)).onPressed, isNull);
      });
    });

    group('calls requestOtp', () {
      testWidgets('never while the number is incomplete', (tester) async {
        await pumpView(tester);
        await tester.enterText(find.byType(TextField), '98765');
        await tester.pump();

        expect(tester.widget<FilledButton>(find.byType(FilledButton)).onPressed, isNull);
      });

      testWidgets('never when the keyboard submits an incomplete number', (tester) async {
        await pumpView(tester);
        await tester.enterText(find.byType(TextField), '98765');
        await tester.testTextInput.receiveAction(TextInputAction.done);
        await tester.pump();

        verifyNever(() => cubit.requestOtp(any()));
      });

      testWidgets('when the number is complete and the CTA is tapped', (tester) async {
        when(() => cubit.requestOtp(any())).thenAnswer((_) async {});

        await pumpView(tester);
        await tester.enterText(find.byType(TextField), validNumber);
        await tester.pump();
        await tester.tap(find.byType(FilledButton));
        await tester.pump();

        verify(() => cubit.requestOtp(dialled)).called(1);
      });
    });
  });
}
