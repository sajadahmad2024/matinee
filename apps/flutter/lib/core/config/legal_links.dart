///
/// Where the Terms and Privacy rows go.
///
/// PLACEHOLDER: the documents are not published, so both point at one stand-in.
/// Naming them here keeps the replacement to a single edit, and greppable.
///
abstract final class AppLegalLinks {
  static final Uri terms = Uri.parse(_placeholder);
  static final Uri privacy = Uri.parse(_placeholder);

  static const String _placeholder = 'https://google.com';
}
