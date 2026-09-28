import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/genre_tag.dart';

///
/// Who made a video and its genres, on one line: the studio's name, then its
/// genre tags. Shared by the Home overlay and the details sheet.
///
class ReelCredits extends StatelessWidget {
  const ReelCredits({required this.studio, required this.genres, super.key});

  final String studio;
  final List<String> genres;

  @override
  Widget build(BuildContext context) {
    return Row(
      spacing: AppSpacing.xs,
      children: [
        Text(
          studio,
          style: AppTextStyle.caption.copyWith(color: context.appColors.text.secondary),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(width: AppSpacing.sm),
        if (genres.isNotEmpty) Expanded(child: _GenreTagsRow(genres: genres)),
      ],
    );
  }
}

///
/// The genre tags, in a single row that scrolls sideways rather than wraps —
/// wrapping would push the studio name down every time a reel had more than
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
