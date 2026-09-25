import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/utils/initials.dart';

/// Where an avatar sits, which fixes its size, fill, ring and initials.
enum AppAvatarVariant {
  /// Comment cards and bid history rows.
  compact(AppAvatarSize.comment),

  /// The portrait the profile screens open with, in its gold ring.
  profile(AppAvatarSize.profile);

  const AppAvatarVariant(this.size);

  final double size;
}

///
/// A circular portrait: the photo over the name's initials, so a missing or
/// failed image still shows who it is. Every variant's look is defined here.
///
/// Silent to screen readers unless [semanticLabel] names it: most rows print
/// the name beside it.
///
class AppAvatar extends StatelessWidget {
  const AppAvatar({
    required this.name,
    super.key,
    this.imageUrl,
    this.variant = AppAvatarVariant.compact,
    this.semanticLabel,
  });

  final String name;
  final String? imageUrl;
  final AppAvatarVariant variant;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final textTheme = Theme.of(context).textTheme;
    final url = imageUrl;
    final (fill, ring, initialsStyle) = switch (variant) {
      AppAvatarVariant.compact => (colors.avatar.background, null, textTheme.titleSmall),
      AppAvatarVariant.profile => (colors.card.background, Border.all(color: colors.avatar.ring), textTheme.titleLarge),
    };

    final avatar = ExcludeSemantics(
      child: SizedBox.square(
        dimension: variant.size,
        child: DecoratedBox(
          decoration: BoxDecoration(color: fill, shape: BoxShape.circle),
          child: DecoratedBox(
            // The photo and the ring paint over the initials, so a loaded photo
            // hides them and the ring stays on top of the photo.
            position: DecorationPosition.foreground,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: ring,
              image: url == null || url.isEmpty
                  ? null
                  // A failed load leaves the initials showing instead of throwing.
                  : DecorationImage(image: NetworkImage(url), fit: BoxFit.cover, onError: (_, _) {}),
            ),
            child: Center(
              child: Text(initialsOf(name), style: initialsStyle?.copyWith(color: colors.text.primary)),
            ),
          ),
        ),
      ),
    );
    if (semanticLabel case final label?) {
      return Semantics(image: true, label: label, child: avatar);
    }
    return avatar;
  }
}
