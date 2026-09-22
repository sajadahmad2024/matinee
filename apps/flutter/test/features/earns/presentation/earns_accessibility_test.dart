import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earned_badge.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_state.dart';
import 'package:matinee/features/earns/presentation/earns_screen.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockEarnsCubit extends MockCubit<EarnsState> implements EarnsCubit {}

const _standing = PointsStanding(
  totalPoints: 7082,
  badgeName: 'Expert',
  pointsToNextBadge: 918,
  nextBadgeName: 'Cinematic Loyalist',
  progressToNextBadge: 0.694,
  pointsIntoBadge: 2082,
  badgeSpan: 3000,
);

const _overview = EarnsOverview(
  standing: _standing,
  sources: [
    EarnSource(
      kind: EarnSourceKind.dailyStreaks,
      title: 'Daily Streaks',
      activity: '+120 today',
      points: 2691,
    ),
    EarnSource(
      kind: EarnSourceKind.weeklyQuests,
      title: 'Weekly Quests',
      activity: '+500 this week',
      points: 2691,
    ),
    EarnSource(
      kind: EarnSourceKind.predictionGames,
      title: 'Prediction Games',
      activity: '+0 today',
      points: 1200,
    ),
    EarnSource(
      kind: EarnSourceKind.auctionWins,
      title: 'Live Auction Wins',
      activity: 'Last win 3d ago',
      points: 500,
    ),
  ],
  badges: [
    EarnedBadge(
      id: 'newbie',
      name: 'Cinematic Newbie',
      requirement: '30 min streak for 15 days',
      status: BadgeStatus.earned,
    ),
    EarnedBadge(
      id: 'expert',
      name: 'Expert',
      requirement: '5,000–7,999 pts',
      status: BadgeStatus.current,
    ),
    EarnedBadge(
      id: 'loyalist',
      name: 'Cinematic Loyalist',
      requirement: '8,000–11,999 pts',
      status: BadgeStatus.locked,
    ),
  ],
);

void main() {
  Future<void> pump(WidgetTester tester, {double textScale = 1}) {
    usePhoneSurface(tester);
    final cubit = _MockEarnsCubit();
    when(() => cubit.state).thenReturn(const EarnsState.success(_overview));
    return tester.pumpApp(
      MediaQuery(
        data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
        child: BlocProvider<EarnsCubit>.value(value: cubit, child: const EarnsView()),
      ),
    );
  }

  Future<void> showBadges(WidgetTester tester) async {
    await tester.tap(find.text('Badges'));
    await tester.pump();
  }

  group('My Earns meets the guidelines', () {
    testWidgets('the earns half', (tester) async {
      await pump(tester);
      await expectMeetsGuidelines(tester);
    });

    testWidgets('the badges half', (tester) async {
      await pump(tester);
      await showBadges(tester);
      await expectMeetsGuidelines(tester);
    });

    testWidgets('the locked badges', (tester) async {
      await pump(tester);
      await showBadges(tester);
      await tester.tap(find.text('LOCKED'));
      await tester.pump();
      await expectMeetsGuidelines(tester);
    });
  });

  testWidgets('an earn row is one stop, and says the share its bar draws', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester);

    expect(
      find.bySemanticsLabel('Daily Streaks: 2,691 pts, 38% of your points. +120 today'),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets('a badge tile says its state, which the design draws only as a glyph', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester);
    await showBadges(tester);

    expect(find.bySemanticsLabel('Cinematic Newbie, earned. 30 min streak for 15 days'), findsOneWidget);
    expect(find.bySemanticsLabel('Expert, your current badge. 5,000–7,999 pts'), findsOneWidget);

    await tester.tap(find.text('LOCKED'));
    await tester.pump();

    expect(
      find.bySemanticsLabel('Cinematic Loyalist, locked. 8,000–11,999 pts'),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets('both selectors are tab bars, and each says which tab is chosen', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester);

    expect(
      tester.getSemantics(find.bySemanticsLabel('Earns')),
      isSemantics(role: SemanticsRole.tab, isSelected: true),
    );
    expect(
      tester.getSemantics(find.bySemanticsLabel('Badges')),
      isSemantics(role: SemanticsRole.tab, isSelected: false),
    );

    await showBadges(tester);

    expect(
      tester.getSemantics(find.bySemanticsLabel('Earned')),
      isSemantics(role: SemanticsRole.tab, isSelected: true),
    );
    expect(
      tester.getSemantics(find.bySemanticsLabel('Locked')),
      isSemantics(role: SemanticsRole.tab, isSelected: false),
    );
    handle.dispose();
  });

  testWidgets('the screen title is the heading its sections hang from', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester);

    final title = tester.getSemantics(find.bySemanticsLabel('My Earns'));

    expect(title, isSemantics(isHeader: true));
    // Level 1, so the section eyebrows under it have something to nest in.
    expect(title.headingLevel, 1);
    handle.dispose();
  });

  group('nothing is cut off as text grows', () {
    for (final scale in <double>[1.5, 2]) {
      testWidgets('the earns half scrolls at ${scale}x', (tester) async {
        await pump(tester, textScale: scale);

        expect(tester.takeException(), isNull);
        expect(
          tester.state<ScrollableState>(find.byType(Scrollable)).position.maxScrollExtent,
          greaterThan(0),
        );
      });

      testWidgets('the badges half scrolls at ${scale}x', (tester) async {
        await pump(tester, textScale: scale);
        await showBadges(tester);

        expect(tester.takeException(), isNull);
        expect(
          tester.state<ScrollableState>(find.byType(Scrollable)).position.maxScrollExtent,
          greaterThan(0),
        );
      });
    }
  });

  testWidgets('the earns half does not scroll when its content fits', (tester) async {
    await pump(tester);

    expect(
      tester.state<ScrollableState>(find.byType(Scrollable)).position.maxScrollExtent,
      isZero,
    );
  });
}
