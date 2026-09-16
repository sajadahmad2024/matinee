import 'package:flutter/material.dart';

///
/// Splits [sentence] around [emphasis] so that run can carry [emphasisStyle]
/// while the rest inherits the surrounding style.
///
List<TextSpan> emphasise(String sentence, String? emphasis, TextStyle? emphasisStyle) {
  if (emphasis == null || emphasis.isEmpty) {
    return [TextSpan(text: sentence)];
  }
  final at = sentence.indexOf(emphasis);
  if (at < 0) {
    return [TextSpan(text: sentence)];
  }
  return [
    TextSpan(text: sentence.substring(0, at)),
    TextSpan(text: emphasis, style: emphasisStyle),
    TextSpan(text: sentence.substring(at + emphasis.length)),
  ];
}
