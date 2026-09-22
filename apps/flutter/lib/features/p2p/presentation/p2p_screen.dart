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
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/header_block.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/redeem_card.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/p2p/data/models/p2p_overview.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_cubit.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_state.dart';
import 'package:matinee/features/p2p/presentation/widgets/stat_row_card.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';

class P2pScreen extends StatelessWidget {
  const P2pScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = P2pCubit(getIt<P2pRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const P2pView(),
    );
  }
}

@visibleForTesting
class P2pView extends StatelessWidget {
  const P2pView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      // No SafeArea around the body: the header's fade runs from the screen
      // top and takes the status bar inset itself.
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<P2pCubit, P2pState>(
          builder: (context, state) => switch (state) {
            P2pInitial() => const SizedBox.shrink(),
            P2pLoading() => const LoadingView(),
            P2pFailure(:final error) => SafeArea(
              bottom: false,
              child: ErrorView(
                message: error.localizedMessage(l10n),
                onRetry: () => unawaited(context.read<P2pCubit>().load()),
              ),
            ),
            P2pSuccess(:final overview) => _Body(overview: overview),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.overview});

  final P2pOverview overview;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: HeaderBlock(child: _Header(overview: overview)),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
              child: SectionLabel(label: l10n.p2pGamesSection),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          // A list, so a screen reader says which game of how many rather than
          // reading three unrelated buttons.
          sliver: SliverSemantics(
            role: SemanticsRole.list,
            sliver: SliverList.list(
              children: [
                for (final game in overview.games)
                  Padding(
                    padding: const EdgeInsets.only(bottom: AppSpacing.md),
                    child: Semantics(
                      role: SemanticsRole.listItem,
                      child: RedeemCard(
                        category: game.category,
                        title: game.title,
                        subtitle: game.subtitle,
                        imageAsset: game.imageAsset,
                        onTap: () => unawaited(_route(game.kind).push<void>(context)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(height: context.bottomInset(AppSpacing.xxxl)),
        ),
      ],
    );
  }

  ///
  /// Pushed rather than gone to: each game is a detail screen the tab is still
  /// underneath, so the platform back gesture has to return here.
  ///
  GoRouteData _route(P2pGameKind kind) {
    return switch (kind) {
      P2pGameKind.weeklyQuests => const WeeklyQuestsRoute(),
      P2pGameKind.dailyStreaks => const DailyStreakRoute(),
      P2pGameKind.predictionGames => const PredictionGamesRoute(),
    };
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.overview});

  final P2pOverview overview;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final format = context.decimalFormat;
    final standing = overview.standing;
    final rank = format.format(overview.rank);
    final streakPoints = format.format(overview.streakPoints);
    final earned = format.format(standing.pointsIntoBadge);
    final span = format.format(standing.badgeSpan);
    final toNext = format.format(standing.pointsToNextBadge);
    final totalPoints = format.format(standing.totalPoints);
    return StatRowCard(
      rank: l10n.p2pRankValue(rank),
      rankLabel: l10n.p2pRankLabel,
      rankCaption: l10n.p2pRankGain(overview.rankGainThisWeek),
      rankSummary: l10n.p2pRankSummary(rank, overview.rankGainThisWeek),
      streak: streakPoints,
      streakLabel: l10n.p2pStreakLabel,
      streakCaption: l10n.p2pBestStreak(overview.bestStreakDays),
      streakSummary: l10n.p2pStreakSummary(streakPoints, overview.bestStreakDays),
      points: totalPoints,
      pointsLabel: l10n.p2pPointsLabel,
      pointsUnit: l10n.p2pPointsUnit,
      pointsSummary: l10n.p2pPointsSummary(totalPoints),
      badgeName: standing.badgeName,
      badgeProgressLabel: l10n.p2pBadgeProgress(earned, span),
      badgeProgress: standing.progressToNextBadge,
      // The top rung has nothing above it, so '0 pts to Visionary' under a
      // badge already named Visionary is not what it says.
      badgeCaption: standing.isTopBadge ? l10n.p2pTopBadge : l10n.p2pNextBadge(toNext, standing.nextBadgeName),
      badgeSummary: l10n.p2pBadgeSummary(
        standing.badgeName,
        earned,
        span,
        toNext,
        standing.nextBadgeName,
      ),
    );
  }
}
