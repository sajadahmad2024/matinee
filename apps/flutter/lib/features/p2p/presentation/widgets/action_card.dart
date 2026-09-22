import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/check_disc.dart';
import 'package:matinee/core/widgets/progress_bar.dart';
import 'package:matinee/core/widgets/status_badge.dart';
import 'package:matinee/core/widgets/svg_icon.dart';
import 'package:matinee/features/p2p/presentation/widgets/counter_chip.dart';

/// The square still beside an action's title.
const double _thumbSize = 42;

/// The wide still beside a curated row, which the design draws 56 by 36.
const Size _curatedThumbSize = Size(56, 36);

/// One row of the curated list, ready to draw.
@immutable
class CuratedRow {
  const CuratedRow({
    required this.title,
    required this.imageAsset,
    required this.isWatched,
    required this.semanticLabel,
    required this.watchLabel,
    required this.actionLabel,
    required this.onWatch,
  });

  final String title;
  final String imageAsset;
  final bool isWatched;

  ///
  /// The title as one sentence, state included, because the thumbnail and the
  /// badge beside it say nothing on their own.
  ///
  final String semanticLabel;

  /// What the button does, which 'Watch' on its own does not say.
  final String watchLabel;

  /// The badge's label once watched, or the button's while it is not.
  final String actionLabel;

  final VoidCallback onWatch;
}

///
/// One step of a quest: its still, what it asks for, how far along it is, and
/// the admin-picked content that completes it.
///
class ActionCard extends StatelessWidget {
  const ActionCard({
    required this.title,
    required this.description,
    required this.imageAsset,
    required this.counterLabel,
    required this.progress,
    required this.isComplete,
    required this.summary,
    required this.curatedLabel,
    required this.curated,
    super.key,
  });

  final String title;
  final String description;
  final String imageAsset;
  final String counterLabel;
  final double progress;
  final bool isComplete;

  /// The header as one sentence; its chip and bar announce none of it.
  final String summary;

  final String curatedLabel;
  final List<CuratedRow> curated;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.card.background,
        // The design closes a finished action in green, so the card's state
        // reads before any of its copy does.
        border: Border.all(color: isComplete ? colors.card.borderSuccess : colors.card.border),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.lg)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Semantics(
            label: summary,
            container: true,
            excludeSemantics: true,
            child: Padding(
              padding: const EdgeInsets.all(AppSpacing.cardPaddingVertical),
              child: _Header(
                title: title,
                description: description,
                imageAsset: imageAsset,
                counterLabel: counterLabel,
                isComplete: isComplete,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.cardPaddingVertical),
            child: ProgressBar(
              value: progress,
              tone: isComplete ? ProgressTone.success : ProgressTone.bold,
            ),
          ),
          if (curated.isNotEmpty) _Curated(label: curatedLabel, rows: curated),
        ],
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.title,
    required this.description,
    required this.imageAsset,
    required this.counterLabel,
    required this.isComplete,
  });

  final String title;
  final String description;
  final String imageAsset;
  final String counterLabel;
  final bool isComplete;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.text;
    return Row(
      spacing: AppSpacing.md,
      children: [
        ClipRRect(
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
          child: Image.asset(
            imageAsset,
            width: _thumbSize,
            height: _thumbSize,
            fit: BoxFit.cover,
            excludeFromSemantics: true,
          ),
        ),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Wrapped, so a long title and the tick both keep their width
              // and the tick drops below rather than squeezing the words.
              Wrap(
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: AppSpacing.sm,
                children: [
                  Text(title, style: AppTextStyle.titleSmall.copyWith(color: colors.primary)),
                  if (isComplete) const CheckDisc.inline(),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: Text(
                  description,
                  style: AppTextStyle.caption.copyWith(color: colors.muted),
                ),
              ),
            ],
          ),
        ),
        CounterChip(label: counterLabel, isComplete: isComplete),
      ],
    );
  }
}

class _Curated extends StatelessWidget {
  const _Curated({required this.label, required this.rows});

  final String label;
  final List<CuratedRow> rows;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Container(
      margin: const EdgeInsets.only(top: AppSpacing.md),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: colors.card.border)),
      ),
      padding: const EdgeInsets.only(
        left: AppSpacing.cardPaddingVertical,
        right: AppSpacing.cardPaddingVertical,
        top: AppSpacing.md,
        bottom: AppSpacing.cardPaddingVertical,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            label,
            style: AppTextStyle.overline.copyWith(color: colors.text.muted),
          ),
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.md),
            child: _CuratedList(rows: rows),
          ),
        ],
      ),
    );
  }
}

/// The curated rows as a list a screen reader can count through.
class _CuratedList extends StatelessWidget {
  const _CuratedList({required this.rows});

  final List<CuratedRow> rows;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      role: SemanticsRole.list,
      explicitChildNodes: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: AppSpacing.md,
        children: [for (final row in rows) _CuratedTile(row: row)],
      ),
    );
  }
}

class _CuratedTile extends StatelessWidget {
  const _CuratedTile({required this.row});

  final CuratedRow row;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      role: SemanticsRole.listItem,
      // Explicit, so the title's sentence and the button stay two stops rather
      // than folding into one unreachable label.
      explicitChildNodes: true,
      container: true,
      child: Row(
        spacing: AppSpacing.md,
        children: [
          _CuratedThumb(imageAsset: row.imageAsset, isWatched: row.isWatched),
          Expanded(
            child: Semantics(
              label: row.semanticLabel,
              container: true,
              excludeSemantics: true,
              child: Text(
                row.title,
                style: AppTextStyle.caption.copyWith(
                  color: row.isWatched ? colors.text.muted : colors.text.primary,
                ),
              ),
            ),
          ),
          if (row.isWatched)
            // The sentence beside it already says the row is done, so the badge
            // would only repeat it.
            ExcludeSemantics(
              child: StatusBadge(
                label: row.actionLabel,
                tone: StatusTone.successPlain,
                icon: AppIconAssets.check,
              ),
            )
          else
            Semantics(
              label: row.watchLabel,
              button: true,
              // Excluding the subtree takes the button's tap action with it.
              onTap: row.onWatch,
              container: true,
              excludeSemantics: true,
              child: FilledButton(
                onPressed: row.onWatch,
                style: FilledButton.styleFrom(
                  minimumSize: const Size(0, AppControlHeight.button),
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  textStyle: AppTextStyle.labelMedium,
                ),
                child: Text(row.actionLabel),
              ),
            ),
        ],
      ),
    );
  }
}

class _CuratedThumb extends StatelessWidget {
  const _CuratedThumb({required this.imageAsset, required this.isWatched});

  final String imageAsset;
  final bool isWatched;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return ClipRRect(
      borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
      child: SizedBox.fromSize(
        size: _curatedThumbSize,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(imageAsset, fit: BoxFit.cover, excludeFromSemantics: true),
            if (isWatched)
              ColoredBox(
                color: colors.tag.goldBackground,
                child: Center(
                  child: SvgIcon(
                    AppIconAssets.check,
                    size: AppIconSize.xs,
                    color: colors.icon.accent,
                  ),
                ),
              )
            else
              Center(
                // A disc of the on-image fill behind the glyph, so the play
                // mark holds its contrast over a bright still.
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: colors.pill.overImageBackground,
                    shape: BoxShape.circle,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(AppSpacing.xxs),
                    child: Icon(
                      Icons.play_arrow,
                      size: AppIconSize.xs,
                      color: colors.icon.primary,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
