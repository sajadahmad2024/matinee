import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/rewards/data/models/rewards_summary.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_state.dart';
import 'package:matinee/features/rewards/presentation/widgets/points_header.dart';
import 'package:matinee/features/rewards/presentation/widgets/redeem_card.dart';

class RewardsScreen extends StatelessWidget {
  const RewardsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = RewardsCubit(getIt<RewardsRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const RewardsView(),
    );
  }
}

@visibleForTesting
class RewardsView extends StatelessWidget {
  const RewardsView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      // No SafeArea around the body: the header block's fade runs from the
      // screen top, so it takes the status bar inset itself. Only the states
      // that render without it need one.
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<RewardsCubit, RewardsState>(
          builder: (context, state) => switch (state) {
            RewardsInitial() => const SizedBox.shrink(),
            RewardsLoading() => const Center(child: CircularProgressIndicator()),
            RewardsFailure(:final error) => SafeArea(
              bottom: false,
              child: ErrorView(
                message: error.localizedMessage(l10n),
                onRetry: () => unawaited(context.read<RewardsCubit>().load()),
              ),
            ),
            RewardsSuccess(:final summary) => _Body(summary: summary),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.summary});

  final RewardsSummary summary;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: PointsHeader(
            totalPointsLabel: l10n.rewardsTotalPoints,
            totalPoints: context.decimalFormat.format(summary.totalPoints),
            pointsUnit: l10n.rewardsPointsUnit,
            badgeLabel: l10n.rewardsBadgeLabel,
            badgeName: summary.badgeName,
            nextBadgeCaption: l10n.rewardsNextBadge(
              summary.pointsToNextBadge,
              summary.nextBadgeName,
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: SliverList.list(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                child: SectionLabel(label: l10n.rewardsRedeemSection),
              ),
              for (final destination in summary.destinations)
                Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: RedeemCard(
                    category: destination.category,
                    title: destination.title,
                    subtitle: destination.subtitle,
                    imageAsset: destination.imageAsset,
                    onTap: () => _open(context, destination.kind),
                  ),
                ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(height: context.bottomInset(AppSpacing.xxxl)),
        ),
      ],
    );
  }

  ///
  /// Pushed rather than gone to: both are detail screens the tab is still
  /// underneath, so the platform back gesture has to return here.
  ///
  void _open(BuildContext context, RedeemKind kind) {
    switch (kind) {
      case RedeemKind.liveAuction:
        unawaited(const AuctionRoute().push<void>(context));
      case RedeemKind.exclusiveContent:
        unawaited(const ExclusiveLibraryRoute().push<void>(context));
    }
  }
}
