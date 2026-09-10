import 'package:bloc_test/bloc_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/presentation/auction_screen.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_state.dart';
import 'package:matinee/features/rewards/presentation/widgets/bid_history_row.dart';
import 'package:mocktail/mocktail.dart';

import '../../../helpers/helpers.dart';

class _MockAuctionCubit extends MockCubit<AuctionState> implements AuctionCubit {}

void main() {
  group(AuctionView, () {
    late AuctionCubit cubit;

    AuctionBoard boardWith({int currentBid = 10500}) {
      final now = DateTime.now();
      return AuctionBoard(
        pointsBalance: 7082,
        auction: Auction(
          id: 'auction-1',
          title: 'Exclusive Premiere Pass',
          description: 'A gala pass.',
          imageAsset: 'assets/images/auction-hero.jpg',
          currentBid: currentBid,
          minimumIncrement: 100,
          watching: 1204,
          endsAt: now.add(const Duration(hours: 2)),
          bids: [
            AuctionBid(
              bidderName: 'Alex R.',
              amount: currentBid,
              placedAt: now.subtract(const Duration(minutes: 2)),
              isLeading: true,
            ),
            AuctionBid(
              bidderName: 'Sarah Johnson',
              amount: currentBid - 500,
              placedAt: now.subtract(const Duration(minutes: 5)),
            ),
          ],
          quickIncrements: const [500, 1000],
        ),
      );
    }

    setUp(() {
      cubit = _MockAuctionCubit();
      when(() => cubit.placeBid(any())).thenAnswer((_) async {});
    });

    Future<void> pumpView(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(
        BlocProvider<AuctionCubit>.value(value: cubit, child: const AuctionView()),
      );
    }

    group('renders', () {
      testWidgets('the lot, the balance and the leading bid', (tester) async {
        when(() => cubit.state).thenReturn(AuctionState.success(boardWith()));
        await pumpView(tester);

        expect(find.text('Exclusive Premiere Pass'), findsOneWidget);
        expect(find.text('7,082'), findsOneWidget);
        expect(find.text('1,204 watching'), findsOneWidget);
        // Only the leading row is above the bid bar; the rest scroll under it.
        expect(find.byType(BidHistoryRow), findsWidgets);
        expect(find.text('Alex R.'), findsOneWidget);
      });

      testWidgets('the field opening above the standing bid', (tester) async {
        when(() => cubit.state).thenReturn(AuctionState.success(boardWith()));
        await pumpView(tester);

        expect(find.text('10600'), findsOneWidget);
      });
    });

    group('calls placeBid', () {
      testWidgets('with the amount in the field', (tester) async {
        when(() => cubit.state).thenReturn(AuctionState.success(boardWith()));
        await pumpView(tester);

        await tester.tap(find.text('BID'));
        await tester.pump();

        verify(() => cubit.placeBid(10600)).called(1);
      });

      testWidgets('never for a bid under the standing one', (tester) async {
        when(() => cubit.state).thenReturn(AuctionState.success(boardWith()));
        await pumpView(tester);

        await tester.enterText(find.byType(TextField), '9000');
        await tester.tap(find.text('BID'));
        await tester.pump();

        verifyNever(() => cubit.placeBid(any()));
        expect(find.text('Bids start at 10,600 CP.'), findsOneWidget);
      });

      testWidgets('never for a raise smaller than the lot accepts', (tester) async {
        // 10,501 beats the standing bid but misses the 100 minimum raise, so
        // it would only be refused by the server.
        when(() => cubit.state).thenReturn(AuctionState.success(boardWith()));
        await pumpView(tester);

        await tester.enterText(find.byType(TextField), '10501');
        await tester.tap(find.text('BID'));
        await tester.pump();

        verifyNever(() => cubit.placeBid(any()));
        expect(find.text('Bids start at 10,600 CP.'), findsOneWidget);
      });
    });
  });
}
