# Router: typed routes, startup redirect, not-found

Copy these files exactly. Replace `template` with the package name from `pubspec.yaml`.

Rules that apply to every route in the app:

- Routes are `GoRouteData` classes annotated with `@TypedGoRoute`; navigation is `const SomeRoute().go(context)` or `SomeRoute(id: x).push(context)`. Never a path string, never `goNamed`.
- Resource identifiers travel in the path (`/orders/:id`), filters in query parameters. `extra` is never used; it breaks deep links and web.
- `go()` by default; `push()` only when the caller awaits a result.
- Guards are `redirect` functions reading a repository or cubit, never widget-level checks.

## `lib/app/router/app_routes.dart`

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:template/app/startup/splash_screen.dart';
import 'package:template/features/home/presentation/home_screen.dart';

part 'app_routes.g.dart';

@TypedGoRoute<SplashRoute>(path: '/splash')
class SplashRoute extends GoRouteData with $SplashRoute {
  const SplashRoute({this.from});

  // Where to return once startup completes, so a cold-start deep link is not lost.
  final String? from;

  @override
  Widget build(BuildContext context, GoRouterState state) => const SplashScreen();
}

@TypedGoRoute<HomeRoute>(path: '/')
class HomeRoute extends GoRouteData with $HomeRoute {
  const HomeRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const HomeScreen();
}
```

Every feature adds its route class here and re-runs `build_runner`. The generated `app_routes.g.dart` is committed and never edited.

## `lib/app/router/stream_listenable.dart`

```dart
import 'dart:async';

import 'package:flutter/foundation.dart';

///
/// Adapts a Stream to the Listenable go_router expects for refreshListenable.
/// go_router dropped its own stream adapter years ago, so this is the app's.
///
final class StreamListenable extends ChangeNotifier {
  StreamListenable(Stream<Object?> stream) {
    _subscription = stream.listen((_) => notifyListeners());
  }

  late final StreamSubscription<Object?> _subscription;

  @override
  void dispose() {
    unawaited(_subscription.cancel());
    super.dispose();
  }
}
```

## `lib/app/router/app_router.dart`

```dart
import 'package:flutter/foundation.dart';
import 'package:go_router/go_router.dart';
import 'package:template/app/router/app_routes.dart';
import 'package:template/app/router/not_found_screen.dart';
import 'package:template/app/startup/app_startup_cubit.dart';
import 'package:template/app/startup/app_startup_state.dart';

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
```

## `lib/app/router/not_found_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:template/app/router/app_routes.dart';
import 'package:template/core/l10n/l10n.dart';
import 'package:template/core/widgets/error_view.dart';

class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({required this.uri, super.key});

  final Uri uri;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ErrorView(
        message: context.l10n.pageNotFound(uri.path),
        actionLabel: context.l10n.goHome,
        onRetry: () => const HomeRoute().go(context),
      ),
    );
  }
}
```

## `lib/features/home/presentation/home_screen.dart`

The first route needs a screen. This placeholder is replaced by the first real feature.

```dart
import 'package:flutter/material.dart';
import 'package:template/core/l10n/l10n.dart';
import 'package:template/core/responsive/responsive.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.l10n.appTitle)),
      body: ContentContainer(
        child: Center(child: Text(context.l10n.homePlaceholder)),
      ),
    );
  }
}
```

## Testing routes

Redirect logic is tested by constructing `createRouter` with a real `AppStartupCubit` over `GetIt.asNewInstance()` and pumping `MaterialApp.router`: before `start()` completes the `SplashScreen` is shown; after it, `HomeScreen`. Widget tests of screens that navigate mock the router by wrapping the widget in `InheritedGoRouter(goRouter: mockRouter, child: ...)` with a private `_MockGoRouter extends Mock implements GoRouter`.
