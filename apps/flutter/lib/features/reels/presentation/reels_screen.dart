import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hls_video_player/hls_video_player.dart';
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
import 'package:matinee/features/reels/presentation/cubit/reels_cubit.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_state.dart';
import 'package:matinee/features/reels/presentation/reel_to_hls_item.dart';
import 'package:matinee/features/reels/presentation/widgets/points_earned_sheet.dart';
import 'package:matinee/features/reels/presentation/widgets/reel_action_rail.dart';
import 'package:matinee/features/reels/presentation/widgets/reel_meta.dart';
import 'package:matinee/features/reels/presentation/widgets/swipe_through_overscroll.dart';
import 'package:matinee/features/reels/presentation/widgets/unlock_overlay.dart';
import 'package:matinee/features/reels/presentation/widgets/unlock_premium_sheet.dart';
import 'package:share_plus/share_plus.dart';

class ReelsScreen extends StatelessWidget {
  const ReelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = ReelsCubit(getIt<ReelsRepository>());
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
      body: BlocBuilder<ReelsCubit, ReelsState>(
        builder: (context, state) => switch (state) {
          ReelsInitial() => const SizedBox.shrink(),
          ReelsLoading() => const SafeArea(child: LoadingView()),
          ReelsFailure(:final error) => SafeArea(
            child: ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<ReelsCubit>().load()),
            ),
          ),
          ReelsSuccess(:final reels, :final pointsBalance) => _Feed(reels: reels, pointsBalance: pointsBalance),
        },
      ),
    );
  }
}

class _Feed extends StatefulWidget {
  const _Feed({required this.reels, required this.pointsBalance});

  final List<Reel> reels;
  final int pointsBalance;

  @override
  State<_Feed> createState() => _FeedState();
}

class _FeedState extends State<_Feed> {
  // Sample values until sharing and levels have a points API.
  static const int _shareRewardPoints = 50;
  static const int _levelTargetPoints = 1000;

  // Owned here, not by HlsReelPager, so a swipe over UnlockOverlay can drive
  // it the same as a swipe on the pager itself.
  final _pageController = PageController();

  // Ephemeral, session-only: which exclusive reels this viewer has unlocked.
  // No persistence — lost when the feed leaves the screen.
  final _unlockedReelIds = <String>{};

  // Reported by the focused _ReelPage, so the points pill can hide while a
  // locked reel's overlay is covering it instead of sitting on top of it.
  bool _lockedReelShowing = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  ///
  /// Opens the system share sheet, and once it closes shows what the share paid.
  ///
  Future<void> _share(Reel reel) async {
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
    if (!mounted) {
      return;
    }
    final subscribe = await showPointsEarnedSheet(
      context,
      earnedPoints: _shareRewardPoints,
      balance: widget.pointsBalance,
      levelTarget: _levelTargetPoints,
    );
    if (subscribe && mounted) {
      await showUnlockPremiumSheet(context);
    }
  }

