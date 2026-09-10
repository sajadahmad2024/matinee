import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/app/router/not_found_screen.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';

///
/// Built once by App. The redirect holds every route behind the splash until
/// startup succeeds; an auth guard would be a second clause here.
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
        // TEMPORARY, FOR DEMOS: the intro lands every launch, so the whole flow
        // is visible. Ignores the 'from' deep link the commented clause honours.
        return const OnboardingRoute().location;
        // return state.uri.queryParameters['from'] ?? const HomeRoute().location;
      }
      return null;
    },
    routes: $appRoutes,
    errorBuilder: (context, state) => NotFoundScreen(uri: state.uri),
  );
}
