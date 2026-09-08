import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/app/router/not_found_screen.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';

///
/// Built once by App. The redirect keeps every route behind the splash until
/// startup succeeds, then returns to the location the user asked for.
/// An auth guard, when a project adds one, is a second clause here reading
/// the session repository.
///
GoRouter createRouter(AppStartupCubit startup, {required Listenable refreshListenable}) {
  final splashPath = const SplashRoute().location;
  return GoRouter(
    initialLocation: const HomeRoute().location,
    refreshListenable: refreshListenable,
    redirect: (context, state) {
      final ready = startup.state is StartupSuccess;
      final onSplash = state.matchedLocation == splashPath;
      if (!ready) {
        return onSplash ? null : SplashRoute(from: state.uri.toString()).location;
      }
      if (onSplash) {
        return state.uri.queryParameters['from'] ?? const HomeRoute().location;
      }
      return null;
    },
    routes: $appRoutes,
    errorBuilder: (context, state) => NotFoundScreen(uri: state.uri),
  );
}
