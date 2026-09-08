import 'package:dio/dio.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:template/core/error/app_exception.dart';
import 'package:template/core/network/error_mapper.dart';

DioException _badResponse(int statusCode) {
  final options = RequestOptions(path: '/x');
  return DioException.badResponse(
    statusCode: statusCode,
    requestOptions: options,
    response: Response<void>(requestOptions: options, statusCode: statusCode),
  );
}

void main() {
  group('mapDioException', () {
    test('maps a timeout to $NetworkException', () {
      final e = DioException.connectionTimeout(
        timeout: Duration.zero,
        requestOptions: RequestOptions(path: '/x'),
      );

      expect(mapDioException(e), isA<NetworkException>());
    });

    test('maps 401 and 403 to $AuthException with the status code', () {
      expect(mapDioException(_badResponse(401)), isA<AuthException>().having((e) => e.statusCode, 'statusCode', 401));
      expect(mapDioException(_badResponse(403)), isA<AuthException>().having((e) => e.statusCode, 'statusCode', 403));
    });

    test('maps 404 to $NotFoundException', () {
      expect(mapDioException(_badResponse(404)), isA<NotFoundException>());
    });

    test('maps other 4xx to $ValidationException', () {
      expect(mapDioException(_badResponse(422)), isA<ValidationException>());
    });

    test('maps 5xx to $ServerException', () {
      expect(mapDioException(_badResponse(503)), isA<ServerException>());
    });

    test('maps cancellation to $CancelledException', () {
      final e = DioException.requestCancelled(requestOptions: RequestOptions(path: '/x'), reason: null);

      expect(mapDioException(e), isA<CancelledException>());
    });
  });

  group('guardApi', () {
    test('returns the value when the call succeeds', () async {
      expect(await guardApi(() async => 42), 42);
    });

    test('rethrows a $DioException as an $AppException', () {
      expect(() => guardApi<void>(() async => throw _badResponse(500)), throwsA(isA<ServerException>()));
    });
  });
}
