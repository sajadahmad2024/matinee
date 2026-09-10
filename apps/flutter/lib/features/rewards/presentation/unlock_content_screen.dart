import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
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
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_state.dart';

///
/// The unlock screen for one locked item: what it is, what it costs and the
/// preview. The design draws it over Home; until Home exists it is a screen.
///
class UnlockContentScreen extends StatelessWidget {
  const UnlockContentScreen({required this.itemId, super.key});

  final String itemId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = UnlockContentCubit(getIt<RewardsRepository>(), itemId);
        unawaited(cubit.load());
        return cubit;
      },
      child: const UnlockContentView(),
    );
  }
}

@visibleForTesting
class UnlockContentView extends StatelessWidget {
  const UnlockContentView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      // No scrim of its own: on the Scaffold it composites over black and comes
      // out darker, not lighter. A transparent route once Home exists.
      body: SafeArea(
        child: ContentContainer(
          maxWidth: ContentContainer.form,
          child: BlocConsumer<UnlockContentCubit, UnlockContentState>(
            listenWhen: (previous, current) => current is UnlockContentSuccess && current.justUnlocked,
            // Unlocking drops the user into the content, which lives on Home.
            listener: (context, state) => const HomeRoute().go(context),
            builder: (context, state) => switch (state) {
              UnlockContentInitial() => const SizedBox.shrink(),
              UnlockContentLoading() => const LoadingView(),
              UnlockContentFailure(:final error) => ErrorView(
                message: error.localizedMessage(l10n),
                onRetry: () => unawaited(context.read<UnlockContentCubit>().load()),
              ),
              UnlockContentSuccess(:final item) => _Body(item: item),
            },
          ),
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.item});

  final ExclusiveItem item;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    // Fills the viewport and scrolls only once the copy does not fit — 77 past
    // the bottom at a 1.5 scale, where the unlock action was unreachable.
    final bottom = context.bottomInset(AppSpacing.xxl);
    return LayoutBuilder(
      builder: (context, constraints) => SingleChildScrollView(
        padding: EdgeInsets.only(
          left: AppScreenPadding.main,
          right: AppScreenPadding.main,
          bottom: bottom,
        ),
        child: ConstrainedBox(
          constraints: BoxConstraints(
            // The gap comes off the minimum: a scroll view lays its padding out
            // around the child, so a full viewport would always overflow it.
            minHeight: (constraints.maxHeight - bottom).clamp(0, double.infinity),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            // spaceBetween, not an Expanded: a flexible child cannot live in a
            // shrink-wrapping column, and the minimum above already fills it.
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.md),
                  child: _ExclusiveTag(label: l10n.exclusiveTag),
                ),
              ),
              _Offer(
                title: item.title,
                unlocksFor: l10n.exclusiveUnlocksFor,
                cost: l10n.exclusivePointsCost(item.unlockCost),
              ),
              _PreviewCard(
                previewLabel: l10n.exclusivePreview,
                preview: item.preview,
                castLabel: l10n.exclusiveCastAndCrew,
                cast: item.castAndCrew,
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.lg),
                // The large gold CTA carries a glow no button theme can
                // express: a Material elevation is not this shape.
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
                    boxShadow: AppElevation.glowCta,
                  ),
                  child: FilledButton(
                    onPressed: () => unawaited(context.read<UnlockContentCubit>().unlock()),
                    child: Text(l10n.exclusiveUnlockCta),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The gold outline pill with a padlock that names the screen.
class _ExclusiveTag extends StatelessWidget {
  const _ExclusiveTag({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.tag;
    return DecoratedBox(
      // Filled as well as outlined: the frame tints the pill, which an outline
      // on its own left looking hollow against the dimmed backdrop.
      decoration: BoxDecoration(
        color: colors.goldBackground,
        border: Border.all(color: colors.goldBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.pill)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            Icon(Icons.lock_outline, size: AppIconSize.xs, color: colors.goldSubtleLabel),
            // Flexible, so a scaled-up label wraps inside the pill rather than
            // pushing it past the screen — at 200% it ran 43 over the edge.
            Flexible(
              child: Text(
                label,
                style: AppTextStyle.labelSmall.copyWith(color: colors.goldSubtleLabel),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// The centre block: the lock disc, the title, and what it costs to open.
class _Offer extends StatelessWidget {
  const _Offer({required this.title, required this.unlocksFor, required this.cost});

  static const double _discSize = 60;

  final String title;
  final String unlocksFor;
  final String cost;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: _discSize,
          height: _discSize,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: colors.card.backgroundGoldTint,
            shape: BoxShape.circle,
            border: Border.all(
              color: colors.tag.goldBorder,
              width: AppBorderWidth.focus,
            ),
          ),
          child: Icon(Icons.lock_outline, size: AppIconSize.lg, color: colors.icon.accent),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.lg),
          child: ScreenTitle(
            label: title,
            child: Text(
              title,
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                color: colors.text.primary,
              ),
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xxxl),
          child: Text(
            unlocksFor,
            style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xs),
          child: Text(
            cost,
            style: AppTextStyle.numeralMd.copyWith(color: colors.text.numeral),
          ),
        ),
      ],
    );
  }
}

/// What the user gets for the points: a synopsis and who made it.
class _PreviewCard extends StatelessWidget {
  const _PreviewCard({
    required this.previewLabel,
    required this.preview,
    required this.castLabel,
    required this.cast,
  });

  final String previewLabel;
  final String preview;
  final String castLabel;
  final String cast;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final theme = Theme.of(context);
    // Fill, border and radius all come from the card theme.
    return Card(
      child: Padding(
        padding: AppSpacing.cardPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionLabel(label: previewLabel, isMuted: true),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.sm),
              child: Text(
                preview,
                style: theme.textTheme.bodySmall?.copyWith(color: colors.text.secondary),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
              child: Divider(height: 0),
            ),
            SectionLabel(label: castLabel, isMuted: true),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xs),
              child: Text(
                cast,
                style: theme.textTheme.titleSmall?.copyWith(color: colors.text.link),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
