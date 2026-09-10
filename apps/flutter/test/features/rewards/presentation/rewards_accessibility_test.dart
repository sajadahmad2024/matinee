import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/models/rewards_summary.dart';
import 'package:matinee/features/rewards/presentation/auction_screen.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_state.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_state.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_state.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_state.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_state.dart';
import 'package:matinee/features/rewards/presentation/exclusive_library_screen.dart';
import 'package:matinee/features/rewards/presentation/rewards_screen.dart';
import 'package:matinee/features/rewards/presentation/top_up_sheet.dart';
import 'package:matinee/features/rewards/presentation/unlock_content_screen.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockRewardsCubit extends MockCubit<RewardsState> implements RewardsCubit {}

class _MockAuctionCubit extends MockCubit<AuctionState> implements AuctionCubit {}

class _MockLibraryCubit extends MockCubit<ExclusiveLibraryState> implements ExclusiveLibraryCubit {}

class _MockUnlockCubit extends MockCubit<UnlockContentState> implements UnlockContentCubit {}

class _MockTopUpCubit extends MockCubit<TopUpState> implements TopUpCubit {}

const _asset = 'assets/images/onboarding-1.jpg';

final _auction = AuctionBoard(
  pointsBalance: 12450,
  auction: Auction(
    id: 'a1',
    title: 'Signed Premiere Poster',
    description: 'A rare signed poster from the premiere, framed and numbered.',
    imageAsset: _asset,
    currentBid: 5000,
    minimumIncrement: 500,
    watching: 128,
    endsAt: DateTime.now().add(const Duration(hours: 2)),
    quickIncrements: const [100, 500, 1000, 5000],
    bids: [
      AuctionBid(
        bidderName: 'Alexandra Chen',
        amount: 5000,
        placedAt: DateTime.now().subtract(const Duration(minutes: 2)),
        isLeading: true,
      ),
      AuctionBid(
        bidderName: 'Ben Ito',
        amount: 4500,
        placedAt: DateTime.now().subtract(const Duration(minutes: 9)),
      ),
    ],
  ),
);

const _summary = RewardsSummary(
  totalPoints: 12450,
  badgeName: 'Cinephile',
  pointsToNextBadge: 550,
  nextBadgeName: 'Critic',
  destinations: [
    RedeemDestination(
      kind: RedeemKind.liveAuction,
      category: 'AUCTION',
      title: 'Live Auction',
      subtitle: 'Bid with your points',
      imageAsset: _asset,
    ),
  ],
);

const _item = ExclusiveItem(
  id: 'e1',
  title: 'Behind the Scenes',
  category: 'FEATURETTE',
  imageAsset: _asset,
  unlockCost: 500,
  preview:
      'An hour of unseen footage from the set, with the director talking through how the '
      'final act was reshot three weeks before release.',
  castAndCrew: 'Alexandra Chen, Ben Ito, Priya Raman',
);

const _topUp = TopUpData(
  packs: [
    PointsPack(id: 'p1', points: 500, priceLabel: r'$4.99'),
    PointsPack(id: 'p2', points: 1200, priceLabel: r'$9.99'),
  ],
  selected: PointsPack(id: 'p2', points: 1200, priceLabel: r'$9.99'),
);

