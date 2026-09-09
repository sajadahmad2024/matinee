import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The circular portrait the profile screens open with.
///
/// The mock has no photo yet, and a real one can fail to load, so the initials
/// stand in rather than an empty disc. [editBadge] adds the camera disc the
/// edit screen draws at the lower right.
///
class ProfileAvatar extends StatelessWidget {
  const ProfileAvatar({
    required this.name,
    super.key,
    this.imageUrl,
    this.editBadge = false,
    this.onEdit,
  });

  static const double _badgeSize = 24;

  final String name;
  final String? imageUrl;
  final bool editBadge;
  final VoidCallback? onEdit;

  ///
  /// The first letter of each of the first two words, which is what a name
  /// without a photo shows.
  ///
  static String initialsOf(String name) {
    final words = name.trim().split(RegExp(r'\s+')).where((word) => word.isNotEmpty);
    return words.take(2).map((word) => word[0].toUpperCase()).join();
  }

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
          if (editBadge)
            PositionedDirectional(
              end: 0,
              bottom: 0,
              child: _EditBadge(onTap: onEdit),
            ),
        ],
      ),
    );
  }
}

class _EditBadge extends StatelessWidget {
  const _EditBadge({required this.onTap});

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Material(
      color: colors.icon.accent,
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
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
