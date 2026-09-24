import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/utils/clock_label.dart';
import 'package:matinee/core/widgets/countdown_builder.dart';

///
/// One of the two cards under the auction blurb: a gold wash falling off the
/// top-left corner, inside a gold hairline and its glow.
///
class AuctionStatCard extends StatelessWidget {
  const AuctionStatCard({required this.label, required this.value, super.key, this.valueLabel});

  final String label;
  final String value;

  ///
  /// How the value should be read when the glyphs do not read well — the
  /// countdown's `01:07:32` being the case this exists for. Defaults to [value].
  ///
  final String? valueLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    // The label and the figure are one fact, so they are read as one node
    // rather than two stops a swipe apart.
    return Semantics(
      label: '$label: ${valueLabel ?? value}',
      container: true,
      excludeSemantics: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: colors.card.auctionStat,
          border: Border.all(color: colors.card.borderHighlight),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
          boxShadow: AppElevation.glowCard,
        ),
        child: Padding(
          padding: AppSpacing.cardPadding,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTextStyle.labelSmall.copyWith(color: colors.text.secondary)),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xs),
                child: Text(
                  value,
                  maxLines: 1,
                  style: AppTextStyle.numeralLg.copyWith(color: colors.text.numeral),
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
/// The countdown card, reformatted every second from the lot's end time.
///
class AuctionCountdownCard extends StatelessWidget {
  const AuctionCountdownCard({
    required this.label,
    required this.endsAt,
    required this.endedLabel,
    required this.spokenRemaining,
    super.key,
  });

  final String label;
  final DateTime endsAt;
  final String endedLabel;

  ///
  /// Puts the remaining time into words. The card draws a clock face, which a
  /// screen reader reads as three numbers separated by colons.
  ///
  final String Function(Duration remaining) spokenRemaining;

  @override
  Widget build(BuildContext context) {
    return CountdownBuilder(
      endsAt: endsAt,
      builder: (context, remaining) {
        final ended = remaining == Duration.zero;
        return AuctionStatCard(
          label: label,
          value: ended ? endedLabel : clockLabel(remaining),
          valueLabel: ended ? endedLabel : spokenRemaining(remaining),
        );
      },
    );
  }
}
