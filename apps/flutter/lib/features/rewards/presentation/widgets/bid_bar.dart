import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The bar pinned to the bottom of the auction: the amount to bid, the BID
/// button, and the four quick-add buttons under them.
///
class BidBar extends StatefulWidget {
  const BidBar({
    required this.openingBid,
    required this.increments,
    required this.fieldLabel,
    required this.actionLabel,
    required this.incrementLabel,
    required this.incrementSemanticLabel,
    required this.onBid,
    super.key,
  });

  ///
  /// What the field starts on: the standing bid plus the minimum raise. A bid
  /// rebuilds the bar, so the field reopens on the new floor.
  ///
  final int openingBid;

  final List<int> increments;
  final String fieldLabel;
  final String actionLabel;

  /// Formats one quick-add button's caption from its amount.
  final String Function(int amount) incrementLabel;

  ///
  /// Names what a quick-add does. Its caption is a bare numeral, which a screen
  /// reader can only read as a number sitting on a button.
  ///
  final String Function(int amount) incrementSemanticLabel;

  final ValueChanged<int> onBid;

  @override
  State<BidBar> createState() => _BidBarState();
}

class _BidBarState extends State<BidBar> {
  ///
  /// The frame draws the field 40 tall, leaving the action inside it 36 — under
  /// the 48 it has to be hittable at. The 10 this adds comes off the gap above.
  ///
  static const double _fieldHeight = kMinInteractiveDimension + 2 * AppBorderWidth.hairline;
  static const double _rowGapAbove = AppSpacing.md + AppSpacing.xxs;
  static const double _actionWidth = 85;

  ///
  /// A quick-add paints the 32 the frame draws but lays out 48. The 8 that adds
  /// above and below comes off the gaps: 4 here reads as the frame's 12.
  ///
  static const double _chipRowGap = AppSpacing.xs;

  late final TextEditingController _controller = TextEditingController(
    text: widget.openingBid.toString(),
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _bid() {
    final amount = int.tryParse(_controller.text);
    if (amount != null) {
      widget.onBid(amount);
    }
  }

  ///
  /// Setting `text` alone drops the caret, so the value is written with the
  /// caret after it: a quick-add nudges what is typed, it does not replace it.
  ///
  void _addIncrement(int increment) {
    final current = int.tryParse(_controller.text) ?? widget.openingBid;
    final raised = (current + increment).toString();
    _controller.value = TextEditingValue(
      text: raised,
      selection: TextSelection.collapsed(offset: raised.length),
    );
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: colors.sheet.auctionBidBar,
        border: Border(top: BorderSide(color: colors.card.borderHighlight)),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
        boxShadow: AppElevation.glowBidBar,
      ),
      child: Padding(
        padding: EdgeInsets.only(
          left: AppScreenPadding.main,
          right: AppScreenPadding.main,
          top: _rowGapAbove,
          bottom: context.bottomInset(AppSpacing.xxl),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: _chipRowGap,
          children: [
            // The frame draws the action inside the field's own border rather
            // than beside it, so the two read as one control.
            ConstrainedBox(
              // A minimum, not a fixed height: the input theme's 52 is the
              // full-width field's height, so the row is sized here instead.
              constraints: const BoxConstraints(minHeight: _fieldHeight),
              // Tightens the row's height, which the stretch below needs.
              child: IntrinsicHeight(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: colors.input.background,
                    border: Border.all(color: colors.input.border),
                    borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
                  ),
                  child: Row(
                    // So the field and the action fill the row's height rather
                    // than asking for an unbounded one of their own.
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                          // The frame draws no label and the field opens
                          // prefilled, so the hint never renders.
                          child: Semantics(
                            // Never `textField: true`: the extra node cannot
                            // merge, splitting name and value across two stops.
                            label: widget.fieldLabel,
                            child: TextField(
                              controller: _controller,
                              // Centres the value. Sizing the field to its
                              // text pins it high and drops the target to 18.
                              textAlignVertical: TextAlignVertical.center,
                              // With a null maxLines, lets the editor fill the
                              // box so the alignment above has room to work.
                              expands: true,
                              maxLines: null,
                              keyboardType: TextInputType.number,
                              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                              onSubmitted: (_) => _bid(),
                              style: AppTextStyle.numeralSm.copyWith(color: colors.input.text),
                              decoration: const InputDecoration(
                                // Collapsed, as the auth frame does it: a dense
                                // decoration anchors its editor to the top.
                                isCollapsed: true,
                                filled: false,
                                constraints: BoxConstraints(minHeight: _fieldHeight),
                                border: InputBorder.none,
                                enabledBorder: InputBorder.none,
                                focusedBorder: InputBorder.none,
                                // Zero: a constant inset out of a box that
                                // grows with the text scale would clip at 200%.
                                contentPadding: EdgeInsets.zero,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(AppBorderWidth.hairline),
                        child: FilledButton.icon(
                          onPressed: _bid,
                          style: FilledButton.styleFrom(
                            minimumSize: const Size(_actionWidth, 0),
                            padding: EdgeInsets.zero,
                            iconAlignment: IconAlignment.end,
                            shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.all(Radius.circular(AppRadius.xs)),
                            ),
                          ),
                          icon: const Icon(Icons.bolt, size: AppIconSize.sm),
                          label: Text(widget.actionLabel),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Row(
              spacing: AppSpacing.sm,
              children: [
                for (final increment in widget.increments)
                  Expanded(
                    // The caption is a bare numeral, so the name spells the
                    // action out and keeps that numeral inside it.
                    child: Semantics(
                      label: widget.incrementSemanticLabel(increment),
                      // Excluding the subtree takes the button's tap with it.
                      onTap: () => _addIncrement(increment),
                      excludeSemantics: true,
                      button: true,
                      child: OutlinedButton(
                        onPressed: () => _addIncrement(increment),
                        // Zero padding, so four quick-adds fit the row; the
                        // height comes from the outlined-button theme.
                        style: OutlinedButton.styleFrom(
                          padding: EdgeInsets.zero,
                          textStyle: AppTextStyle.numeralPill,
                        ),
                        child: Text(widget.incrementLabel(increment)),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
