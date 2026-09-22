import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/earns/data/models/earn_detail.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_state.dart';
import 'package:matinee/features/earns/presentation/earn_detail_screen.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';
import 'earn_detail_fixtures.dart' as fixtures;

class _MockEarnDetailCubit extends MockCubit<EarnDetailState> implements EarnDetailCubit {}

void main() {
  Future<void> pump(
    WidgetTester tester,
    EarnSourceKind kind,
    EarnDetail detail, {
    double textScale = 1,
  }) {
    usePhoneSurface(tester);
    final cubit = _MockEarnDetailCubit();
    when(() => cubit.state).thenReturn(EarnDetailState.success(detail));
    return tester.pumpApp(
      MediaQuery(
        data: MediaQueryData(textScaler: TextScaler.linear(textScale)),
        child: BlocProvider<EarnDetailCubit>.value(
          value: cubit,
          child: EarnDetailView(kind: kind),
        ),
      ),
    );
  }

  final screens = <(String, EarnSourceKind, EarnDetail)>[
    ('the streak log', EarnSourceKind.dailyStreaks, fixtures.streaks),
    ('the auction wins', EarnSourceKind.auctionWins, fixtures.auction),
    ('the prediction history', EarnSourceKind.predictionGames, fixtures.predictions),
    ('the quest history', EarnSourceKind.weeklyQuests, fixtures.quests),
  ];

  group('a My Earns history screen meets the guidelines', () {
    for (final (name, kind, detail) in screens) {
      testWidgets(name, (tester) async {
        await pump(tester, kind, detail);
        await expectMeetsGuidelines(tester);
      });

      testWidgets('$name at a text scale of 1.3', (tester) async {
        await pump(tester, kind, detail, textScale: 1.3);
        await expectMeetsGuidelines(tester);
      });
    }
  });

  testWidgets('a streak day is one stop, tile and pill included', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, EarnSourceKind.dailyStreaks, fixtures.streaks);

    expect(
      find.bySemanticsLabel(
        'Jul 9, 2026, day 15 of the streak. 47 minutes watched, 120 pts awarded. '
        'Level 2 reached. Badge earned: Spark Keeper.',
      ),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets('a ladder rung says whether it was reached, which the design shows in a dot', (
    tester,
  ) async {
    final handle = tester.ensureSemantics();
    await pump(tester, EarnSourceKind.dailyStreaks, fixtures.streaks);

    expect(find.bySemanticsLabel('Lv 2, 45 minutes a day, reached'), findsOneWidget);
    expect(find.bySemanticsLabel('Lv 3, 60 minutes a day, not reached yet'), findsOneWidget);
    handle.dispose();
  });

  testWidgets('an auction win is one stop, and names the lot it was', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, EarnSourceKind.auctionWins, fixtures.auction);

    expect(
      find.bySemanticsLabel(
        'Signed Poster, MEMORABILIA, won Jun 30, 2026. Winning bid 12,500 CP. '
        '200 pts awarded. Badge earned: High Roller.',
      ),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets('a lost prediction says so, where the card only colours the result', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, EarnSourceKind.predictionGames, fixtures.predictions);

    expect(
      find.bySemanticsLabel(
        'The Silent Storm Box Office, INCORRECT. Top 5 worldwide opening weekend? '
        'Your vote: YES. Result: NO. no points awarded. ',
      ),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets('a part-finished quest week says so, not just in gold', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, EarnSourceKind.weeklyQuests, fixtures.quests);

    expect(
      find.bySemanticsLabel(
        'Indie Gems Spotlight, PARTIAL, Jun 2 – Jun 8. 3 of 4 actions completed · Done Jun 8. '
        '200 pts awarded. ',
      ),
      findsOneWidget,
    );
    handle.dispose();
  });

  testWidgets('the history is a list, so a card is read with its position in it', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, EarnSourceKind.weeklyQuests, fixtures.quests);

    expect(
      tester.getSemantics(find.bySemanticsLabel('QUEST HISTORY')),
      isSemantics(isHeader: true),
    );
    expect(
      find.descendant(
        of: find.byType(EarnDetailView),
        matching: find.byWidgetPredicate(
          (widget) => widget is SliverSemantics && widget.properties.role == SemanticsRole.list,
        ),
      ),
      findsOneWidget,
    );
    // The list role announces a position only if its children claim to be items.
    expect(
      tester.getSemantics(find.bySemanticsLabel(RegExp('Summer Blockbuster Blitz'))),
      isSemantics(role: SemanticsRole.listItem),
    );
    handle.dispose();
  });

  testWidgets('the total and the stat are one stop each, not five', (tester) async {
    final handle = tester.ensureSemantics();
    await pump(tester, EarnSourceKind.predictionGames, fixtures.predictions);

    expect(
      find.bySemanticsLabel('Prediction Games: 1,200 pts earned'),
      findsOneWidget,
    );
    expect(find.bySemanticsLabel('Accuracy: 50%. 1/2 correct'), findsOneWidget);
    handle.dispose();
  });
}
