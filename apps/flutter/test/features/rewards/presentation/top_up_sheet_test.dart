import 'dart:async';

import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_state.dart';
import 'package:matinee/features/rewards/presentation/top_up_sheet.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockTopUpCubit extends MockCubit<TopUpState> implements TopUpCubit {}

void main() {
  group(TopUpSheet, () {
    late TopUpCubit cubit;

    const small = PointsPack(id: 'pack-500', points: 500, priceLabel: '₹79');
    const large = PointsPack(id: 'pack-1500', points: 1500, priceLabel: '₹199');
    const packs = [small, large];

    setUpAll(() {
      registerFallbackValue(small);
    });

    setUp(() {
      cubit = _MockTopUpCubit();
      when(() => cubit.selectPack(any())).thenAnswer((_) async {});
      when(cubit.purchase).thenAnswer((_) async {});
    });

    Future<void> pumpSheet(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        Scaffold(
          body: BlocProvider<TopUpCubit>.value(value: cubit, child: const TopUpSheet()),
        ),
      );
    }

    testWidgets('opens at the height it keeps once the packs arrive', (tester) async {
      final states = StreamController<TopUpState>();
      addTearDown(states.close);
      whenListen(cubit, states.stream, initialState: const TopUpState.loading());
      await pumpSheet(tester);

      // The sheet is content-sized, so a state that fills the height it is
      // offered stands it up at the full screen. 844 is the pumped view.
      final pending = tester.getSize(find.byType(AnimatedSize)).height;
      expect(pending, lessThan(600));

      states.add(const TopUpState.success(TopUpData(packs: packs, selected: small)));
      await tester.pumpAndSettle();

      expect(tester.getSize(find.byType(AnimatedSize)).height, closeTo(pending, 2));
    });

    group('renders', () {
      testWidgets('a card per pack and the price on the action', (tester) async {
        when(() => cubit.state).thenReturn(
          const TopUpState.success(TopUpData(packs: packs, selected: small)),
        );
        await pumpSheet(tester);

        expect(find.text('500'), findsOneWidget);
        expect(find.text('1,500'), findsOneWidget);
        expect(find.text('Continue to Pay ₹79'), findsOneWidget);
      });

      testWidgets('the receipt once the purchase has landed', (tester) async {
        when(() => cubit.state).thenReturn(
          const TopUpState.success(TopUpData(packs: packs, selected: small, purchased: true)),
        );
        await pumpSheet(tester);

        expect(find.text('Payment Successful'), findsOneWidget);
        expect(find.text('+500 PTS Credited'), findsOneWidget);
        // No payment method sits between the pack and the receipt.
        expect(find.textContaining('Continue to Pay'), findsNothing);
      });
    });

    group('calls', () {
      testWidgets('selectPack when another pack is tapped', (tester) async {
        when(() => cubit.state).thenReturn(
          const TopUpState.success(TopUpData(packs: packs, selected: small)),
        );
        await pumpSheet(tester);

        await tester.tap(find.text('1,500'));
        await tester.pump();

        verify(() => cubit.selectPack(large)).called(1);
      });

      testWidgets('purchase when the action is tapped', (tester) async {
        when(() => cubit.state).thenReturn(
          const TopUpState.success(TopUpData(packs: packs, selected: small)),
        );
        await pumpSheet(tester);

        await tester.tap(find.text('Continue to Pay ₹79'));
        await tester.pump();

        verify(cubit.purchase).called(1);
      });
    });
  });
}