void main() {
  group('rewards screens meet the guidelines', () {
    testWidgets('rewards', (tester) async {
      usePhoneSurface(tester);
      final cubit = _MockRewardsCubit();
      when(() => cubit.state).thenReturn(const RewardsState.success(_summary));
      await tester.pumpApp(
        BlocProvider<RewardsCubit>.value(value: cubit, child: const RewardsView()),
      );
      await expectMeetsGuidelines(tester);
    });

    testWidgets('auction', (tester) async {
      usePhoneSurface(tester);
      final cubit = _MockAuctionCubit();
      when(() => cubit.state).thenReturn(AuctionState.success(_auction));
      await tester.pumpApp(
        BlocProvider<AuctionCubit>.value(value: cubit, child: const AuctionView()),
      );
      await expectMeetsGuidelines(tester);
    });

    testWidgets('exclusive library', (tester) async {
      usePhoneSurface(tester);
      final cubit = _MockLibraryCubit();
      when(() => cubit.state).thenReturn(
        const ExclusiveLibraryState.success(
          ExclusiveLibrary(
            filters: ['All', 'Featurettes'],
            selectedFilter: 'All',
            items: [_item],
          ),
        ),
      );
      await tester.pumpApp(
        BlocProvider<ExclusiveLibraryCubit>.value(
          value: cubit,
          child: const ExclusiveLibraryView(),
        ),
      );
      await expectMeetsGuidelines(tester);
    });

    testWidgets('unlock content', (tester) async {
      usePhoneSurface(tester);
      final cubit = _MockUnlockCubit();
      when(() => cubit.state).thenReturn(const UnlockContentState.success(_item));
      await tester.pumpApp(
        BlocProvider<UnlockContentCubit>.value(value: cubit, child: const UnlockContentView()),
      );
      await expectMeetsGuidelines(tester);
    });

    testWidgets('top-up sheet', (tester) async {
      usePhoneSurface(tester);
      final cubit = _MockTopUpCubit();
      when(() => cubit.state).thenReturn(const TopUpState.success(_topUp));
      await tester.pumpApp(
        Scaffold(
          body: BlocProvider<TopUpCubit>.value(value: cubit, child: const TopUpSheet()),
        ),
      );
      await expectMeetsGuidelines(tester);
    });
  });

  testWidgets('a bid is read as one row, and the leading one says so', (tester) async {
    usePhoneSurface(tester);
    final handle = tester.ensureSemantics();
    final cubit = _MockAuctionCubit();
    when(() => cubit.state).thenReturn(AuctionState.success(_auction));
    await tester.pumpApp(
      BlocProvider<AuctionCubit>.value(value: cubit, child: const AuctionView()),
    );

    // The design marks the standing bid in gold with a glow and nothing else,
    // so without the words it is indistinguishable from the rest.
    expect(
      find.bySemanticsLabel('Leading bid. Alexandra Chen, 2 minutes ago, 5,000 CP'),
      findsOne,
    );
    expect(find.bySemanticsLabel('Ben Ito, 9 minutes ago, 4,500 CP'), findsOne);
    // The initials disc stands in for a photograph the data does not carry.
    expect(find.bySemanticsLabel('AC'), findsNothing);
    handle.dispose();
  });

  testWidgets('a top-up pack carries its selected state, not just a border', (tester) async {
    usePhoneSurface(tester);
    final handle = tester.ensureSemantics();
    final cubit = _MockTopUpCubit();
    when(() => cubit.state).thenReturn(const TopUpState.success(_topUp));
    await tester.pumpApp(
      Scaffold(
        body: BlocProvider<TopUpCubit>.value(value: cubit, child: const TopUpSheet()),
      ),
    );

    expect(
      tester.getSemantics(find.bySemanticsLabel(r'1,200 points for $9.99')),
      isSemantics(isSelected: true, isInMutuallyExclusiveGroup: true),
    );
    expect(
      tester.getSemantics(find.bySemanticsLabel(r'500 points for $4.99')),
      isSemantics(isSelected: false),
    );
    handle.dispose();
  });

  group('nothing is cut off as text grows', () {
    for (final scale in <double>[1.5, 2]) {
      testWidgets('the unlock screen scrolls at ${scale}x', (tester) async {
        usePhoneSurface(tester);
        final cubit = _MockUnlockCubit();
        when(() => cubit.state).thenReturn(const UnlockContentState.success(_item));
        await tester.pumpApp(
          MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(scale)),
            child: BlocProvider<UnlockContentCubit>.value(
              value: cubit,
              child: const UnlockContentView(),
            ),
          ),
        );
        expect(tester.takeException(), isNull);
        expect(
          tester.state<ScrollableState>(find.byType(Scrollable)).position.maxScrollExtent,
          greaterThan(0),
        );
      });

      testWidgets('the top-up sheet scrolls at ${scale}x', (tester) async {
        usePhoneSurface(tester);
        final cubit = _MockTopUpCubit();
        when(() => cubit.state).thenReturn(const TopUpState.success(_topUp));
        await tester.pumpApp(
          MediaQuery(
            data: MediaQueryData(textScaler: TextScaler.linear(scale)),
            child: Scaffold(
              body: BlocProvider<TopUpCubit>.value(value: cubit, child: const TopUpSheet()),
            ),
          ),
        );
        expect(tester.takeException(), isNull);
        expect(find.byType(Scrollable), findsWidgets);
      });
    }
  });

  ///
  /// Every path that shows a message or swaps a screen in place, pumped with
  /// semantics on: without it these flows assert only on a real device.
  ///
  group('announcing flows survive a semantics update', () {
    testWidgets('a bid under the floor', (tester) async {
      usePhoneSurface(tester);
      final handle = tester.ensureSemantics();
      final cubit = _MockAuctionCubit();
      when(() => cubit.state).thenReturn(AuctionState.success(_auction));
      when(() => cubit.placeBid(any())).thenAnswer((_) async {});
      await tester.pumpApp(
        BlocProvider<AuctionCubit>.value(value: cubit, child: const AuctionView()),
      );

      await tester.enterText(find.byType(TextField), '10');
      await tester.tap(find.text('BID'));
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('a bid over the balance', (tester) async {
      usePhoneSurface(tester);
      final handle = tester.ensureSemantics();
      final cubit = _MockAuctionCubit();
      when(() => cubit.state).thenReturn(AuctionState.success(_auction));
      when(() => cubit.placeBid(any())).thenAnswer((_) async {});
      await tester.pumpApp(
        BlocProvider<AuctionCubit>.value(value: cubit, child: const AuctionView()),
      );

      await tester.enterText(find.byType(TextField), '999999');
      await tester.tap(find.text('BID'));
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('a bid that lands', (tester) async {
      usePhoneSurface(tester);
      final handle = tester.ensureSemantics();
      final cubit = _MockAuctionCubit();
      when(() => cubit.state).thenReturn(AuctionState.success(_auction));
      when(() => cubit.placeBid(any())).thenAnswer((_) async {});
      await tester.pumpApp(
        BlocProvider<AuctionCubit>.value(value: cubit, child: const AuctionView()),
      );

      await tester.tap(find.text('BID'));
      await pumpAnnouncement(tester);

      expect(find.byType(SnackBar), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('the top-up receipt, which replaces the picker in place', (tester) async {
      usePhoneSurface(tester);
      final handle = tester.ensureSemantics();
      final cubit = _MockTopUpCubit();
      when(() => cubit.state).thenReturn(
        const TopUpState.success(
          TopUpData(
            packs: [PointsPack(id: 'p1', points: 500, priceLabel: r'$4.99')],
            selected: PointsPack(id: 'p1', points: 500, priceLabel: r'$4.99'),
            purchased: true,
          ),
        ),
      );
      await tester.pumpApp(
        Scaffold(
          body: BlocProvider<TopUpCubit>.value(value: cubit, child: const TopUpSheet()),
        ),
      );
      await pumpAnnouncement(tester);

      expect(find.text('Payment Successful'), findsOne);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });

    testWidgets('the loading and failure screens', (tester) async {
      usePhoneSurface(tester);
      final handle = tester.ensureSemantics();
      final cubit = _MockAuctionCubit();

      when(() => cubit.state).thenReturn(const AuctionState.loading());
      await tester.pumpApp(
        BlocProvider<AuctionCubit>.value(value: cubit, child: const AuctionView()),
      );
      await pumpAnnouncement(tester);
      expect(tester.takeException(), isNull);

      when(() => cubit.state).thenReturn(const AuctionState.failure(NetworkException()));
      await tester.pumpApp(
        BlocProvider<AuctionCubit>.value(value: cubit, child: const AuctionView()),
      );
      await pumpAnnouncement(tester);
      expect(tester.takeException(), isNull);
      handle.dispose();
    });
  });

  ///
  /// A viewport clips its child and the unlock CTA's glow paints outside its
  /// box, so a screen that scrolls needlessly cuts the glow off.
  ///
  testWidgets('the unlock screen does not scroll when its content fits', (tester) async {
    usePhoneSurface(tester);
    final cubit = _MockUnlockCubit();
    when(() => cubit.state).thenReturn(const UnlockContentState.success(_item));
    await tester.pumpApp(
      BlocProvider<UnlockContentCubit>.value(value: cubit, child: const UnlockContentView()),
    );

    expect(
      tester.state<ScrollableState>(find.byType(Scrollable)).position.maxScrollExtent,
      isZero,
    );
  });

  testWidgets('neither sheet scrolls when its content fits', (tester) async {
    usePhoneSurface(tester);
    final cubit = _MockTopUpCubit();
    when(() => cubit.state).thenReturn(const TopUpState.success(_topUp));
    await tester.pumpApp(
      Scaffold(
        body: BlocProvider<TopUpCubit>.value(value: cubit, child: const TopUpSheet()),
      ),
    );

    expect(
      tester.state<ScrollableState>(find.byType(Scrollable)).position.maxScrollExtent,
      isZero,
    );
  });
}
