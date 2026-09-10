import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/header_block.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/points_header.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/earns/data/earns_repository.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/data/models/earned_badge.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_cubit.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_state.dart';
import 'package:matinee/features/earns/presentation/widgets/badge_filter_tabs.dart';
import 'package:matinee/features/earns/presentation/widgets/badge_tile.dart';
import 'package:matinee/features/earns/presentation/widgets/current_badge_card.dart';
import 'package:matinee/features/earns/presentation/widgets/earn_row.dart';
import 'package:matinee/features/earns/presentation/widgets/earns_segment_control.dart';
import 'package:matinee/l10n/gen/app_localizations.dart';
import 'package:matinee/shared/points/data/points_repository.dart';

/// The design's badge grid: two columns with a 12 gutter.
const int _badgeColumns = 2;

/// The one bar the design draws at 3 and leaves square, edge to edge.
const double _headerBarHeight = 3;

class EarnsScreen extends StatelessWidget {
  const EarnsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = EarnsCubit(getIt<EarnsRepository>(), getIt<PointsRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const EarnsView(),
    );
  }
}

@visibleForTesting
class EarnsView extends StatefulWidget {
  const EarnsView({super.key});

  @override
  State<EarnsView> createState() => _EarnsViewState();
}

class _EarnsViewState extends State<EarnsView> {
  ///
  /// Which segment and which badge filter are on screen. Neither refetches, so
  /// both stay here rather than in the cubit.
  ///
  EarnsSegment _segment = EarnsSegment.earns;
  bool _showEarned = true;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      // No SafeArea around the body: the header's fade runs from the screen
      // top and takes the status bar inset itself.
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<EarnsCubit, EarnsState>(
          builder: (context, state) => switch (state) {
            EarnsInitial() => const SizedBox.shrink(),
            EarnsLoading() => const LoadingView(),
            EarnsFailure(:final error) => SafeArea(
              bottom: false,
              child: ErrorView(
                message: error.localizedMessage(l10n),
                onRetry: () => unawaited(context.read<EarnsCubit>().load()),
              ),
            ),
            EarnsSuccess(:final overview) => _Body(
              overview: overview,
              segment: _segment,
              showEarned: _showEarned,
              onSegment: (segment) => setState(() => _segment = segment),
              onFilter: (earned) => setState(() => _showEarned = earned),
            ),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({
    required this.overview,
    required this.segment,
    required this.showEarned,
    required this.onSegment,
    required this.onFilter,
  });

  final EarnsOverview overview;
  final EarnsSegment segment;
  final bool showEarned;
  final ValueChanged<EarnsSegment> onSegment;
  final ValueChanged<bool> onFilter;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: _Header(overview: overview, segment: segment, onSegment: onSegment),
        ),
        // The region the segmented control switches. A SliverSemantics, not a
        // box one: wrapping the list in a box would collapse it and take the
        // per-row indexes a screen reader counts with.
        SliverSemantics(
          role: SemanticsRole.tabPanel,
          sliver: SliverPadding(
            padding: const EdgeInsets.only(
              left: AppScreenPadding.main,
              right: AppScreenPadding.main,
              top: AppSpacing.lg,
            ),
            sliver: SliverList.list(
              children: switch (segment) {
                EarnsSegment.earns => _earns(context),
                EarnsSegment.badges => _badges(context),
              },
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(height: context.bottomInset(AppSpacing.xxxl)),
        ),
      ],
    );
  }

