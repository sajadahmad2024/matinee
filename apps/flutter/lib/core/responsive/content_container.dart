import 'package:flutter/widgets.dart';

///
/// Constrains content width on wide windows so pages do not stretch edge to
/// edge. Typical maxWidth: 560 for forms, 720 for reading, 1080 for general
/// content; dashboards pass double.infinity.
///
class ContentContainer extends StatelessWidget {
  const ContentContainer({
    required this.child,
    super.key,
    this.maxWidth = 1080,
    this.alignment = Alignment.topCenter,
  });

  final Widget child;
  final double maxWidth;
  final Alignment alignment;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: alignment,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: child,
      ),
    );
  }
}
