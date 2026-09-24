import 'dart:async';

import 'package:material_ui/material_ui.dart';

///
/// Rebuilds once a second with the time left until [endsAt], so a countdown
/// never freezes on the value it was first built with.
///
class CountdownBuilder extends StatefulWidget {
  const CountdownBuilder({required this.endsAt, required this.builder, super.key});

  final DateTime endsAt;

  /// Given [Duration.zero] once [endsAt] has passed.
  final Widget Function(BuildContext context, Duration remaining) builder;

  @override
  State<CountdownBuilder> createState() => _CountdownBuilderState();
}

class _CountdownBuilderState extends State<CountdownBuilder> {
  Timer? _ticker;
  late Duration _remaining = _timeLeft;

  Duration get _timeLeft {
    final left = widget.endsAt.difference(DateTime.now());
    return left.isNegative ? Duration.zero : left;
  }

  @override
  void initState() {
    super.initState();
    _start();
  }

  @override
  void didUpdateWidget(CountdownBuilder oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.endsAt != oldWidget.endsAt) {
      _remaining = _timeLeft;
      _start();
    }
  }

  void _start() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _remaining = _timeLeft);
      // Past the end the value is fixed, so the ticker stops rather than
      // rebuilding once a second for the life of the route.
      if (_remaining == Duration.zero) {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.builder(context, _remaining);
}
