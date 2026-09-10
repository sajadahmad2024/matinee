import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

/// Which half of My Earns is on screen.
enum EarnsSegment { earns, badges }

/// The track the design draws around the two items.
const double _trackHeight = 36;

/// How far each item's tap target reaches past the track, above and below.
const double _trackInset = (kMinInteractiveDimension - _trackHeight) / 2;

///
/// The two-item control in the header. Not a [SegmentedButton]: the design's
/// track is a pill with a gradient item inside it, which that cannot draw.
///
class EarnsSegmentControl extends StatelessWidget {
  const EarnsSegmentControl({
    required this.earnsLabel,
    required this.badgesLabel,
    required this.selected,
    required this.onSelected,
    super.key,
  });

  final String earnsLabel;
  final String badgesLabel;
  final EarnsSegment selected;
  final ValueChanged<EarnsSegment> onSelected;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.segmented;
    return Semantics(
      // So the pair reads as one control of two rather than two loose buttons.
      role: SemanticsRole.tabBar,
      // The role requires every child to be a tab; without this the items'
      // nodes can be folded into this one.
      explicitChildNodes: true,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Painted behind the items rather than around them, so the track
          // keeps the height the design draws while they reach the 48 a tap
          // target needs. The inset grows with the items at a large text scale.
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: _trackInset),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: colors.trackBackground,
                  border: Border.all(color: colors.trackBorder),
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                ),
              ),
            ),
          ),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _Segment(
                label: earnsLabel,
                selected: selected == EarnsSegment.earns,
                onTap: () => onSelected(EarnsSegment.earns),
              ),
              _Segment(
                label: badgesLabel,
                selected: selected == EarnsSegment.badges,
                onTap: () => onSelected(EarnsSegment.badges),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Segment extends StatelessWidget {
  const _Segment({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.segmented;
    return Semantics(
      role: SemanticsRole.tab,
      selected: selected,
      label: label,
      // Excluding the subtree takes the InkWell's tap with it, and a tab
      // without one trips a framework assertion.
      onTap: onTap,
      excludeSemantics: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadius.pill),
        // No ink, for the reason the badge tabs have none: it would trace the
        // 48 tap target and spill past the track the item sits in.
        splashFactory: NoSplash.splashFactory,
        overlayColor: const WidgetStatePropertyAll(Colors.transparent),
        // The design draws the item 27 tall, too small to hit, so it keeps
        // that height and the tap target grows around it.
        child: ConstrainedBox(
          constraints: const BoxConstraints(minHeight: kMinInteractiveDimension),
          child: Center(
            widthFactor: 1,
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: selected ? colors.activeBackground : null,
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              // A minimum, not the design's 27: the item has to grow with the
              // label rather than clip it.
              child: ConstrainedBox(
                constraints: const BoxConstraints(minHeight: AppControlHeight.buttonMini),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Center(
                    child: Text(
                      label,
                      style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: selected ? colors.activeLabel : colors.inactiveLabel,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
