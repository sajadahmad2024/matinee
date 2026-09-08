import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/startup/splash_screen.dart';
import 'package:matinee/features/home/presentation/home_screen.dart';

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
