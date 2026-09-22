import 'package:flutter/material.dart';

///
/// Marks the text naming a screen as its top-level heading, the anchor its
/// sections hang from. Adds no style — [child] keeps the design's own.
///
class ScreenTitle extends StatelessWidget {
  const ScreenTitle({required this.label, required this.child, super.key});

  ///
  /// Announced in place of [child], because the design sets several titles in
  /// upper case, which some screen readers spell out letter by letter.
  ///
  final String label;

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      header: true,
      headingLevel: 1,
      label: label,
      container: true,
      excludeSemantics: true,
      child: child,
    );
  }
}
