import 'package:flutter/material.dart';

///
/// A photograph under a scrim, with the copy standing on it. The height is a
/// minimum rather than a fixed box, so a scaled-up title grows the still
/// instead of being clipped.
///
class StillBackdrop extends StatelessWidget {
  const StillBackdrop({
    required this.imageAsset,
    required this.scrim,
    required this.minHeight,
    required this.child,
    super.key,
  });

  final String imageAsset;

  /// The overlay role the design darkens this still with.
  final Gradient scrim;

  /// What the design draws the still at before any text scaling.
  final double minHeight;

  /// The only child the stack measures, which is what lets it grow.
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(minHeight: minHeight),
      child: IntrinsicHeight(
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Positioned, so the photograph's own size is not what the stack
            // measures itself against.
            Positioned.fill(
              child: Image.asset(imageAsset, fit: BoxFit.cover, excludeFromSemantics: true),
            ),
            Positioned.fill(
              child: DecoratedBox(decoration: BoxDecoration(gradient: scrim)),
            ),
            child,
          ],
        ),
      ),
    );
  }
}
