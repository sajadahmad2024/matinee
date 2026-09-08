enum AppFlavor { dev, staging, prod }

///
/// Build-time configuration for one flavor. Nothing secret lives here; secrets
/// come from the backend at runtime. Each entry point passes one Env to bootstrap.
///
final class Env {
  const Env({required this.flavor, required this.apiBaseUrl});

  final AppFlavor flavor;
  final String apiBaseUrl;

  static const dev = Env(flavor: AppFlavor.dev, apiBaseUrl: 'https://dev.api.example.com');
  static const staging = Env(flavor: AppFlavor.staging, apiBaseUrl: 'https://staging.api.example.com');
  static const prod = Env(flavor: AppFlavor.prod, apiBaseUrl: 'https://api.example.com');

  // Supplied with --dart-define=SENTRY_DSN=... so dev builds never report and
  // the value is not in source control.
  static const _sentryDsn = String.fromEnvironment('SENTRY_DSN');

  String? get sentryDsn => _sentryDsn.isEmpty ? null : _sentryDsn;
}