  void _handleLockedReelVisibilityChanged(bool showing) {
    if (_lockedReelShowing != showing) {
      setState(() => _lockedReelShowing = showing);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final items = [for (final reel in widget.reels.where(isPlayableReel)) toHlsReelItem(reel)];
    return Stack(
      fit: StackFit.expand,
      children: [
        HlsReelPager(
          controller: _pageController,
          items: items,
          // Seek bar comes back as slot.bottomBar so it paints above the scrim.
          controls: HlsPlayerControls(
            embedBottomBar: false,
            fullscreenBuilder: (context, state) {
              return const Padding(
                padding: EdgeInsets.all(AppSpacing.sm),
                child: Icon(
                  Icons.screen_rotation_rounded,
                  size: AppIconSize.md,
                ),
              );
            },
          ),
          itemBuilder: (context, slot) {
            final reel = slot.item.data! as Reel;
            return _ReelPage(
              reel: reel,
              video: slot.video,
              bottomBar: slot.bottomBar,
              isFocused: slot.isFocused,
              isUnlocked: _unlockedReelIds.contains(reel.id),
              pageController: _pageController,
              onUnlocked: () => setState(() => _unlockedReelIds.add(reel.id)),
              onOverlayVisibleChanged: _handleLockedReelVisibilityChanged,
              onShare: () => unawaited(_share(reel)),
            );
          },
        ),
        IgnorePointer(
          child: ScreenTitle(label: context.l10n.navHome, child: const SizedBox.shrink()),
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

        //This fetch points value from its own point/streak bloc, where the values are global.
        if (!_lockedReelShowing)
          PositionedDirectional(
            top: 0,
            end: 0,
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsetsDirectional.only(end: AppSpacing.lg),
                child: PointsPill(
                  tooltip: l10n.rewardsPointsPillTooltip,
                  value: context.decimalFormat.format(widget.pointsBalance),
                  unit: l10n.rewardsPointsUnit.toUpperCase(),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _ReelPage extends StatelessWidget {
  const _ReelPage({
    required this.reel,
    required this.video,
    required this.bottomBar,
    required this.isFocused,
    required this.isUnlocked,
    required this.pageController,
    required this.onUnlocked,
    required this.onOverlayVisibleChanged,
    required this.onShare,
  });

  final Reel reel;
  final Widget video;

  /// Player seek bar and timer, painted above the scrim and below the overlay.
  final Widget? bottomBar;

  /// Whether the pager currently has this reel focused — sourced from
  /// `HlsReelSlot.isFocused`, updated once a page change settles.
  final bool isFocused;

  final bool isUnlocked;
  final PageController pageController;
  final VoidCallback onUnlocked;

  /// Reports whether this page's overlay is showing, whenever this is the
  /// focused page — lets `_Feed` hide the points pill behind it.
  final ValueChanged<bool> onOverlayVisibleChanged;

  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final showOverlay = reel.isExclusive && isFocused && !isUnlocked;
    // Deferred a frame: reporting to an ancestor mid-build would call its
    // setState while the tree is still building.
    if (isFocused) {
      WidgetsBinding.instance.addPostFrameCallback((_) => onOverlayVisibleChanged(showOverlay));
    }
    return Stack(
      fit: StackFit.expand,
      children: [
        video,
        IgnorePointer(
          child: DecoratedBox(decoration: BoxDecoration(gradient: context.appColors.overlay.hero)),
        ),
        ?bottomBar,
        PositionedDirectional(
          start: 0,
          end: 0,
          bottom: 0,
          child: SafeArea(
            top: false,
            child: Padding(
              // Leaves the player's seek bar row uncovered at the bottom.
              padding: const EdgeInsets.only(bottom: HlsPlayerControls.bottomBarHeight),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                spacing: AppSpacing.xxxl,
                children: [
                  Align(
                    alignment: AlignmentDirectional.centerEnd,
                    child: Padding(
                      padding: const EdgeInsetsDirectional.only(end: AppSpacing.lg),
                      child: ReelActionRail(reel: reel, onShare: onShare),
                    ),
                  ),
                  ReelMeta(reel: reel),
                ],
              ),
            ),
          ),
        ),

        if (showOverlay)
          SwipeThroughOverscroll(
            onSwipeForward: () => pageController.nextPage(duration: Durations.medium2, curve: Curves.easeOut),
            onSwipeBackward: () => pageController.previousPage(duration: Durations.medium2, curve: Curves.easeOut),
            child: UnlockOverlay(
              tagLabel: l10n.exclusiveTag,
              title: reel.title,
              unlocksForLabel: l10n.exclusiveUnlocksFor,
              costLabel: l10n.exclusivePointsCost(reel.unlockCost ?? 0),
              previewLabel: l10n.exclusivePreview,
              preview: reel.preview ?? '',
              castLabel: l10n.exclusiveCastAndCrew,
              cast: reel.castAndCrew ?? '',
              unlockCtaLabel: l10n.exclusiveUnlockCta,
              confirmTitle: l10n.exclusiveConfirmTitle,
              confirmMessage: l10n.exclusiveConfirmMessage,
              pointDeductionLabel: l10n.exclusivePointDeduction,
              confirmCtaLabel: l10n.exclusiveConfirmCta,
              // No onUnlock: the overlay always goes through its confirm
              // step, and confirming is what removes it for this reel.
              confirmAndUnlock: onUnlocked,
            ),
          ),
      ],
    );
  }
}