  List<Widget> _earns(BuildContext context) {
    final l10n = context.l10n;
    return [
      for (final source in overview.sources)
        Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.cardGap),
          child: EarnRow(
            kind: source.kind,
            title: source.title,
            activity: source.activity,
            points: context.decimalFormat.format(source.points),
            share: overview.shareOf(source),
            shareCaption: l10n.earnsShareCaption(l10n.rewardsPointsUnit, overview.shareOf(source)),
            semanticLabel: l10n.earnsRowSummary(
              source.title,
              context.decimalFormat.format(source.points),
              l10n.rewardsPointsUnit,
              overview.shareOf(source),
              source.activity,
            ),
            openHint: l10n.earnsRowOpen,
            // Pushed, not gone to: these are detail screens the user comes
            // back from, so the platform back gesture has to return here.
            onTap: () => unawaited(_historyRoute(source.kind).push<void>(context)),
          ),
        ),
    ];
  }

  /// Where a row's history lives, one screen per source.
  static GoRouteData _historyRoute(EarnSourceKind kind) {
    return switch (kind) {
      EarnSourceKind.dailyStreaks => const StreakHistoryRoute(),
      EarnSourceKind.auctionWins => const AuctionWinsRoute(),
      EarnSourceKind.predictionGames => const PredictionHistoryRoute(),
      EarnSourceKind.weeklyQuests => const QuestHistoryRoute(),
    };
  }

  List<Widget> _badges(BuildContext context) {
    final l10n = context.l10n;
    final standing = overview.standing;
    final shown = overview.badgesWhere(earned: showEarned);
    final nextBadge = l10n.rewardsNextBadge(standing.pointsToNextBadge, standing.nextBadgeName);
    return [
      CurrentBadgeCard(
        eyebrow: l10n.earnsCurrentBadge,
        badgeName: standing.badgeName,
        progress: standing.progressToNextBadge,
        caption: nextBadge,
        semanticLabel: l10n.earnsCurrentBadgeSummary(standing.badgeName, nextBadge),
      ),
      Padding(
        padding: const EdgeInsets.only(top: AppSpacing.lg, bottom: AppSpacing.lg),
        child: SectionLabel(label: l10n.earnsAllBadges),
      ),
      BadgeFilterTabs(
        earnedLabel: l10n.earnsFilterEarned,
        lockedLabel: l10n.earnsFilterLocked,
        showEarned: showEarned,
        onChanged: onFilter,
      ),
      // The region the Earned / Locked pills switch, nested inside the
      // segment's own panel.
      Semantics(
        role: SemanticsRole.tabPanel,
        container: true,
        explicitChildNodes: true,
        child: Padding(
          padding: const EdgeInsets.only(top: AppSpacing.lg),
          child: shown.isEmpty
              // A status, so choosing a filter that holds nothing is announced
              // rather than leaving the panel silently empty.
              ? Semantics(
                  role: SemanticsRole.status,
                  child: Text(
                    showEarned ? l10n.earnsNoEarnedBadges : l10n.earnsNoLockedBadges,
                    style: AppTextStyle.caption.copyWith(color: context.appColors.text.muted),
                  ),
                )
              : _BadgeGrid(badges: shown),
        ),
      ),
    ];
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.overview, required this.segment, required this.onSegment});

  final EarnsOverview overview;
  final EarnsSegment segment;
  final ValueChanged<EarnsSegment> onSegment;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final standing = overview.standing;
    final top = _TopRow(segment: segment, onSegment: onSegment);
    // Only the badges segment carries the balance; the earns segment is the
    // title row alone, as the design draws it.
    if (segment == EarnsSegment.earns) {
      // Four, not the block's default eight: the back disc's 48 tap target
      // already holds 6 above its 36 disc, which is the rest of the gap.
      return HeaderBlock(topPadding: AppSpacing.xs, child: top);
    }
    return PointsHeader(
      top: top,
      totalPointsLabel: l10n.rewardsTotalPoints,
      totalPoints: context.decimalFormat.format(standing.totalPoints),
      pointsUnit: l10n.rewardsPointsUnit,
      badgeLabel: l10n.rewardsBadgeLabel,
      badgeName: standing.badgeName,
      nextBadgeCaption: l10n.rewardsNextBadge(standing.pointsToNextBadge, standing.nextBadgeName),
      balanceSummary: l10n.rewardsBalanceSummary(
        l10n.rewardsTotalPoints,
        context.decimalFormat.format(standing.totalPoints),
        l10n.rewardsPointsUnit,
      ),
      badgeSummary: l10n.rewardsBadgeSummary(
        l10n.rewardsBadgeLabel,
        standing.badgeName,
        l10n.rewardsNextBadge(standing.pointsToNextBadge, standing.nextBadgeName),
      ),
      bottom: ProgressBar(
        value: standing.progressToNextBadge,
        height: _headerBarHeight,
        isSquare: true,
      ),
    );
  }
}

class _TopRow extends StatelessWidget {
  const _TopRow({required this.segment, required this.onSegment});

  final EarnsSegment segment;
  final ValueChanged<EarnsSegment> onSegment;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    // A Wrap, not a Row: at a large text scale the segmented control alone is
    // wider than the header, so it drops below the title instead of clipping.
    return Wrap(
      alignment: WrapAlignment.spaceBetween,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        // No gap of its own: the disc's trailing overhang is the 12 the frame
        // leaves between it and the title.
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            BackDiscButton(
              tooltip: l10n.earnsBack,
              onPressed: () => Navigator.of(context).pop(),
            ),
            ScreenTitle(
              label: l10n.earnsTitle,
              child: Text(
                l10n.earnsTitle,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: context.appColors.text.primary,
                ),
              ),
            ),
          ],
        ),
        EarnsSegmentControl(
          earnsLabel: l10n.earnsSegmentEarns,
          badgesLabel: l10n.earnsSegmentBadges,
          selected: segment,
          onSelected: onSegment,
        ),
      ],
    );
  }
}

///
/// The two-column grid. Rows are laid out by hand rather than with a
/// GridView: the tiles have no fixed aspect, so a scaled-up label has to grow
/// its row, and both tiles in a row have to grow with it.
///
class _BadgeGrid extends StatelessWidget {
  const _BadgeGrid({required this.badges});

  final List<EarnedBadge> badges;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Semantics(
      // A list, so the tiles under it are items with a position rather than
      // four unrelated readings. Its children say so with `listItem`.
      role: SemanticsRole.list,
      container: true,
      explicitChildNodes: true,
      child: Column(
        spacing: AppSpacing.cardGap,
        children: [
          for (var start = 0; start < badges.length; start += _badgeColumns)
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: AppSpacing.cardGap,
                children: [
                  for (var column = 0; column < _badgeColumns; column++)
                    Expanded(
                      // The last row can be short, and an empty cell keeps the
                      // tile beside it at a column's width rather than doubling.
                      child: start + column < badges.length
                          ? _Tile(badge: badges[start + column], l10n: l10n)
                          : const SizedBox.shrink(),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.badge, required this.l10n});

  final EarnedBadge badge;
  final AppLocalizations l10n;

  @override
  Widget build(BuildContext context) {
    return BadgeTile(
      name: badge.name,
      requirement: badge.requirement,
      status: badge.status,
      semanticLabel: switch (badge.status) {
        BadgeStatus.earned => l10n.earnsBadgeEarnedSummary(badge.name, badge.requirement),
        BadgeStatus.current => l10n.earnsBadgeCurrentSummary(badge.name, badge.requirement),
        BadgeStatus.locked => l10n.earnsBadgeLockedSummary(badge.name, badge.requirement),
      },
    );
  }
}
