import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/app_avatar.dart';

///
/// The profile variant of [AppAvatar], plus the edit screen's camera disc
/// when [editBadge] is set.
///
class ProfileAvatar extends StatelessWidget {
  const ProfileAvatar({
    required this.name,
    super.key,
    this.imageUrl,
    this.editBadge = false,
    this.semanticLabel,
  });

  static const double _badgeSize = 24;

  final String name;
  final String? imageUrl;
  final bool editBadge;

  ///
  /// Names the portrait. The profile screen prints the name right beneath it
  /// and passes nothing; the edit form has none, so the disc would be silent.
  ///
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final avatar = SizedBox.square(
      dimension: AppAvatarVariant.profile.size,
      child: Stack(
        children: [
          Positioned.fill(
            child: AppAvatar(name: name, imageUrl: imageUrl, variant: AppAvatarVariant.profile),
          ),
          if (editBadge) const PositionedDirectional(end: 0, bottom: 0, child: _EditBadge()),
        ],
      ),
    );
    if (semanticLabel case final label?) {
      return Semantics(image: true, label: label, child: avatar);
    }
    return avatar;
  }
}

///
/// The gold disc at the avatar's lower right. Drawn, not tapped, and hidden
/// from screen readers: there is no picker yet, and 24dp is under the target.
///
class _EditBadge extends StatelessWidget {
  const _EditBadge();

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return ExcludeSemantics(
      child: DecoratedBox(
        decoration: BoxDecoration(color: colors.icon.accent, shape: BoxShape.circle),
        child: SizedBox.square(
          dimension: ProfileAvatar._badgeSize,
          child: Icon(
            // The frame draws a pencil here; the glyph inventory calls this
            // one 'camera (edit avatar)'.
            Icons.edit,
            size: AppIconSize.xs,
            color: Theme.of(context).colorScheme.surface,
          ),
        ),
      ),
    );
  }
}
