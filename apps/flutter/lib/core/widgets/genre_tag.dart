import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The muted pill the design sets under a video title to name one of its
/// genres. Unlike [CategoryTag]'s gold pill over an image, this reads as
/// metadata rather than a call-out, so it takes the surface-raised tone.
///
class GenreTag extends StatelessWidget {
  const GenreTag({required this.label, super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.tag;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.genreBackground,
        border: Border.all(color: colors.genreBorder),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xs),
        child: Text(label, style: AppTextStyle.labelSmall.copyWith(color: colors.genreLabel)),
      ),
    );
  }
}
