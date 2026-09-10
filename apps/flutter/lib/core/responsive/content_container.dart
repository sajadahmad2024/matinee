import 'package:flutter/widgets.dart';

///
/// Constrains content width on wide windows so pages do not stretch edge to
/// edge. [form], [reading] and [general] are the design's three widths.
///
class ContentContainer extends StatelessWidget {
  const ContentContainer({
    required this.child,
    super.key,
    this.maxWidth = general,
    this.alignment = Alignment.topCenter,
    this.shrinkWrapHeight = false,
  });

  /// Forms and sheets, where a long measure would be hard to fill in.
  static const double form = 560;

  /// Screens that are mostly prose.
  static const double reading = 720;

  static const double general = 1080;

  final Widget child;
  final double maxWidth;
  final Alignment alignment;

  ///
  /// Sizes to the child's height instead of filling what is offered. A page
  /// wants the fill; a scroll-controlled sheet would stand full height.
  ///
  final bool shrinkWrapHeight;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      heightFactor: shrinkWrapHeight ? 1 : null,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: child,
      ),
    );
  }
}
