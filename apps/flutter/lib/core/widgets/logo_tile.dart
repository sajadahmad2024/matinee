import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// A brand's logo in a rounded square, loaded from [imageUrl]. The logo art
/// carries its own background; a missing or failed image leaves the card fill.
///
/// The logo has no text, so [semanticLabel] names it. With [onTap] it is a
/// button at least 48 on each side.
///
class LogoTile extends StatelessWidget {
  const LogoTile({required this.imageUrl, required this.semanticLabel, super.key, this.onTap});

  static const double size = AppAvatarSize.cast;

  final String imageUrl;
  final String semanticLabel;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    const shape = RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)));
    final tile = SizedBox.square(
      dimension: size,
      child: DecoratedBox(
        decoration: ShapeDecoration(color: colors.card.background, shape: shape),
        child: DecoratedBox(
          // The edge paints over the logo, so a dark logo still reads against
          // the dark sheet.
          position: DecorationPosition.foreground,
          decoration: ShapeDecoration(
            shape: shape.copyWith(side: BorderSide(color: colors.avatar.outline)),
            image: imageUrl.isEmpty
                ? null
                : DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover, onError: (_, _) {}),
          ),
        ),
      ),
    );

    final onTap = this.onTap;
    return Semantics(
      image: onTap == null,
      button: onTap != null,
      label: semanticLabel,
      excludeSemantics: true,
      onTap: onTap,
      child: onTap == null ? tile : InkWell(onTap: onTap, customBorder: shape, child: tile),
    );
  }
}
