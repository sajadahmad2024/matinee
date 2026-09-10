///
/// Where the Terms and Privacy rows go.
///
/// PLACEHOLDER. The documents are not published yet, so both point at the same
/// stand-in. They are named here rather than written into the two screens that
/// link to them, so replacing them is one edit and so that grepping for a
/// placeholder finds one place instead of two string literals.
///
abstract final class AppLegalLinks {
  static final Uri terms = Uri.parse(_placeholder);
  static final Uri privacy = Uri.parse(_placeholder);

  static const String _placeholder = 'https://google.com';
}
