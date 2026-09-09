import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// One labelled field of the auth form: an upper-case label, the framed input
/// the warm palette draws, and the error message underneath.
///
/// The field owns when its error is shown — nothing until the user has left it
/// once, then on every keystroke — while the screen owns whether the form as a
/// whole is submittable, so the CTA can be disabled before anything is typed
/// without the fields turning red.
///
class AuthField extends StatefulWidget {
  const AuthField({
    required this.label,
    required this.hintText,
    required this.controller,
    required this.validator,
    super.key,
    this.keyboardType,
    this.inputFormatters,
    this.textInputAction = TextInputAction.next,
    this.textCapitalization = TextCapitalization.none,
    this.autofillHints,
    this.labelSuffix,
    this.leading,
    this.onSubmitted,
  });

  final String label;

  /// Rendered after the label in sentence case, as the design writes
  /// '(optional)' beside REFERRAL CODE.
  final String? labelSuffix;

  final String hintText;
  final TextEditingController controller;
  final String? Function(String value) validator;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputAction textInputAction;
  final TextCapitalization textCapitalization;
  final Iterable<String>? autofillHints;

  /// Sits to the left of the field, outside its frame: the +91 country box.
  final Widget? leading;

  final VoidCallback? onSubmitted;

  @override
  State<AuthField> createState() => _AuthFieldState();
}

class _AuthFieldState extends State<AuthField> {
  bool _focused = false;
  bool _touched = false;
  String? _error;

  void _onFocusChange({required bool focused}) {
    setState(() {
      _focused = focused;
      if (!focused) {
        _touched = true;
        _error = widget.validator(widget.controller.text);
      }
    });
  }

  void _onChanged(String value) {
    if (!_touched) {
      return;
    }
    setState(() => _error = widget.validator(value));
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final field = _AuthFieldFrame(
      focused: _focused,
      hasError: _error != null,
      child: TextField(
        controller: widget.controller,
        keyboardType: widget.keyboardType,
        inputFormatters: widget.inputFormatters,
        textInputAction: widget.textInputAction,
        textCapitalization: widget.textCapitalization,
        autofillHints: widget.autofillHints,
        onChanged: _onChanged,
        onSubmitted: (_) => widget.onSubmitted?.call(),
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: colors.auth.onSurface),
        cursorColor: colors.text.link,
        // A tap anywhere else puts the keyboard away, which is otherwise
        // one-way on a screen with no other focusable control.
        onTapOutside: (_) => FocusScope.of(context).unfocus(),
        decoration: InputDecoration(
          // The frame around this field paints the fill and the border, so the
          // Material decoration draws none of its own. Clearing `border` alone
          // is not enough: the per-state borders fall back to the app-wide
          // input theme and would paint a second ring inside the frame.
          filled: false,
          isCollapsed: true,
          constraints: const BoxConstraints(),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          errorBorder: InputBorder.none,
          focusedErrorBorder: InputBorder.none,
          disabledBorder: InputBorder.none,
          hintText: widget.hintText,
          hintStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(color: colors.auth.inputPlaceholder),
        ),
      ),
    );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: AppSpacing.labelToField,
      children: [
        Text.rich(
          TextSpan(
            text: widget.label.toUpperCase(),
            children: [
              if (widget.labelSuffix case final suffix?)
                TextSpan(
                  text: ' $suffix',
                  style: AppTextStyle.caption.copyWith(color: colors.auth.onSurfaceMuted),
                ),
            ],
          ),
          style: AppTextStyle.overline.copyWith(color: colors.auth.inputLabel),
        ),
        Focus(
          canRequestFocus: false,
          skipTraversal: true,
          onFocusChange: (focused) => _onFocusChange(focused: focused),
          child: widget.leading == null
              ? field
              // The country box matches the field's height, which inside a
              // scrolling column has to be measured rather than inherited.
              : IntrinsicHeight(
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    spacing: AppSpacing.sm,
                    children: [
                      widget.leading!,
                      Expanded(child: field),
                    ],
                  ),
                ),
        ),
        if (_error case final error?) Text(error, style: AppTextStyle.caption.copyWith(color: colors.text.error)),
      ],
    );
  }
}

///
/// The framed box every auth input sits in. The design draws no error state,
/// so the error border reuses the recorded error role the way the design
/// system's open item says derived rules should until one is drawn.
///
class _AuthFieldFrame extends StatelessWidget {
  const _AuthFieldFrame({required this.focused, required this.hasError, required this.child});

  final bool focused;
  final bool hasError;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final border = switch ((hasError, focused)) {
      (true, _) => colors.input.errorBorder,
      (false, true) => colors.input.focusBorder,
      (false, false) => colors.auth.inputBorder,
    };
    final glow = switch ((hasError, focused)) {
      (true, _) => AppElevation.glowError,
      (false, true) => AppElevation.glowFocus,
      (false, false) => const <BoxShadow>[],
    };
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.auth.inputBackground,
        border: Border.all(color: border),
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        boxShadow: glow,
      ),
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: AppControlHeight.input),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Align(alignment: AlignmentDirectional.centerStart, child: child),
        ),
      ),
    );
  }
}
