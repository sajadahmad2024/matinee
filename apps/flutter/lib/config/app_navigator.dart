import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

class AppNavigator {
  AppNavigator._(); // private constructor

  /// Replace entire stack
  static void go(
    BuildContext context,
    String path, {
    Map<String, String>? pathParams,
    Map<String, String>? queryParams,
    Object? extra,
  }) {
    context.go(
      _buildPath(path, pathParams),
      extra: extra,
    );
  }

  /// Push onto navigation stack
  static void push(
    BuildContext context,
    String path, {
    Map<String, String>? pathParams,
    Map<String, String>? queryParams,
    Object? extra,
  }) {
    context.push(
      _buildPath(path, pathParams),
      extra: extra,
    );
  }

  /// Named route navigation
  static void goNamed(
    BuildContext context,
    String name, {
    Map<String, String>? pathParams,
    Map<String, String>? queryParams,
    Object? extra,
  }) {
    context.goNamed(
      name,
      pathParameters: pathParams ?? const {},
      queryParameters: queryParams ?? const {},
      extra: extra,
    );
  }

  /// Pop current route
  static void pop(BuildContext context, [Object? result]) {
    context.pop(result);
  }

  /// Helper to build path with parameters
  static String _buildPath(
    String path,
    Map<String, String>? pathParams,
  ) {
    if (pathParams == null || pathParams.isEmpty) return path;

    var finalPath = path;
    pathParams.forEach((key, value) {
      finalPath = finalPath.replaceFirst(':$key', value);
    });
    return finalPath;
  }
}
