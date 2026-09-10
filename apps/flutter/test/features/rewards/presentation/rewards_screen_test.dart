import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/features/rewards/data/models/rewards_summary.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_state.dart';
import 'package:matinee/features/rewards/presentation/rewards_screen.dart';
import 'package:matinee/features/rewards/presentation/widgets/redeem_card.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockRewardsCubit extends MockCubit<RewardsState> implements RewardsCubit {}

void main() {
  group(RewardsView, () {
    late RewardsCubit cubit;

    const summary = RewardsSummary(
      totalPoints: 7082,
      badgeName: 'Expert',
      pointsToNextBadge: 918,
      nextBadgeName: 'Loyalist',
      destinations: [
        RedeemDestination(
          kind: RedeemKind.liveAuction,
          category: 'AUCTION',
          title: 'Live Auction',
          subtitle: 'Watch trailers & complete missions',
          imageAsset: 'assets/images/rewards-auction.jpg',
        ),
        RedeemDestination(
          kind: RedeemKind.exclusiveContent,
          category: 'BTS & TRAILERS',
          title: 'Exclusive Content',
          subtitle: 'Get access to exclusive BTS & trailers',
          imageAsset: 'assets/images/rewards-exclusive.jpg',
        ),
      ],
    );

    setUp(() => cubit = _MockRewardsCubit());

    Future<void> pumpView(WidgetTester tester, {double textScale = 1}) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        MediaQuery(
          data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
          child: BlocProvider<RewardsCubit>.value(value: cubit, child: const RewardsView()),
        ),
      );
    }

    group('renders', () {
      testWidgets('the balance and badge standing with a thousands separator', (tester) async {
        when(() => cubit.state).thenReturn(const RewardsState.success(summary));
        await pumpView(tester);

        expect(find.text('7,082'), findsOneWidget);
        expect(find.text('Expert'), findsOneWidget);
        expect(find.text('918 pts to Loyalist'), findsOneWidget);
      });

      testWidgets('one card per redeem destination', (tester) async {
        when(() => cubit.state).thenReturn(const RewardsState.success(summary));
        await pumpView(tester);

        expect(find.byType(RedeemCard), findsNWidgets(2));
        expect(find.text('Live Auction'), findsOneWidget);
        expect(find.text('Exclusive Content'), findsOneWidget);
      });

      testWidgets('a spinner while the summary is on its way', (tester) async {
        when(() => cubit.state).thenReturn(const RewardsState.loading());
        await pumpView(tester);

        expect(find.byType(CircularProgressIndicator), findsOneWidget);
      });

      testWidgets('an $ErrorView when the summary fails', (tester) async {
        when(() => cubit.state).thenReturn(const RewardsState.failure(NetworkException()));
        await pumpView(tester);

        expect(find.byType(ErrorView), findsOneWidget);
      });
    });

    group('accessibility', () {
      testWidgets('meets the tap target and labelling guidelines', (tester) async {
        when(() => cubit.state).thenReturn(const RewardsState.success(summary));
        await pumpView(tester);

        await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
        await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
        await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
      });

      testWidgets('lays out without overflow at a 1.3 text scale', (tester) async {
        // The balance and the badge column share one row, so a scaled-up label
        // is the first thing that would push the header past the screen edge.
        when(() => cubit.state).thenReturn(const RewardsState.success(summary));
        await pumpView(tester, textScale: 1.3);

        expect(tester.takeException(), isNull);
      });
    });
  });
}
