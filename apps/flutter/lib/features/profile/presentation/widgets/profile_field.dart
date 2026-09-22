import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// One labelled field of the edit form. The app variant of the input has no
/// stroke and sits on the raised surface, unlike the framed auth one.
///
class ProfileField extends StatefulWidget {
  const ProfileField({
    required this.label,
    required this.controller,
    required this.validator,
    super.key,
    this.keyboardType,
    this.textInputAction = TextInputAction.next,
    this.textCapitalization = TextCapitalization.none,
    this.autofillHints,
    this.showError = false,
  });

  final String label;
  final TextEditingController controller;
  final String? Function(String value) validator;
  final TextInputType? keyboardType;
  final TextInputAction textInputAction;
  final TextCapitalization textCapitalization;
  final Iterable<String>? autofillHints;

  /// Set once a submit has been refused, so a value that arrived already
  /// invalid explains itself instead of leaving a dead button.
  final bool showError;

  @override
  State<ProfileField> createState() => _ProfileFieldState();
}

class _ProfileFieldState extends State<ProfileField> {
  bool _touched = false;
  String? _error;

  void _onFocusChange({required bool focused}) {
    if (focused) {
      return;
    }
    setState(() {
      _touched = true;
      _error = widget.validator(widget.controller.text);
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
    final textTheme = Theme.of(context).textTheme;
    final error = widget.showError ? widget.validator(widget.controller.text) : _error;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: AppSpacing.labelToField,
      children: [
        // Excluded, not labelled: the field below takes the same text as its
        // name, and the upper case stays a visual matter.
        ExcludeSemantics(
          child: Text(
            widget.label.toUpperCase(),
            style: textTheme.labelMedium?.copyWith(color: colors.text.secondary),
          ),
        ),
        Focus(
          canRequestFocus: false,
          skipTraversal: true,
          onFocusChange: (focused) => _onFocusChange(focused: focused),
          // Material puts errorText in the field's hint but never marks the
          // field invalid, so the state is set here alongside the name.
          child: Semantics(
            // Never `textField: true`: it adds a second, unmergeable node.
            label: widget.label,
            validationResult: error == null ? SemanticsValidationResult.none : SemanticsValidationResult.invalid,
            child: TextField(
              controller: widget.controller,
              keyboardType: widget.keyboardType,
              textInputAction: widget.textInputAction,
              textCapitalization: widget.textCapitalization,
              autofillHints: widget.autofillHints,
              onChanged: _onChanged,
              onTapOutside: (_) => FocusScope.of(context).unfocus(),
              style: textTheme.bodyLarge?.copyWith(color: colors.text.primary),
              cursorColor: colors.text.link,
              decoration: InputDecoration(
                filled: true,
                fillColor: colors.card.backgroundRaised,
                errorText: error,
                border: const OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
                  borderSide: BorderSide.none,
                ),
                enabledBorder: const OutlineInputBorder(
                  borderRadius: BorderRadius.all(Radius.circular(AppRadius.md)),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
                  borderSide: BorderSide(color: colors.input.focusBorder),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
