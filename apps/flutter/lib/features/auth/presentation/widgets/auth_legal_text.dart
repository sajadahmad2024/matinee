import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The small print at the foot of the auth screens. The two document names are
/// gold and tappable as drawn; the caller decides where each one leads.
///
class AuthLegalText extends StatefulWidget {
  const AuthLegalText({
    required this.sentence,
    required this.termsLabel,
    required this.privacyLabel,
    required this.onTermsTap,
    required this.onPrivacyTap,
    super.key,
  });

  /// Carries `{terms}` and `{privacy}` markers the labels are spliced into.
  final String sentence;

  final String termsLabel;
  final String privacyLabel;
  final VoidCallback onTermsTap;
  final VoidCallback onPrivacyTap;

  @override
  State<AuthLegalText> createState() => _AuthLegalTextState();
}

class _AuthLegalTextState extends State<AuthLegalText> {
  static final RegExp _marker = RegExp(r'\{(terms|privacy)\}');

  final TapGestureRecognizer _terms = TapGestureRecognizer();
  final TapGestureRecognizer _privacy = TapGestureRecognizer();

  @override
  void initState() {
    super.initState();
    _terms.onTap = widget.onTermsTap;
    _privacy.onTap = widget.onPrivacyTap;
  }

  @override
  void didUpdateWidget(AuthLegalText oldWidget) {
    super.didUpdateWidget(oldWidget);
    _terms.onTap = widget.onTermsTap;
    _privacy.onTap = widget.onPrivacyTap;
  }

  @override
  void dispose() {
    _terms.dispose();
    _privacy.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final base = AppTextStyle.caption.copyWith(color: colors.auth.onSurfaceVariant);
    // Underlined as well as gold: a link set apart by colour alone fails the
    // use-of-colour rule, and these two are the only links on the screen.
    final link = base.copyWith(
      color: colors.text.link,
      decoration: TextDecoration.underline,
      decorationColor: colors.text.link,
    );
    final spans = <InlineSpan>[];
    var cursor = 0;
    for (final match in _marker.allMatches(widget.sentence)) {
      if (match.start > cursor) {
        spans.add(TextSpan(text: widget.sentence.substring(cursor, match.start)));
      }
      final isTerms = match[1] == 'terms';
      // A span with a recognizer already reaches a screen reader as a link
      // with a tap action, so only the visual cue was missing.
      spans.add(
        TextSpan(
          text: isTerms ? widget.termsLabel : widget.privacyLabel,
          style: link,
          recognizer: isTerms ? _terms : _privacy,
        ),
      );
      cursor = match.end;
    }
    if (cursor < widget.sentence.length) {
      spans.add(TextSpan(text: widget.sentence.substring(cursor)));
    }
    return Text.rich(
      TextSpan(children: spans),
      textAlign: TextAlign.center,
      style: base,
    );
  }
}
