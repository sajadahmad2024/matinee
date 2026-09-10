import 'dart:async';

import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// One of the two cards under the auction blurb: a gold wash falling off the
/// top-left corner, inside a gold hairline and its glow.
///
class AuctionStatCard extends StatelessWidget {
  const AuctionStatCard({required this.label, required this.value, super.key});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: colors.card.auctionStat,
        border: Border.all(color: colors.card.borderHighlight),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        boxShadow: AppElevation.glowCard,
      ),
      child: Padding(
        padding: AppSpacing.cardPadding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTextStyle.labelSmall.copyWith(color: colors.text.secondary)),
            Padding(
              padding: const EdgeInsets.only(top: AppSpacing.xs),
              child: Text(
                value,
                maxLines: 1,
                style: AppTextStyle.numeralLg.copyWith(color: colors.text.numeral),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

///
/// The countdown card. It reformats every second from the lot's end time, so
/// a stale build never shows a frozen clock.
///
class AuctionCountdownCard extends StatefulWidget {
  const AuctionCountdownCard({
    required this.label,
    required this.endsAt,
    required this.endedLabel,
    super.key,
  });

  final String label;
  final DateTime endsAt;
  final String endedLabel;

  @override
  State<AuctionCountdownCard> createState() => _AuctionCountdownCardState();
}

class _AuctionCountdownCardState extends State<AuctionCountdownCard> {
  late final Timer _ticker;
  late Duration _remaining = _timeLeft;

  Duration get _timeLeft {
    final left = widget.endsAt.difference(DateTime.now());
    return left.isNegative ? Duration.zero : left;
  }

  @override
  void initState() {
    super.initState();
    _ticker = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() => _remaining = _timeLeft);
      // Past the end the value is fixed, so the ticker stops rather than
      // rebuilding the card once a second for the life of the route.
      if (_remaining == Duration.zero) {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _ticker.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuctionStatCard(
      label: widget.label,
      value: _remaining == Duration.zero ? widget.endedLabel : _formatted(_remaining),
    );
  }

  ///
  /// Hours can run past a day, so they are not taken modulo 24.
  ///
  static String _formatted(Duration remaining) {
    String pad(int value) => value.toString().padLeft(2, '0');
    return '${pad(remaining.inHours)}:${pad(remaining.inMinutes % 60)}:'
        '${pad(remaining.inSeconds % 60)}';
  }
}
