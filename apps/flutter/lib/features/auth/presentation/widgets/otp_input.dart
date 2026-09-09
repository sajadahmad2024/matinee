import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The row of single-digit boxes the verification screen is built around.
///
/// One hidden field holds the whole code and the boxes only draw it. A field
/// per box would have to hand focus along as digits arrive, which drops
/// characters when they come faster than focus moves — from a paste, an
/// autofilled SMS code, or simply quick typing — and makes backspace a special
/// case. Here the platform handles all three.
///
class OtpInput extends StatefulWidget {
  const OtpInput({required this.length, required this.onChanged, super.key, this.onCompleted});

  final int length;
  final ValueChanged<String> onChanged;
  final VoidCallback? onCompleted;

  @override
  State<OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<OtpInput> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  bool _wasComplete = false;

  @override
  void initState() {
    super.initState();
    // The box waiting for the next digit is lit, so the row has to repaint
    // when focus leaves or returns and not only when a digit arrives.
    _focusNode.addListener(_onFocusChanged);
  }

  void _onFocusChanged() => setState(() {});

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChanged);
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  ///
  /// Auto-submit fires on the keystroke that completes the row and not again,
  /// so correcting a digit of a rejected code does not send a half-corrected
  /// one straight back.
  ///
  void _onChanged(String code) {
    setState(() {});
    widget.onChanged(code);
    final isComplete = code.length == widget.length;
    if (isComplete && !_wasComplete) {
      widget.onCompleted?.call();
    }
    _wasComplete = isComplete;
  }

  @override
  Widget build(BuildContext context) {
    final code = _controller.text;
    return Stack(
      alignment: Alignment.center,
      children: [
        // The field is invisible but takes the taps and the keyboard; the
        // boxes above it are decoration and let pointers through.
        Opacity(
          opacity: 0,
          child: SizedBox(
            height: AppControlHeight.otpBox,
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              onChanged: _onChanged,
              onTapOutside: (_) => FocusScope.of(context).unfocus(),
              autofocus: true,
              showCursor: false,
              enableInteractiveSelection: false,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.done,
              autofillHints: const [AutofillHints.oneTimeCode],
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(widget.length),
              ],
              decoration: const InputDecoration(border: InputBorder.none, counterText: ''),
            ),
          ),
        ),
        IgnorePointer(
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            spacing: AppSpacing.md,
            children: [
              for (var index = 0; index < widget.length; index++)
                _OtpBox(
                  digit: index < code.length ? code[index] : '',
                  isNext: index == code.length && _focusNode.hasFocus,
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _OtpBox extends StatelessWidget {
  const _OtpBox({required this.digit, required this.isNext});

  final String digit;
  final bool isNext;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final lit = digit.isNotEmpty || isNext;
    return SizedBox.square(
      dimension: AppControlHeight.otpBox,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.auth.inputBackground,
          border: Border.all(
            color: lit ? colors.input.focusBorder : colors.auth.inputBorder,
            width: AppBorderWidth.focus,
          ),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
          boxShadow: lit ? AppElevation.glowFocus : const [],
        ),
        child: Center(
          child: Text(digit, style: AppTextStyle.numeralLg.copyWith(color: colors.auth.otpDigit)),
        ),
      ),
    );
  }
}
