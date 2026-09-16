import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/glyph_box.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/core/widgets/still_backdrop.dart';

/// The still behind the header, which the design fixes while the copy sits on it.
const double _heroHeight = 200;

/// The box the design puts the trophy glyph in.
const double _glyphBoxSize = 52;

///
/// The header a reward screen wears: a still under a scrim, with an emoji mark,
/// an eyebrow and the screen's title standing on it.
///
class RewardHero extends StatelessWidget {
  const RewardHero({
    required this.imageAsset,
    required this.glyph,
    required this.eyebrow,
    required this.title,
    super.key,
  });

  final String imageAsset;

  /// The emoji the design uses as the mark, until the icon font carries it.
  final String glyph;

  final String eyebrow;
  final String title;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return StillBackdrop(
      imageAsset: imageAsset,
      // Darkens throughout rather than clearing a band: the copy sits over the
      // middle of the still, not below it.
      scrim: colors.overlay.auctionHero,
      minHeight: _heroHeight,
      child: Align(
        alignment: AlignmentDirectional.bottomStart,
        child: Padding(
          padding: const EdgeInsets.all(AppScreenPadding.main),
          child: _Copy(glyph: glyph, eyebrow: eyebrow, title: title),
        ),
      ),
    );
  }
}

class _Copy extends StatelessWidget {
  const _Copy({required this.glyph, required this.eyebrow, required this.title});

  final String glyph;
  final String eyebrow;
  final String title;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Row(
      spacing: AppSpacing.md,
      children: [
        GlyphBox(glyph: glyph, size: _glyphBoxSize),
        Expanded(
          child: Column(
            // Hugging, or the column takes the whole hero and the copy is
            // stranded at its top edge.
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                eyebrow,
                style: AppTextStyle.overline.copyWith(color: colors.text.numeral),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.xxs),
                child: ScreenTitle(
                  label: title,
                  child: Text(
                    title,
                    style: AppTextStyle.headlineMedium.copyWith(color: colors.text.primary),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
