import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// One row of the profile's menu list: a label, a chevron, and a hairline
/// under it. The destructive variant drops the chevron and the hairline for a
/// leading icon, and paints label and icon in the error colour.
///
class ProfileMenuRow extends StatelessWidget {
  const ProfileMenuRow({
    required this.label,
    required this.onTap,
    super.key,
    this.icon,
    this.isDestructive = false,
  });

  final String label;

  /// Null leaves the row inert, which is how a destination that does not exist
  /// yet is drawn.
  final VoidCallback? onTap;

  /// Leading glyph. Only the destructive row draws one.
  final IconData? icon;

  final bool isDestructive;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final foreground = isDestructive ? colors.text.error : colors.text.primary;
    return DecoratedBox(
      decoration: BoxDecoration(
        border: isDestructive ? null : Border(bottom: BorderSide(color: colors.divider)),
      ),
      child: InkWell(
        onTap: onTap,
        // A minimum, not a fixed height: a label that wraps at a large text
        // scale has to grow the row. A SizedBox clips it, and silently — the
        // overflow is vertical inside a Row, so nothing is reported.
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: AppControlHeight.listRow),
          child: Row(
            spacing: AppSpacing.sm,
            children: [
              if (icon case final icon?) Icon(icon, size: AppIconSize.md, color: foreground),
              Expanded(
                child: Text(
                  label,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: foreground),
                ),
              ),
              if (!isDestructive) Icon(Icons.chevron_right, size: AppIconSize.sm, color: colors.icon.muted),
            ],
          ),
        ),
      ),
    );
  }
}
