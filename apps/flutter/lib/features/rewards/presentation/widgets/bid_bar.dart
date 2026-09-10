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
    required this.onBid,
    super.key,
  });

  ///
  /// What the field starts on: the standing bid plus the minimum raise. A bid
  /// takes the screen through a loading state, so the bar is rebuilt from
  /// scratch afterwards and the field opens on the new floor.
  ///
  final int openingBid;

  final List<int> increments;
  final String fieldLabel;
  final String actionLabel;

  /// Formats one quick-add button's caption from its amount.
  final String Function(int amount) incrementLabel;

  final ValueChanged<int> onBid;

  @override
  State<BidBar> createState() => _BidBarState();
}

class _BidBarState extends State<BidBar> {
  /// The frame's bid field is 40 tall with an 85-wide action sitting in it.
  static const double _fieldHeight = 40;
  static const double _actionWidth = 85;

  ///
  /// A quick-add paints the 32 the frame draws but lays out 48, so it keeps a
  /// full tap target. That adds 8 above and below the row, which the gaps
  /// around it give back: 4 here reads as the frame's 12.
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
  /// Setting `text` alone collapses the selection to nothing and drops the
  /// caret, so the value is written with the caret placed after it — a
  /// quick-add is a nudge to what is being typed, not a replacement for it.
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
          top: AppSpacing.xxl,
          bottom: context.bottomInset(AppSpacing.xxl),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: _chipRowGap,
          children: [
            // The frame draws the action inside the field's own border rather
            // than beside it, so the two read as one control.
            Container(
              // The frame draws this 40 tall. The input theme's own 52 is the
              // full-width form field's height, so the row is sized here and
              // the field's constraints are cleared below to match.
              height: _fieldHeight,
              decoration: BoxDecoration(
                color: colors.input.background,
                border: Border.all(color: colors.input.border),
                borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                      // The frame draws no label and the field opens
                      // prefilled, so the hint never renders; the name has to
                      // come from the semantics instead.
                      //
                      // The content padding stays zero. Padding the editor out
                      // to the row's height enlarges the tap target, but a
                      // constant inset is taken out of a box that does not
                      // grow, so the text is left the same 16 at every text
                      // scale and is cut in half at 200%. A small target is
                      // not a WCAG 2.1 AA failure; clipped text is.
                      child: Semantics(
                        textField: true,
                        label: widget.fieldLabel,
                        child: TextField(
                          controller: _controller,
                          keyboardType: TextInputType.number,
                          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                          onSubmitted: (_) => _bid(),
                          style: AppTextStyle.numeralSm.copyWith(color: colors.input.text),
                          decoration: const InputDecoration(
                            isDense: true,
                            filled: false,
                            constraints: BoxConstraints(),
                            border: InputBorder.none,
                            enabledBorder: InputBorder.none,
                            focusedBorder: InputBorder.none,
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
                        minimumSize: const Size(_actionWidth, double.infinity),
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
            Row(
              spacing: AppSpacing.sm,
              children: [
                for (final increment in widget.increments)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _addIncrement(increment),
                      // Zero padding, so four quick-adds fit the row; the
                      // height comes from the outlined-button theme. The
                      // amounts are numerals, not a button label.
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.zero,
                        textStyle: AppTextStyle.numeralPill,
                      ),
                      child: Text(widget.incrementLabel(increment)),
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
