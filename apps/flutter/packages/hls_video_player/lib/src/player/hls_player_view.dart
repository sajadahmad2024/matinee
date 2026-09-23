import 'package:flutter/material.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';

/// Paints the native video texture for a [HlsPlayerPort].
///
/// Exists so portrait UI never imports `package:video_player`.
class HlsPlayerView extends StatelessWidget {
  /// Creates a view bound to [port].
  const HlsPlayerView({required this.port, super.key});

  /// Player whose texture should fill this widget.
  final HlsPlayerPort port;

  @override
  Widget build(BuildContext context) => port.buildView();
}
