import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_state.dart';

///
/// Opens the top-up sheet over the auction. It reports nothing back: the sheet
/// can be swiped away after a purchase, so a caller refetches the balance.
///
Future<void> showTopUpSheet(BuildContext context) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    // The frame sets the handle and the close button on one line, which the
    // sheet theme's own handle sits above; this one draws the row itself.
    showDragHandle: false,
    // Above the shell, so the sheet covers the bottom nav as the design draws
    // it rather than being boxed inside the current tab.
    useRootNavigator: true,
    builder: (_) => BlocProvider(
      create: (_) {
        final cubit = TopUpCubit(getIt<RewardsRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const TopUpSheet(),
    ),
  );
}

///
/// The body of the sheet: a pack picker that becomes a receipt once the purchase
/// lands. Payment method belongs to the gateway, so nothing sits between.
///
@visibleForTesting
class TopUpSheet extends StatelessWidget {
  const TopUpSheet({super.key});

  ///
  /// What the packs occupy once they arrive, reserved beforehand so the sheet
  /// never changes height. Content-sized: a filling child opens it full screen.
  ///
  static const double _packsHeight = 155;

  /// How long the sheet takes to settle when its content changes height.
  static const Duration _resize = Duration(milliseconds: 180);

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return ContentContainer(
      maxWidth: ContentContainer.form,
      alignment: Alignment.bottomCenter,
      shrinkWrapHeight: true,
      // Scrollable, because the sheet is content-sized: at a large text scale
      // the packs and the CTA run past the bottom with no way to reach them.
      child: SingleChildScrollView(
        // The packs arrive after the sheet is up, and the receipt replaces them
        // with another height again, so the sheet settles instead of snapping.
        child: AnimatedSize(
          duration: MediaQuery.disableAnimationsOf(context) ? Duration.zero : _resize,
          alignment: Alignment.bottomCenter,
          curve: Curves.easeOut,
          child: BlocBuilder<TopUpCubit, TopUpState>(
            builder: (context, state) => switch (state) {
              TopUpInitial() => const SizedBox.shrink(),
              TopUpLoading() => const _Pending(
                height: _packsHeight,
                child: LoadingView(),
              ),
              TopUpFailure(:final error) => _Pending(
                height: _packsHeight,
                child: ErrorView(
                  message: error.localizedMessage(l10n),
                  onRetry: () => unawaited(context.read<TopUpCubit>().load()),
                ),
              ),
              TopUpSuccess(:final data) => _Body(data: data),
            },
          ),
        ),
      ),
    );
  }
}

///
/// The sheet before its packs land: the same chrome and heading, with their row
/// held open. [child] gets exactly that box, so it cannot stretch the sheet.
///
class _Pending extends StatelessWidget {
  const _Pending({required this.height, required this.child});

  final double height;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Padding(
      padding: _sheetPadding(context),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _SheetHeader(closeLabel: l10n.topUpClose),
          const _Heading(),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xxl),
            // A minimum, not a fixed height: the slot keeps the sheet from
            // jumping when packs land, but a failure message has to grow it.
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: height),
              child: child,
            ),
          ),
          // The CTA's slot is held open too, so the sheet opens at the height
          // it will keep and the packs drop into it without moving anything.
          const Padding(
            padding: EdgeInsets.only(top: AppSpacing.xxl),
            child: SizedBox(height: AppControlHeight.cta),
          ),
        ],
      ),
    );
  }
}

///
/// The frame insets the sheet body by the same amount on both sides and holds
/// the home indicator clear at the foot.
///
EdgeInsets _sheetPadding(BuildContext context) => EdgeInsets.only(
  left: AppScreenPadding.sheet,
  right: AppScreenPadding.sheet,
  bottom: context.bottomInset(AppSpacing.xl),
);

class _Body extends StatelessWidget {
  const _Body({required this.data});

