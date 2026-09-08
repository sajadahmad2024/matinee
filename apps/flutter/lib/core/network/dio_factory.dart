import 'package:dio/dio.dart';
import 'package:matinee/core/config/env.dart';

///
/// One Dio per app, registered in get_it. An AuthInterceptor, when a project
/// adds auth, is added here as a QueuedInterceptor so token refreshes serialise.
///
Dio createDio(Env env) {
  final dio = Dio(
    BaseOptions(
      baseUrl: env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 20),
    ),
  );
  if (env.flavor != AppFlavor.prod) {
    // Headers stay out of the log so a future Authorization header never leaks.
    dio.interceptors.add(LogInterceptor(requestHeader: false, responseHeader: false));
  }
  return dio;
}
