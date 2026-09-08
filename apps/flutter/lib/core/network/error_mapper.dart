import 'package:dio/dio.dart';
import 'package:template/core/error/app_exception.dart';

///
/// Runs one API call and converts any DioException into the matching
/// AppException. Repositories wrap every client call in this, so the mapping
/// lives, and is tested, in exactly one place.
///
Future<T> guardApi<T>(Future<T> Function() call) async {
  try {
    return await call();
  } on DioException catch (e) {
    throw mapDioException(e);
  }
}

AppException mapDioException(DioException e) {
  return switch (e.type) {
    DioExceptionType.cancel => const CancelledException(),
    DioExceptionType.badResponse => _fromResponse(e),
    DioExceptionType.connectionTimeout ||
    DioExceptionType.sendTimeout ||
    DioExceptionType.receiveTimeout ||
    DioExceptionType.transformTimeout ||
    DioExceptionType.badCertificate ||
    DioExceptionType.connectionError ||
    DioExceptionType.unknown => const NetworkException(),
  };
}

AppException _fromResponse(DioException e) {
  final code = e.response?.statusCode ?? 0;
  return switch (code) {
    401 || 403 => AuthException(code),
    404 => const NotFoundException(),
    >= 400 && < 500 => ValidationException(code),
    _ => ServerException(code),
  };
}
