import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hls_video_player/reels.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/config/share_links.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/points_pill.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/reels_repository.dart';
import 'package:matinee/features/reels/domain/feed_reel.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_feed_cubit.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_feed_state.dart';
import 'package:matinee/features/reels/presentation/widgets/points_earned_sheet.dart';
import 'package:matinee/features/reels/presentation/widgets/reel_action_rail.dart';
import 'package:matinee/features/reels/presentation/widgets/reel_meta.dart';
import 'package:matinee/features/reels/presentation/widgets/unlock_overlay.dart';
import 'package:matinee/features/reels/presentation/widgets/unlock_premium_sheet.dart';
import 'package:share_plus/share_plus.dart';

///
/// The reels screen on the host-controlled `ReelFeed` API.
///
class ReelsScreen extends StatelessWidget {
  const ReelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = ReelsFeedCubit(getIt<ReelsRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const ReelsView(),
    );
  }
}

@visibleForTesting
class ReelsView extends StatelessWidget {
  const ReelsView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      body: BlocBuilder<ReelsFeedCubit, ReelsFeedState>(
        builder: (context, state) => switch (state) {
          ReelsFeedInitial() => const SizedBox.shrink(),
          ReelsFeedLoading() => const SafeArea(child: LoadingView()),
          ReelsFeedFailure(:final error) => SafeArea(
            child: ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<ReelsFeedCubit>().load()),
            ),
          ),
          ReelsFeedSuccess(:final feed, :final pointsBalance) => _Feed(feed: feed, pointsBalance: pointsBalance),
        },
      ),
    );
  }
}

class _Feed extends StatelessWidget {
  const _Feed({required this.feed, required this.pointsBalance});

  final List<FeedReel> feed;
  final int pointsBalance;

  // Sample values until sharing and levels have a points API.
  static const int _shareRewardPoints = 50;
  static const int _levelTargetPoints = 1000;

  ///
  /// Opens the system share sheet, and once it closes shows what the share paid.
  ///
  Future<void> _share(BuildContext context, Reel reel) async {
    final box = context.findRenderObject() as RenderBox?;
    final link = AppShareLinks.reel(reel.id).toString();
    await SharePlus.instance.share(
      ShareParams(
        text: context.l10n.reelsShareMessage(reel.title, link),
        subject: reel.title,
        // iPad anchors its share popover here; phones ignore it.
        sharePositionOrigin: box == null ? null : box.localToGlobal(Offset.zero) & box.size,
      ),
    );
    if (!context.mounted) {
      return;
    }
    final subscribe = await showPointsEarnedSheet(
      context,
      earnedPoints: _shareRewardPoints,
      balance: pointsBalance,
      levelTarget: _levelTargetPoints,
    );
    if (subscribe && context.mounted) {
      await showUnlockPremiumSheet(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return ReelFeed<FeedReel>(
      items: feed,
      style: ReelStyle(scrim: context.appColors.overlay.hero, fit: BoxFit.cover),
      labels: ReelLabels(
        togglePlay: l10n.reelsTogglePlayAction,
        play: l10n.reelsPlayAction,
        pause: l10n.reelsPauseAction,
        mute: l10n.reelsMuteAction,
        unmute: l10n.reelsUnmuteAction,
        fullscreen: l10n.reelsFullscreenAction,
        exitFullscreen: l10n.reelsExitFullscreenAction,
        retry: l10n.retry,
        seek: l10n.reelsSeekAction,
      ),
      header: (context, current) => _Header(
        pointsBalance: pointsBalance,
        // Hidden while the current reel's curtain covers the screen.
        showPoints: !(current?.isLocked ?? false),
      ),
      itemBuilder: (context, slot) => ReelItem<FeedReel>(
        overlay: (context, slot) => _RailAndMeta(slot: slot, onShare: () => unawaited(_share(context, slot.data.reel))),
        curtain: (context, slot) => _Curtain(
          slot: slot,
          onUnlock: () => unawaited(context.read<ReelsFeedCubit>().unlock(slot.id)),
        ),
        fullscreenIcon: (context, slot, state) => const Icon(Icons.screen_rotation_rounded, size: AppIconSize.md),
      ),
    );
  }
}

class _RailAndMeta extends StatelessWidget {
  const _RailAndMeta({required this.slot, required this.onShare});

  final ReelSlot<FeedReel> slot;
  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    final insets = slot.insets;
    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        // Clears the seek bar and the safe area; the top is left to the header.
        padding: EdgeInsets.only(left: insets.left, right: insets.right, bottom: insets.bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.xxxl,
          children: [
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: Padding(
                padding: const EdgeInsetsDirectional.only(end: AppSpacing.lg),
                child: ReelActionRail(reel: slot.data.reel, onShare: onShare),
              ),
            ),
            ReelMeta(reel: slot.data.reel),
          ],
        ),
      ),
    );
  }
}

class _Curtain extends StatelessWidget {
  const _Curtain({required this.slot, required this.onUnlock});

  final ReelSlot<FeedReel> slot;
  final VoidCallback onUnlock;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final data = slot.data.reel;
    return UnlockOverlay(
      tagLabel: l10n.exclusiveTag,
      title: data.title,
      unlocksForLabel: l10n.exclusiveUnlocksFor,
      costLabel: l10n.exclusivePointsCost(data.unlockCost ?? 0),
      previewLabel: l10n.exclusivePreview,
      preview: data.preview ?? '',
      castLabel: l10n.exclusiveCastAndCrew,
      cast: data.castAndCrew ?? '',
      unlockCtaLabel: l10n.exclusiveUnlockCta,
      confirmTitle: l10n.exclusiveConfirmTitle,
      confirmMessage: l10n.exclusiveConfirmMessage,
      pointDeductionLabel: l10n.exclusivePointDeduction,
      confirmCtaLabel: l10n.exclusiveConfirmCta,
      // The overlay always confirms first; confirming unlocks the reel.
      confirmAndUnlock: onUnlock,
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.pointsBalance, required this.showPoints});

  final int pointsBalance;
  final bool showPoints;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Stack(
      fit: StackFit.expand,
      children: [
        IgnorePointer(
          child: ScreenTitle(label: l10n.navHome, child: const SizedBox.shrink()),
        ),
        PositionedDirectional(
          top: 0,
          start: 0,
          end: 0,
          height: AppControlHeight.appBarWithStatus,
          child: IgnorePointer(
            child: DecoratedBox(decoration: BoxDecoration(gradient: context.appColors.overlay.topBar)),
          ),
        ),
        if (showPoints)
          PositionedDirectional(
            top: 0,
            end: 0,
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsetsDirectional.only(end: AppSpacing.lg),
                child: PointsPill(
                  tooltip: l10n.rewardsPointsPillTooltip,
                  value: context.decimalFormat.format(pointsBalance),
                  unit: l10n.rewardsPointsUnit.toUpperCase(),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
