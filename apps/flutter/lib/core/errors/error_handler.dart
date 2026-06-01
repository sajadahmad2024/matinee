import 'package:flutter/material.dart';
import 'exceptions.dart';

/// Global error handler utility
///
/// Provides helper methods to handle errors consistently across the app.
///
/// USAGE EXAMPLES:
///
/// Example 1: Handle exception in repository
/// ```dart
/// class UserRepository {
///   Future<User> getUser(String id) async {
///     try {
///       final response = await apiClient.get('/users/$id');
///       return User.fromJson(response.data);
///     } catch (e) {
///       // Convert any error to appropriate exception
///       throw ErrorHandler.handleError(e);
///     }
///   }
/// }
/// ```
///
/// Example 2: Show error message in UI
/// ```dart
/// class UserPage extends StatelessWidget {
///   @override
///   Widget build(BuildContext context) {
///     return BlocListener<UserBloc, UserState>(
///       listener: (context, state) {
///         if (state is UserError) {
///           // Show user-friendly error message
///           ErrorHandler.showErrorSnackBar(context, state.exception);
///         }
///       },
///       child: ...,
///     );
///   }
/// }
/// ```
///
/// Example 3: Get user-friendly message
/// ```dart
/// try {
///   await repository.deleteUser(userId);
/// } catch (e) {
///   final message = ErrorHandler.getErrorMessage(e);
///   print(message); // "No internet connection" or "Server error" etc.
/// }
/// ```
class ErrorHandler {
  ErrorHandler._();

  /// Convert any error to appropriate AppException
  ///
  /// This helps standardize error handling throughout the app
  static AppException handleError(dynamic error) {
    if (error is AppException) {
      // Already an AppException, return as is
      return error;
    } else if (error is Exception) {
      // Generic exception, wrap it
      final message = error.toString().replaceAll('Exception: ', '');
      return ServerException(message);
    } else {
      // Unknown error type
      return ServerException(error.toString());
    }
  }

  /// Get user-friendly error message
  ///
  /// Converts technical exceptions to readable messages for users
  static String getErrorMessage(dynamic error) {
    if (error is ServerException) {
      return error.message.isNotEmpty
          ? error.message
          : 'Server error. Please try again.';
    } else if (error is NetworkException) {
      return 'No internet connection. Please check your network.';
    } else if (error is CacheException) {
      return 'Local storage error. Please try again.';
    } else if (error is AuthException) {
      return error.message.isNotEmpty
          ? error.message
          : 'Authentication failed.';
    } else if (error is ValidationException) {
      return error.message;
    } else if (error is RequestTimeoutException) {
      return 'Request timeout. Please try again.';
    } else if (error is AppException) {
      return error.message;
    } else {
      return 'An unexpected error occurred.';
    }
  }

  /// Show error message as SnackBar
  ///
  /// Quick way to display errors to users
  static void showErrorSnackBar(BuildContext context, dynamic error) {
    final message = getErrorMessage(error);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'Dismiss',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }

  /// Show error dialog
  ///
  /// For more serious errors that need user attention
  static void showErrorDialog(
    BuildContext context,
    dynamic error, {
    String? title,
    VoidCallback? onRetry,
  }) {
    final message = getErrorMessage(error);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title ?? 'Error'),
        content: Text(message),
        actions: [
          if (onRetry != null)
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                onRetry();
              },
              child: const Text('Retry'),
            ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  /// Check if error is network-related
  ///
  /// Useful for deciding whether to show offline UI
  static bool isNetworkError(dynamic error) {
    return error is NetworkException || error is RequestTimeoutException;
  }

  /// Check if error is authentication-related
  ///
  /// Useful for auto-logout logic
  static bool isAuthError(dynamic error) {
    return error is AuthException;
  }
}
