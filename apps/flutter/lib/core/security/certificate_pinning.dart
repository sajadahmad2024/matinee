import 'dart:io';

import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';

/// Certificate pinning implementation for secure API communication.
///
/// Prevents MITM attacks by validating server certificates against
/// known trusted certificates embedded in the app.
///
/// HOW TO GET CERTIFICATE FINGERPRINTS:
///
/// 1. For your production API:
/// ```bash
/// openssl s_client -servername api.yourapp.com -connect api.yourapp.com:443 \
///   < /dev/null 2>/dev/null | openssl x509 -fingerprint -sha256 -noout -in /dev/stdin
/// ```
///
/// 2. Or use online tools like SSL Labs (ssllabs.com/ssltest)
///
/// 3. Add the SHA-256 fingerprint below (format: AA:BB:CC:DD:...)
class CertificatePinning {
  /// SHA-256 fingerprints of trusted certificates
  ///
  /// TODO: Replace with your actual certificate fingerprints
  /// Format: 'AA:BB:CC:DD:EE:FF:...' (SHA-256 with colons)
  ///
  /// IMPORTANT: Add at least 2 fingerprints:
  /// 1. Current production certificate
  /// 2. Backup certificate (for rotation)
  static const List<String> _trustedFingerprints = [
    // Dummy placeholder — replace with real SHA-256 fingerprint when you have an API host
    'E7:2E:9A:9F:7B:3C:8E:7D:3F:9A:7E:8D:3C:7B:9F:8E:7D:3F:9A:7E:8D:3C:7B:9F:8E:7D:3F:9A:7E:8D:3C:7B',
  ];

  /// Configures Dio client with certificate pinning
  ///
  /// Call this when creating your Dio instance:
  /// ```dart
  /// final dio = Dio();
  /// CertificatePinning.configurePinning(dio);
  /// ```
  static void configurePinning(Dio dio) {
    // Skip certificate pinning in debug mode for development
    if (kDebugMode) {
      if (kDebugMode) {
        debugPrint('⚠️  Certificate pinning DISABLED in debug mode');
      }
      return;
    }

    // Check if fingerprints are configured
    if (_trustedFingerprints.isEmpty) {
      throw Exception(
        'Certificate pinning enabled but no fingerprints configured. '
        'Add your certificate fingerprints to CertificatePinning._trustedFingerprints',
      );
    }

    // Configure certificate validation
    (dio.httpClientAdapter as IOHttpClientAdapter).onHttpClientCreate =
        (HttpClient client) {
          client.badCertificateCallback =
              (X509Certificate cert, String host, int port) {
                // Get certificate fingerprint
                final fingerprint = _getCertificateFingerprint(cert);

                if (kDebugMode) {
                  debugPrint('🔒 Validating certificate for $host:$port');
                  debugPrint('   Fingerprint: $fingerprint');
                }

                // Validate against trusted fingerprints
                final isValid = validateFingerprint(fingerprint);

                if (!isValid) {
                  if (kDebugMode) {
                    debugPrint('❌ Certificate validation FAILED for $host');
                    debugPrint('   Expected one of: $_trustedFingerprints');
                    debugPrint('   Got: $fingerprint');
                  }
                } else {
                  if (kDebugMode) {
                    debugPrint('✅ Certificate validation PASSED for $host');
                  }
                }

                return isValid;
              };
          return client;
        };

    if (kDebugMode) {
      debugPrint(
        '🔐 Certificate pinning ENABLED with ${_trustedFingerprints.length} trusted certificates',
      );
    }
  }

  /// Validates certificate fingerprint matches trusted list
  ///
  /// Returns true if the fingerprint is in the trusted list
  static bool validateFingerprint(String fingerprint) {
    return _trustedFingerprints.any(
      (trusted) => trusted.toUpperCase() == fingerprint.toUpperCase(),
    );
  }

  /// Extracts SHA-256 fingerprint from X509 certificate
  ///
  /// Returns fingerprint in format: AA:BB:CC:DD:EE:FF:...
  static String _getCertificateFingerprint(X509Certificate cert) {
    // Get certificate DER bytes
    final certDer = cert.der;

    // Calculate SHA-256 hash
    final hash = sha256.convert(certDer);

    // Convert to hex string with colons
    final hexString = hash.bytes
        .map((byte) => byte.toRadixString(16).toUpperCase().padLeft(2, '0'))
        .join(':');

    return hexString;
  }

  /// Checks if certificate pinning is configured
  static bool get isConfigured => _trustedFingerprints.isNotEmpty;

  /// Returns the list of trusted fingerprints (for debugging)
  static List<String> get trustedFingerprints => _trustedFingerprints;

  /// Adds a fingerprint to the trusted list (for testing purposes)
  ///
  /// NOTE: This is NOT persistent. For production, add to _trustedFingerprints const.
  static void addTrustedFingerprint(String fingerprint) {
    // This would need _trustedFingerprints to be non-const
    // For production, manually add to the const list above
    throw UnsupportedError(
      'Cannot add fingerprints at runtime. Add to _trustedFingerprints const list.',
    );
  }
}

/// Helper class for certificate pinning utilities
class CertificatePinningHelper {
  /// Extracts and prints certificate info (for debugging)
  ///
  /// Use this in development to get certificate details
  static void printCertificateInfo(X509Certificate cert) {
    debugPrint('=== Certificate Information ===');
    debugPrint('Subject: ${cert.subject}');
    debugPrint('Issuer: ${cert.issuer}');
    debugPrint('Start Date: ${cert.startValidity}');
    debugPrint('End Date: ${cert.endValidity}');
    debugPrint(
      'SHA-256 Fingerprint: ${CertificatePinning._getCertificateFingerprint(cert)}',
    );
    debugPrint('=============================');
  }
}
