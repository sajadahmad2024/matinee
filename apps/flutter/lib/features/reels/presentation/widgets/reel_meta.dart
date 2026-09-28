import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/presentation/widgets/reel_credits.dart';

/// The Home video overlay's bottom meta block: title, author and genre tags.
class ReelMeta extends StatelessWidget {
  const ReelMeta({required this.reel, super.key});

  final Reel reel;

  @override
  Widget build(BuildContext context) {
    final text = context.appColors.text;
    return Padding(
      padding: const EdgeInsetsDirectional.only(start: AppSpacing.lg, end: AppSpacing.lg, bottom: AppSpacing.lg),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: AppSpacing.sm,
              children: [
                Text(
                  reel.title,
                  style: AppTextStyle.headlineLarge.copyWith(color: text.primary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Padding(
                  padding: const EdgeInsetsDirectional.only(top: AppSpacing.xs),
                  child: ReelCredits(studio: reel.author.displayName, genres: reel.genres),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
