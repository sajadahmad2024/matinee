import 'package:flutter/foundation.dart';

///
/// A country the sign-in form accepts a number for. The design draws only +91
/// behind a chevron, so which countries the menu offers is a product decision
/// rather than a design one; [digits] is what the number's length is validated
/// against once the country is chosen.
///
@immutable
class DialCode {
  const DialCode({required this.code, required this.countryCode, required this.digits});

  final String code;

  /// ISO 3166-1 alpha-2, used to look the country's name up in the strings.
  final String countryCode;

  final int digits;

  @override
  bool operator ==(Object other) => other is DialCode && other.countryCode == countryCode;

  @override
  int get hashCode => countryCode.hashCode;
}

abstract final class DialCodes {
  static const DialCode india = DialCode(code: '+91', countryCode: 'IN', digits: 10);

  static const List<DialCode> all = [
    india,
    DialCode(code: '+1', countryCode: 'US', digits: 10),
    DialCode(code: '+44', countryCode: 'GB', digits: 10),
    DialCode(code: '+61', countryCode: 'AU', digits: 9),
    DialCode(code: '+65', countryCode: 'SG', digits: 8),
    DialCode(code: '+971', countryCode: 'AE', digits: 9),
  ];
}
