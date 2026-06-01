import 'package:url_launcher/url_launcher.dart';
import 'package:flutter/foundation.dart';

/// URL helper utility class
///
/// Provides methods for launching URLs, emails, phone calls, etc.
///
/// USAGE EXAMPLES:
///
/// Example 1: Open URL in browser
/// ```dart
/// ElevatedButton(
///   onPressed: () async {
///     await UrlHelper.openUrl('https://flutter.dev');
///   },
///   child: Text('Open Flutter Website'),
/// )
/// ```
///
/// Example 2: Send email
/// ```dart
/// ElevatedButton(
///   onPressed: () async {
///     await UrlHelper.sendEmail(
///       email: 'support@example.com',
///       subject: 'App Feedback',
///       body: 'I love this app!',
///     );
///   },
///   child: Text('Send Feedback'),
/// )
/// ```
///
/// Example 3: Make phone call
/// ```dart
/// ElevatedButton(
///   onPressed: () async {
///     await UrlHelper.makePhoneCall('+1234567890');
///   },
///   child: Text('Call Support'),
/// )
/// ```
///
/// Example 4: Open maps
/// ```dart
/// ElevatedButton(
///   onPressed: () async {
///     await UrlHelper.openMaps(
///       latitude: 37.7749,
///       longitude: -122.4194,
///       label: 'San Francisco',
///     );
///   },
///   child: Text('Open in Maps'),
/// )
/// ```
class UrlHelper {
  UrlHelper._();

  /// Open URL in browser
  ///
  /// [url] - The URL to open
  /// [inApp] - Whether to open in app browser (if available)
  static Future<bool> openUrl(String url, {bool inApp = false}) async {
    try {
      final uri = Uri.parse(url);
      final mode = inApp
          ? LaunchMode.inAppWebView
          : LaunchMode.externalApplication;

      if (await canLaunchUrl(uri)) {
        return await launchUrl(uri, mode: mode);
      } else {
        if (kDebugMode) {
          debugPrint('Could not launch $url');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error launching URL: $e');
      }
      return false;
    }
  }

  /// Send email
  ///
  /// [email] - Recipient email address
  /// [subject] - Email subject
  /// [body] - Email body
  /// [cc] - CC recipients (optional)
  /// [bcc] - BCC recipients (optional)
  static Future<bool> sendEmail({
    required String email,
    String? subject,
    String? body,
    List<String>? cc,
    List<String>? bcc,
  }) async {
    try {
      final StringBuffer emailUrl = StringBuffer('mailto:$email');

      final params = <String, String>{};

      if (subject != null) params['subject'] = subject;
      if (body != null) params['body'] = body;
      if (cc != null && cc.isNotEmpty) params['cc'] = cc.join(',');
      if (bcc != null && bcc.isNotEmpty) params['bcc'] = bcc.join(',');

      if (params.isNotEmpty) {
        emailUrl.write('?');
        emailUrl.write(
          params.entries
              .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
              .join('&'),
        );
      }

      final uri = Uri.parse(emailUrl.toString());

      if (await canLaunchUrl(uri)) {
        return await launchUrl(uri);
      } else {
        if (kDebugMode) {
          debugPrint('Could not launch email');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error sending email: $e');
      }
      return false;
    }
  }

  /// Make phone call
  ///
  /// [phoneNumber] - Phone number to call (with country code)
  static Future<bool> makePhoneCall(String phoneNumber) async {
    try {
      final uri = Uri.parse('tel:$phoneNumber');

      if (await canLaunchUrl(uri)) {
        return await launchUrl(uri);
      } else {
        if (kDebugMode) {
          debugPrint('Could not launch phone call');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error making phone call: $e');
      }
      return false;
    }
  }

  /// Send SMS
  ///
  /// [phoneNumber] - Phone number to send SMS to
  /// [message] - SMS message body
  static Future<bool> sendSMS(String phoneNumber, {String? message}) async {
    try {
      final StringBuffer smsUrl = StringBuffer('sms:$phoneNumber');

      if (message != null) {
        smsUrl.write('?body=${Uri.encodeComponent(message)}');
      }

      final uri = Uri.parse(smsUrl.toString());

      if (await canLaunchUrl(uri)) {
        return await launchUrl(uri);
      } else {
        if (kDebugMode) {
          debugPrint('Could not launch SMS');
        }
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error sending SMS: $e');
      }
      return false;
    }
  }

  /// Open maps with coordinates
  ///
  /// [latitude] - Latitude coordinate
  /// [longitude] - Longitude coordinate
  /// [label] - Location label (optional)
  static Future<bool> openMaps({
    required double latitude,
    required double longitude,
    String? label,
  }) async {
    try {
      final String mapsUrl;

      if (defaultTargetPlatform == TargetPlatform.iOS) {
        // Apple Maps
        mapsUrl = 'https://maps.apple.com/?q=$latitude,$longitude';
      } else {
        // Google Maps
        mapsUrl = label != null
            ? 'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude&query_place_id=$label'
            : 'https://www.google.com/maps/search/?api=1&query=$latitude,$longitude';
      }

      return await openUrl(mapsUrl);
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Error opening maps: $e');
      }
      return false;
    }
  }
}
