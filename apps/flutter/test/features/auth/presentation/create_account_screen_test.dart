import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/auth/presentation/create_account_screen.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_field.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockAuthCubit extends MockCubit<AuthState> implements AuthCubit {}

void main() {
  group(CreateAccountView, () {
    late AuthCubit cubit;

    setUp(() {
      cubit = _MockAuthCubit();
      when(() => cubit.state).thenReturn(const AuthState.initial());
      when(
        () => cubit.createAccount(
          name: any(named: 'name'),
          referralCode: any(named: 'referralCode'),
        ),
      ).thenAnswer((_) async {});
    });

    Future<void> pumpView(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        BlocProvider<AuthCubit>.value(value: cubit, child: const CreateAccountView()),
      );
    }

    Finder fieldAt(int index) =>
        find.descendant(of: find.byType(AuthField).at(index), matching: find.byType(TextField));

    group('renders', () {
      testWidgets('a name field and an optional referral field', (tester) async {
        await pumpView(tester);

        expect(find.byType(AuthField), findsNWidgets(2));
      });
    });

    group('calls createAccount', () {
      testWidgets('never while the name is empty', (tester) async {
        await pumpView(tester);

        expect(tester.widget<FilledButton>(find.byType(FilledButton)).onPressed, isNull);
      });

      testWidgets('with a null referral code when that field is left blank', (tester) async {
        await pumpView(tester);
        await tester.enterText(fieldAt(0), 'Dash');
        await tester.pump();
        await tester.tap(find.byType(FilledButton));
        await tester.pump();

        verify(() => cubit.createAccount(name: 'Dash', referralCode: null)).called(1);
      });

      testWidgets('never when the keyboard submits with no name typed', (tester) async {
        await pumpView(tester);
        await tester.enterText(fieldAt(1), 'CH');
        await tester.testTextInput.receiveAction(TextInputAction.done);
        await tester.pump();

        verifyNever(
          () => cubit.createAccount(
            name: any(named: 'name'),
            referralCode: any(named: 'referralCode'),
          ),
        );
      });

      testWidgets('never while the referral code the user typed is malformed', (tester) async {
        await pumpView(tester);
        await tester.enterText(fieldAt(0), 'Dash');
        await tester.enterText(fieldAt(1), 'CH');
        await tester.pump();

        expect(tester.widget<FilledButton>(find.byType(FilledButton)).onPressed, isNull);
      });
    });
  });
}
