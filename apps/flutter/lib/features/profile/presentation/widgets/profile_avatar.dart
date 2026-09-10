import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/utils/initials.dart';

///
/// The circular portrait the profile screens open with.
///
/// The mock has no photo yet, and a real one can fail to load, so the initials
/// stand in rather than an empty disc. [editBadge] adds the camera disc the
/// edit screen draws at the lower right, which is decoration: there is no
/// picker to open, so it is drawn rather than made tappable.
///
class ProfileAvatar extends StatelessWidget {
  const ProfileAvatar({required this.name, super.key, this.imageUrl, this.editBadge = false});

  static const double _badgeSize = 24;

  final String name;
  final String? imageUrl;
  final bool editBadge;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final url = imageUrl;
    return SizedBox.square(
      dimension: AppAvatarSize.profile,
      child: Stack(
        children: [
          Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: colors.card.background,
                border: Border.all(color: colors.avatar.ring),
                image: url == null || url.isEmpty ? null : DecorationImage(image: NetworkImage(url), fit: BoxFit.cover),
              ),
              child: url == null || url.isEmpty
                  ? Center(
                      child: Text(
                        initialsOf(name),
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(color: colors.text.primary),
                      ),
                    )
                  : null,
            ),
          ),
          if (editBadge) const PositionedDirectional(end: 0, bottom: 0, child: _EditBadge()),
        ],
      ),
    );
  }
}

///
/// The gold disc at the avatar's lower right. It is drawn, not tapped: there
/// is no avatar picker to open yet, and an inert 24dp button would be both a
/// false affordance and under the tap-target baseline. It is hidden from
/// screen readers for the same reason.
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
