import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_state.dart';
import 'package:matinee/features/rewards/presentation/top_up_sheet.dart';
import 'package:matinee/features/rewards/presentation/widgets/auction_stat_card.dart';
import 'package:matinee/features/rewards/presentation/widgets/bid_bar.dart';
import 'package:matinee/features/rewards/presentation/widgets/bid_history_row.dart';
import 'package:matinee/features/rewards/presentation/widgets/live_badge.dart';
import 'package:matinee/features/rewards/presentation/widgets/points_pill.dart';

class AuctionScreen extends StatelessWidget {
  const AuctionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = AuctionCubit(getIt<RewardsRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const AuctionView(),
    );
  }
}

@visibleForTesting
class AuctionView extends StatelessWidget {
  const AuctionView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<AuctionCubit, AuctionState>(
          builder: (context, state) => switch (state) {
            AuctionInitial() => const SizedBox.shrink(),
            AuctionLoading() => const LoadingView(),
            AuctionFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<AuctionCubit>().load()),
            ),
            AuctionSuccess(:final board) => _Body(board: board),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.board});

  final AuctionBoard board;

  Auction get auction => board.auction;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Column(
      children: [
        Expanded(
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _Hero(board: board)),
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
                sliver: SliverList.list(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.lg),
                      child: IntrinsicHeight(
                        child: Row(
                          spacing: AppSpacing.md,
                          children: [
                            Expanded(
                              child: AuctionStatCard(
                                label: l10n.auctionCurrentBid,
                                value: l10n.auctionBidAmount(auction.currentBid),
                              ),
                            ),
                            Expanded(
                              child: AuctionCountdownCard(
                                label: l10n.auctionTimeRemaining,
                                endsAt: auction.endsAt,
                                endedLabel: l10n.auctionEnded,
                                // To the minute, so it is not re-read every
                                // second; the last one is worded, not rounded.
                                spokenRemaining: (remaining) => switch (remaining) {
                                  Duration(inMinutes: < 1) => l10n.auctionTimeRemainingUnderMinute,
                                  Duration(inHours: 0, inMinutes: final minutes) => l10n.auctionTimeRemainingMinutes(
                                    minutes,
                                  ),
                                  Duration(inHours: final hours, inMinutes: final minutes) =>
                                    l10n.auctionTimeRemainingValue(hours, minutes % 60),
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: SectionLabel(label: l10n.auctionBidHistory),
                    ),
                    for (final bid in auction.bids)
                      Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.sm),
                        child: BidHistoryRow(
                          bidderName: bid.bidderName,
                          placedAt: _relative(context, bid.placedAt),
                          amount: l10n.auctionBidAmount(bid.amount),
                          isLeading: bid.isLeading,
                          summaryLabel: l10n.auctionBidSummary(
                            bid.bidderName,
                            _relative(context, bid.placedAt),
                            l10n.auctionBidAmount(bid.amount),
                          ),
                          leadingLabel: l10n.auctionLeadingBid,
                        ),
                      ),
                  ],
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: AppSpacing.lg)),
            ],
          ),
        ),
        BidBar(
          openingBid: auction.currentBid + auction.minimumIncrement,
          increments: auction.quickIncrements,
          fieldLabel: l10n.auctionBidFieldLabel,
          actionLabel: l10n.auctionBidAction,
          // The design writes these bare, without a thousands separator.
          incrementLabel: (amount) => l10n.auctionBidIncrement(amount.toString()),
          incrementSemanticLabel: (amount) => l10n.auctionBidRaise(l10n.auctionBidIncrement(amount.toString())),
          onBid: (amount) => unawaited(_bid(context, amount)),
        ),
      ],
    );
  }

  ///
  /// Refuses a bid under the smallest raise or over the balance rather than
  /// sending it; the server checks again, so this is the message, not the rule.
  ///
  Future<void> _bid(BuildContext context, int amount) async {
    final l10n = context.l10n;
    final messenger = ScaffoldMessenger.of(context);
    final cubit = context.read<AuctionCubit>();
    final floor = auction.currentBid + auction.minimumIncrement;
    if (amount < floor) {
      messenger.showSnackBar(SnackBar(content: Text(l10n.auctionBidTooLow(floor))));
      return;
    }
    if (amount > board.pointsBalance) {
      messenger.showSnackBar(
        SnackBar(content: Text(l10n.auctionBidOverBalance(board.pointsBalance))),
      );
      return;
    }
    await cubit.placeBid(amount);
    if (cubit.state is AuctionSuccess) {
      messenger.showSnackBar(SnackBar(content: Text(l10n.auctionBidPlaced)));
    }
  }

  ///
  /// The design writes bid times as '2 minutes ago'. Flutter's localisations
  /// carry no relative formatter, so the coarse units are spelled out here.
  ///
  static String _relative(BuildContext context, DateTime moment) {
    final elapsed = DateTime.now().difference(moment);
    final l10n = context.l10n;
    return switch (elapsed) {
      Duration(inHours: >= 24) => MaterialLocalizations.of(context).formatShortDate(moment),
      Duration(inHours: final hours, inMinutes: >= 60) => l10n.auctionBidHoursAgo(hours),
      Duration(inMinutes: final minutes) when minutes >= 1 => l10n.auctionBidMinutesAgo(minutes),
      _ => l10n.auctionBidJustNow,
    };
  }
}

