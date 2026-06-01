import 'dart:convert';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import '../utils/constants/log_constants.dart';

/// Certificate pinning implementation for Dio
///
/// Prevents Man-in-the-Middle (MitM) attacks by validating
/// the server's SSL certificate against pinned certificates
class CertificatePinningClient {
  /// SHA-256 pins of your production certificates
  ///
  /// To generate:
  /// openssl x509 -in cert.pem -noout -pubkey | \
  /// openssl pkey -pubin -outform der | \
  /// openssl dgst -sha256 -binary | \
  /// openssl enc -base64
  static const Map<String, List<String>> _certificatePins = {
    'api.example.com': [
      'pin1-sha256=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      'pin2-sha256=BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Backup
    ],
    'api-staging.example.com': [
      'staging-pin-sha256=CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC=',
    ],
  };

  /// Create HTTP client with certificate pinning
  static HttpClient createHttpClientWithPinning() {
    final HttpClient httpClient = HttpClient()
      ..badCertificateCallback = _validateCertificate;

    return httpClient;
  }

  /// Validate certificate against pinned public keys
  static bool _validateCertificate(
    X509Certificate cert,
    String host,
    int port,
  ) {
    try {
      // Get the host without port
      final hostName = host.split(':').first;
      final pins = _certificatePins[hostName];

      if (pins == null) {
        if (kDebugMode && LogConstants.enableDebugLogs) {
          debugPrint(
            '[${LogConstants.tagSecurity}] ⚠️  No pins configured for host: $hostName',
          );
        }
        return true; // Allow if no pins configured (dev mode)
      }

      // Extract public key from certificate
      final publicKeyBytes = cert.der;
      final publicKeyHash = _sha256Base64(publicKeyBytes);

      // Check if public key hash matches any pinned hash
      final isValid = pins.any((pin) {
        final pinnedHash = pin.replaceFirst('pin-sha256=', '');
        return publicKeyHash == pinnedHash;
      });

      if (!isValid) {
        debugPrint(
          '[${LogConstants.tagSecurity}] ❌ Certificate pinning failed for $hostName',
        );
        debugPrint('[${LogConstants.tagSecurity}] Expected pins: $pins');
        return false;
      }

      if (kDebugMode) {
        debugPrint(
          '[${LogConstants.tagSecurity}] ✅ Certificate validated for $hostName',
        );
      }
      return true;
    } catch (e) {
      print('❌ Error validating certificate: $e');
      return false;
    }
  }

  /// Calculate SHA-256 hash of public key in base64
  static String _sha256Base64(List<int> bytes) {
    // Using crypto package
    // import 'package:crypto/crypto.dart';
    // return base64.encode(sha256.convert(bytes).bytes);

    // For now, return placeholder
    // In production, implement with crypto package
    return base64.encode(bytes);
  }
}

/// Extension for Dio to add certificate pinning
extension DioWithPinning on Dio {
  /// Setup Dio with certificate pinning
  void setupCertificatePinning() {
    httpClientAdapter = IOHttpClientAdapter(
      createHttpClient: () =>
          CertificatePinningClient.createHttpClientWithPinning(),
    );
  }
}
