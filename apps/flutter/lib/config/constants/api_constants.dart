/// API endpoint constants
///
/// This file contains all API endpoints used throughout the app.
/// Organize endpoints by feature/module for better maintainability.
class ApiConstants {
  // Prevent instantiation
  ApiConstants._();

  // API Versions
  static const String apiVersion = 'v1';

  // Base Endpoint
  static const String baseEndpoint = '/api/$apiVersion';

  // ========== Auth Endpoints ==========
  static const String login = '$baseEndpoint/auth/login';
  static const String register = '$baseEndpoint/auth/register';
  static const String logout = '$baseEndpoint/auth/logout';
  static const String refreshToken = '$baseEndpoint/auth/refresh';
  static const String forgotPassword = '$baseEndpoint/auth/forgot-password';
  static const String resetPassword = '$baseEndpoint/auth/reset-password';
  static const String verifyOtp = '$baseEndpoint/auth/verify-otp';
  static const String resendOtp = '$baseEndpoint/auth/resend-otp';

  // ========== User Endpoints ==========
  static const String userProfile = '$baseEndpoint/user/profile';
  static const String updateProfile = '$baseEndpoint/user/profile';
  static const String changePassword = '$baseEndpoint/user/change-password';
  static const String deleteAccount = '$baseEndpoint/user/account';

  // ========== Home/Dashboard Endpoints ==========
  static const String dashboard = '$baseEndpoint/dashboard';
  static const String posts = '$baseEndpoint/posts';

  // Dynamic endpoint builders
  static String postById(String id) => '$baseEndpoint/posts/$id';
  static String userById(String id) => '$baseEndpoint/users/$id';

  // ========== Settings Endpoints ==========
  static const String appSettings = '$baseEndpoint/settings';
  static const String notifications = '$baseEndpoint/notifications';

  // ========== Upload Endpoints ==========
  static const String uploadImage = '$baseEndpoint/upload/image';
  static const String uploadFile = '$baseEndpoint/upload/file';
}