///
/// The still at the top, with the back button, the balance and the blurb over
/// it. The copy runs down into the image, so the still fills behind it all.
///
class _Hero extends StatelessWidget {
  const _Hero({required this.board});

  /// The frame's still: 375x229 on an 812 frame.
  static const double _imageHeight = 229;

  ///
  /// Where the frame starts the LIVE row, two thirds down the still. Measured
  /// from the screen top: off the bar, it would shift with the device's inset.
  ///
  static const double _copyTop = 149;

  final AuctionBoard board;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return Stack(
      children: [
        // The frame draws the still 229 tall with the copy over its lower half,
        // so it is pinned to that height, not to what the copy grows to.
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          height: _imageHeight,
          // A DecorationImage contributes nothing to the semantics tree, and
          // this is the only picture of the lot, so it is named here.
          child: Semantics(
            image: true,
            // The lot's own description would beat one built from its title,
            // but the data carries none yet.
            label: l10n.auctionLotImage(board.auction.title),
            // A Container, not a DecoratedBox: the scrim is a second layer over
            // the still, which only foregroundDecoration paints.
            child: Container(
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: AssetImage(board.auction.imageAsset),
                  fit: BoxFit.cover,
                ),
              ),
              foregroundDecoration: BoxDecoration(gradient: colors.overlay.auctionHero),
            ),
          ),
        ),
        // The copy is the child that sizes the stack; the bar floats over the
        // still above it.
        Padding(
          padding: const EdgeInsets.only(
            top: _copyTop,
            left: AppScreenPadding.main,
            right: AppScreenPadding.main,
            // The View More button keeps a 48 tap target around a 24-tall
            // label, so the gap under it is trimmed by what that adds.
            bottom: AppSpacing.xs,
          ),
          child: _Headline(auction: board.auction),
        ),
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
              child: Row(
                children: [
                  BackDiscButton(
                    tooltip: l10n.auctionBack,
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const Spacer(),
                  PointsPill(
                    tooltip: l10n.rewardsPointsPillTooltip,
                    value: context.decimalFormat.format(board.pointsBalance),
                    unit: l10n.rewardsPointsUnit.toUpperCase(),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  PointsPill.topUp(
                    tooltip: l10n.topUpTooltip,
                    onTap: () => unawaited(_topUp(context)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  ///
  /// A purchase changes the balance the header shows, and the sheet can be
  /// swiped away without a result, so the board is fetched again either way.
  ///
  static Future<void> _topUp(BuildContext context) async {
    final cubit = context.read<AuctionCubit>();
    await showTopUpSheet(context);
    await cubit.load();
  }
}

///
/// The LIVE row, the eyebrow, the title and the blurb. The frame clamps the
/// blurb to two lines with a View More under it, so the control expands it.
///
class _Headline extends StatefulWidget {
  const _Headline({required this.auction});

  /// What the frame shows before View More is tapped.
  static const int collapsedLines = 2;

  final Auction auction;

  @override
  State<_Headline> createState() => _HeadlineState();
}

class _HeadlineState extends State<_Headline> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          spacing: AppSpacing.sm,
          children: [
            LiveBadge(label: l10n.auctionLiveBadge),
            Text(
              l10n.auctionWatching(widget.auction.watching),
              style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xxl),
          child: SectionLabel(label: l10n.auctionEyebrow),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.sm),
          child: ScreenTitle(
            label: widget.auction.title,
            child: Text(
              widget.auction.title,
              style: theme.textTheme.headlineMedium?.copyWith(color: colors.text.primary),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            widget.auction.description,
            maxLines: _expanded ? null : _Headline.collapsedLines,
            overflow: _expanded ? null : TextOverflow.ellipsis,
            style: theme.textTheme.bodySmall?.copyWith(color: colors.text.secondary),
          ),
        ),
        // No padding above: the 48 tap target around the button's 24-tall label
        // already supplies the gap the frame draws.
        TextButton(
          onPressed: () => setState(() => _expanded = !_expanded),
          style: TextButton.styleFrom(padding: EdgeInsets.zero),
          // Inside the button, not around it: a button's node is a boundary, so
          // an annotation above it makes a second, unlabelled node.
          child: Semantics(
            expanded: _expanded,
            child: Text(
              _expanded ? l10n.auctionViewLess : l10n.auctionViewMore,
              // The frame underlines this one control, so the rule is added to
              // the button's own text rather than kept as a style.
              style: theme.textTheme.labelMedium?.copyWith(
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
