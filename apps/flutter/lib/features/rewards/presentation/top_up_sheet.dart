import 'dart:async';

import 'package:flutter/material.dart';
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
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_state.dart';

///
/// Opens the top-up sheet over the auction. It reports nothing back: the
/// sheet can be swiped away after a purchase as easily as after a cancel, so
/// a caller that cares about the balance refetches it either way.
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
/// The body of the sheet: a pack picker that becomes a receipt once the
/// purchase lands. Choosing a payment method belongs to the gateway a later
/// change hands off to, so nothing sits between the two.
///
@visibleForTesting
class TopUpSheet extends StatelessWidget {
  const TopUpSheet({super.key});

  ///
  /// What the packs occupy once they arrive, which the states before them
  /// reserve along with the CTA's slot, so the sheet never changes height on
  /// load. It is content-sized, so anything that fills the height it is
  /// offered instead opens the sheet at the full screen and drops it to a
  /// third of that a moment later.
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
      // The packs arrive after the sheet is already up, and the receipt
      // replaces them with a block of another height again, so the sheet
      // settles into each rather than snapping.
      child: AnimatedSize(
        duration: MediaQuery.disableAnimationsOf(context) ? Duration.zero : _resize,
        alignment: Alignment.bottomCenter,
        curve: Curves.easeOut,
        child: BlocBuilder<TopUpCubit, TopUpState>(
          builder: (context, state) => switch (state) {
            TopUpInitial() => const SizedBox.shrink(),
            TopUpLoading() => const _Pending(
              height: _packsHeight,
              child: Center(child: CircularProgressIndicator()),
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
    );
  }
}

///
/// The sheet before its packs land: the same chrome and heading, with the row
/// they will fill held open at its height. [child] is given exactly that box,
/// so a widget that centres itself cannot stretch the sheet to the screen.
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
            child: SizedBox(height: height, child: child),
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
      // The frame sets the row 20 below the sheet edge and 12 above the title.
      // The close button paints the 32 it draws but lays out 48 to keep its
      // tap target, so both gaps are set 8 short of that.
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

///
/// The three packs, one of which is always selected.
///
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
        Text(
          l10n.topUpTitle,
          textAlign: TextAlign.center,
          style: theme.textTheme.headlineSmall?.copyWith(color: colors.text.primary),
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
    required this.isSelected,
    required this.onTap,
  });

  static const double _discSize = 32;

  final PointsPack pack;
  final String pointsLabel;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final theme = Theme.of(context);
    // A pack is a selectable option, so it takes the tab pill's chosen and
    // unchosen roles rather than a card's.
    return Material(
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
    );
  }
}

///
/// What the sheet becomes once the purchase lands.
///
class _Receipt extends StatelessWidget {
  const _Receipt({required this.points});

  final int points;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final theme = Theme.of(context);
    return Column(
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