  final TopUpData data;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Padding(
      padding: _sheetPadding(context),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _SheetHeader(closeLabel: l10n.topUpClose),
          if (data.purchased) _Receipt(points: data.selected.points) else _Packs(data: data),
          Padding(
            // The receipt stands the CTA further off than the picker does, so
            // the sheet keeps roughly its height across the two.
            padding: EdgeInsets.only(
              top: data.purchased ? AppSpacing.xxxl : AppSpacing.xxl,
            ),
            child: FilledButton.icon(
              onPressed: data.purchased
                  ? () => Navigator.of(context).pop()
                  : () => unawaited(context.read<TopUpCubit>().purchase()),
              iconAlignment: IconAlignment.end,
              icon: const Icon(Icons.arrow_forward, size: AppIconSize.xs),
              label: Text(
                data.purchased ? l10n.topUpDone : l10n.topUpCta(data.selected.priceLabel),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

///
/// The grab handle with the close button level beside it, as the frame draws
/// them.
///
class _SheetHeader extends StatelessWidget {
  const _SheetHeader({required this.closeLabel});

  final String closeLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.sheet;
    return Padding(
      // The frame sets the row 20 below the sheet edge and 12 above the title;
      // the close button lays out 48 for its 32, so both gaps are 8 short.
      padding: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.xs),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: AppControlHeight.sheetHandle.width,
            height: AppControlHeight.sheetHandle.height,
            decoration: ShapeDecoration(color: colors.handleModal, shape: const StadiumBorder()),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              onPressed: () => Navigator.of(context).pop(),
              tooltip: closeLabel,
              iconSize: AppIconSize.xs,
              icon: const Icon(Icons.close),
              style: IconButton.styleFrom(
                backgroundColor: colors.closeBackground,
                fixedSize: const Size.square(AppControlHeight.button),
                padding: EdgeInsets.zero,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// The three packs, one of which is always selected.
class _Packs extends StatelessWidget {
  const _Packs({required this.data});

  final TopUpData data;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const _Heading(),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xxl),
          child: IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: AppSpacing.md,
              children: [
                for (final pack in data.packs)
                  Expanded(
                    child: _PackCard(
                      pack: pack,
                      pointsLabel: l10n.topUpPointsLabel,
                      optionLabel: l10n.topUpPackOption(
                        context.decimalFormat.format(pack.points),
                        pack.priceLabel,
                      ),
                      isSelected: pack.id == data.selected.id,
                      onTap: () => unawaited(context.read<TopUpCubit>().selectPack(pack)),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

///
/// The sheet's title and its one line of guidance, which stand before the
/// packs arrive as well as after.
///
class _Heading extends StatelessWidget {
  const _Heading();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final theme = Theme.of(context);
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        ScreenTitle(
          label: l10n.topUpTitle,
          child: Text(
            l10n.topUpTitle,
            textAlign: TextAlign.center,
            style: theme.textTheme.headlineSmall?.copyWith(color: colors.text.primary),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            l10n.topUpSubtitle,
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(color: colors.text.secondary),
          ),
        ),
      ],
    );
  }
}

class _PackCard extends StatelessWidget {
  const _PackCard({
    required this.pack,
    required this.pointsLabel,
    required this.optionLabel,
    required this.isSelected,
    required this.onTap,
  });

  static const double _discSize = 32;

  final PointsPack pack;
  final String pointsLabel;

  /// The pack read as one option: what it gives and what it costs.
  final String optionLabel;

  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final theme = Theme.of(context);
    // A pack is a selectable option, so it takes the tab pill's chosen and
    // unchosen roles rather than a card's.
    return Semantics(
      // One node for the four texts: the design marks the chosen pack with a
      // brighter, wider border, which no screen reader can see.
      label: optionLabel,
      selected: isSelected,
      inMutuallyExclusiveGroup: true,
      // Excluding the subtree takes the InkWell's tap action with it, leaving a
      // pack a screen reader can read and cannot choose.
      onTap: onTap,
      excludeSemantics: true,
      child: Material(
        color: isSelected ? colors.card.backgroundRaised : colors.card.background,
        shape: RoundedRectangleBorder(
          side: BorderSide(
            color: isSelected ? colors.tab.activeBorder : colors.tab.inactiveBorder,
            width: isSelected ? AppBorderWidth.emphasis : AppBorderWidth.hairline,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: _discSize,
                  height: _discSize,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: isSelected ? colors.card.backgroundGoldTint : colors.card.backgroundRaised,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.monetization_on_outlined,
                    size: AppIconSize.sm,
                    color: isSelected ? colors.icon.accent : colors.icon.secondary,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.sm),
                  child: Text(
                    context.decimalFormat.format(pack.points),
                    style: theme.textTheme.titleMedium?.copyWith(color: colors.text.primary),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.xxs),
                  child: Text(
                    pointsLabel,
                    style: AppTextStyle.labelSmall.copyWith(
                      color: isSelected ? colors.text.link : colors.text.secondary,
                    ),
                  ),
                ),
                const Padding(
                  padding: EdgeInsets.only(top: AppSpacing.md),
                  child: Divider(height: 0),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.sm),
                  child: Text(
                    pack.priceLabel,
                    style: theme.textTheme.titleSmall?.copyWith(color: colors.text.primary),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// What the sheet becomes once the purchase lands.
class _Receipt extends StatelessWidget {
  const _Receipt({required this.points});

  final int points;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final theme = Theme.of(context);
    // The picker becomes a receipt in place, with no route change and no focus
    // move, so nothing else would say the money went through.
    return Semantics(
      role: SemanticsRole.alert,
      label: '${l10n.topUpSuccessTitle}. ${l10n.topUpCredited(points)}',
      // The whole block is one confirmation: left in the tree, the figure is
      // read by the alert and then again as the pill below it.
      container: true,
      excludeSemantics: true,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: AppSpacing.xl),
            child: _SuccessMark(),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.xl),
            child: Text(
              l10n.topUpSuccessTitle,
              textAlign: TextAlign.center,
              style: theme.textTheme.headlineMedium?.copyWith(color: colors.text.primary),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.md),
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: colors.card.backgroundGoldTint,
                border: Border.all(color: colors.card.borderHighlight),
                borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.sm,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  spacing: AppSpacing.sm,
                  children: [
                    Icon(
                      Icons.monetization_on,
                      size: AppIconSize.sm,
                      color: colors.icon.accent,
                    ),
                    Text(
                      l10n.topUpCredited(points),
                      style: theme.textTheme.titleSmall?.copyWith(color: colors.text.link),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

///
/// The gold check the frame haloes twice: a tinted ring around the disc, and
/// the CTA glow standing in for the soft radial wash behind both.
///
class _SuccessMark extends StatelessWidget {
  const _SuccessMark();

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Container(
      width: AppAvatarSize.profile,
      height: AppAvatarSize.profile,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: colors.card.backgroundGoldTint,
        shape: BoxShape.circle,
        border: Border.all(color: colors.card.borderHighlight),
        boxShadow: AppElevation.glowCta,
      ),
      child: Container(
        width: AppAvatarSize.badgeDiscLg,
        height: AppAvatarSize.badgeDiscLg,
        alignment: Alignment.center,
        decoration: ShapeDecoration(
          gradient: colors.segmented.activeBackground,
          shape: const CircleBorder(),
        ),
        child: Icon(Icons.check, size: AppIconSize.xl, color: colors.text.inverse),
      ),
    );
  }
}
