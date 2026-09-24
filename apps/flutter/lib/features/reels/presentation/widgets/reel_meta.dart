import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/genre_tag.dart';
import 'package:matinee/features/reels/data/models/reel.dart';

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
                  child: Row(
                    spacing: AppSpacing.xs,
                    children: [
                      Text(
                        reel.author.displayName,
                        style: AppTextStyle.caption.copyWith(color: text.secondary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(
                        width: AppSpacing.sm,
                      ),
                      if (reel.genres.isNotEmpty) Expanded(child: _GenreTagsRow(genres: reel.genres)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

///
/// The genre tags, in a single row that scrolls sideways rather than wraps —
/// wrapping would push the author name down every time a reel had more than
/// fit on one line.
///
/// The trailing fade is a [BlendMode.dstIn] mask, not a rendered colour: it
/// only ever shows where a tag's own pixels reach that edge, so it stays
/// invisible while every tag already fits.
///
class _GenreTagsRow extends StatelessWidget {
  const _GenreTagsRow({required this.genres});

  final List<String> genres;

  @override
  Widget build(BuildContext context) {
    final textDirection = Directionality.of(context);
    return ShaderMask(
      blendMode: BlendMode.dstIn,
      shaderCallback: (bounds) => const LinearGradient(
        begin: AlignmentDirectional.centerStart,
        end: AlignmentDirectional.centerEnd,
        colors: [Colors.white, Colors.white, Colors.transparent],
        stops: [0, 0.85, 1],
      ).createShader(bounds, textDirection: textDirection),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          spacing: AppSpacing.sm,
          children: [for (final genre in genres) GenreTag(label: genre.toUpperCase())],
        ),
      ),
    );
  }
}
