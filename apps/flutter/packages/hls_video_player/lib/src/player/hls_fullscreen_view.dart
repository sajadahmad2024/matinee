import 'package:flutter/material.dart';

/// Black full-window surface that turns [child] a quarter turn on a portrait
/// screen, so the video plays landscape without locking device orientation.
///
/// On a screen that is already landscape it does not rotate. Safe-area insets
/// are remapped so the child's edges keep clear of the notch and home bar.
class HlsFullscreenView extends StatelessWidget {
  /// Creates the fullscreen surface.
  const HlsFullscreenView({required this.child, super.key});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final MediaQueryData media = MediaQuery.of(context);
    final bool rotate = media.size.height > media.size.width;
    if (!rotate) {
      return ColoredBox(color: Colors.black, child: child);
    }
    return ColoredBox(
      color: Colors.black,
      child: RotatedBox(
        quarterTurns: 1,
        child: MediaQuery(
          data: media.copyWith(
            size: media.size.flipped,
            padding: _turned(media.padding),
            viewPadding: _turned(media.viewPadding),
          ),
          child: child,
        ),
      ),
    );
  }

  // A clockwise quarter turn puts the child's left on the physical top, its
  // top on the physical right, and so on round the edges.
  static EdgeInsets _turned(EdgeInsets p) =>
      EdgeInsets.fromLTRB(p.top, p.right, p.bottom, p.left);
}
