import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/app_avatar.dart';

///
/// One of the details sheet's cast: their photo over their name. A name wider
/// than the photo overhangs it, up to a gap either side, then ellipsizes.
///
class CastMember extends StatelessWidget {
  const CastMember({required this.name, super.key, this.imageUrl, this.onTap});

  static const double _maxWidth = AppAvatarSize.cast + AppSpacing.xl;

  final String name;
  final String? imageUrl;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final member = ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: _maxWidth),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        spacing: AppSpacing.sm,
        children: [
          AppAvatar(name: name, imageUrl: imageUrl, variant: AppAvatarVariant.cast),
          Text(
            name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: AppTextStyle.caption.copyWith(color: context.appColors.text.secondary),
          ),
        ],
      ),
    );

    final onTap = this.onTap;
    if (onTap == null) {
      return member;
    }
    return Semantics(
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
        child: member,
      ),
    );
  }
}
