import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/utils/initials.dart';

///
/// One bid in the history. The bid that currently holds the lot is drawn in
/// gold with a glow; the others are plain cards.
///
class BidHistoryRow extends StatelessWidget {
  const BidHistoryRow({
    required this.bidderName,
    required this.placedAt,
    required this.amount,
    required this.isLeading,
    super.key,
  });

  final String bidderName;
  final String placedAt;
  final String amount;
  final bool isLeading;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: isLeading ? null : colors.card.background,
        border: Border.all(
          color: isLeading ? colors.card.borderHighlight : colors.card.border,
        ),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        boxShadow: isLeading ? AppElevation.glowCard : null,
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          spacing: AppSpacing.md,
          children: [
            _Avatar(name: bidderName),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    bidderName,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: isLeading ? colors.text.link : colors.text.primary,
                    ),
                  ),
                  Text(
                    placedAt,
                    style: AppTextStyle.caption.copyWith(color: colors.text.muted),
                  ),
                ],
              ),
            ),
            Text(
              amount,
              style: AppTextStyle.numeralPill.copyWith(
                color: isLeading ? colors.text.numeral : colors.text.secondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

///
/// The bidders have no pictures in the data, so the disc carries an initial
/// the way the avatar component does everywhere else.
///
class _Avatar extends StatelessWidget {
  const _Avatar({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Container(
      width: AppAvatarSize.comment,
      height: AppAvatarSize.comment,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: colors.avatar.background, shape: BoxShape.circle),
      child: Text(
        initialsOf(name),
        style: Theme.of(context).textTheme.titleSmall?.copyWith(color: colors.text.primary),
      ),
    );
  }
}
