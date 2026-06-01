import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:flutter_boilerplate/config/constants/route_constants.dart';

import 'package:flutter_boilerplate/config/environment_config.dart';

import 'package:flutter_boilerplate/core/di/injection_container.dart';
import 'package:flutter_boilerplate/core/services/analytics/analytics_observer.dart';
import 'package:flutter_boilerplate/modules/auth/presentation/pages/login_page.dart';
import 'package:flutter_boilerplate/modules/auth/presentation/pages/register_page.dart';
import 'package:flutter_boilerplate/modules/home/presentation/bloc/home_bloc.dart';
import 'package:flutter_boilerplate/modules/home/presentation/screens/home_page.dart';
import 'package:go_router/go_router.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: RouteConstants.home,
    observers: _buildObservers(),
    routes: [
      GoRoute(
        path: RouteConstants.home,
        name: RouteConstants.homeName,
        builder: (context, state) => BlocProvider<HomeBloc>(
          create: (_) => getIt<HomeBloc>(),
          child: const MyHomePage(title: 'Flutter Demo Home Page'),
        ),
      ),
      GoRoute(
        path: RouteConstants.login,
        name: RouteConstants.loginName,
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: RouteConstants.register,
        name: RouteConstants.registerName,
        builder: (context, state) => const RegisterPage(),
      ),
      // Deep link routes (add as needed)
      // GoRoute(
      //   path: '/users/:userId',
      //   name: 'user-detail',
      //   builder: (context, state) {
      //     final userId = state.pathParameters['userId'] ?? '';
      //     return UserDetailPage(userId: userId);
      //   },
      // ),
      // GoRoute(
      //   path: '/posts/:postId',
      //   name: 'post-detail',
      //   builder: (context, state) {
      //     final postId = state.pathParameters['postId'] ?? '';
      //     return PostDetailPage(postId: postId);
      //   },
      // ),
      // Add more deep link routes as needed
    ],
    errorBuilder: (context, state) =>
        Scaffold(body: Center(child: Text(state.error.toString()))),
  );

  static List<NavigatorObserver> _buildObservers() {
    final env = EnvironmentConfig.instance;

    if (!env.useFirebase || !env.enableAnalytics) {
      return [];
    }

    final AnalyticsObserverProvider provider =
        getIt<AnalyticsObserverProvider>();
    final NavigatorObserver? observer = provider.observer;

    if (observer == null) {
      return [];
    }

    return [observer];
  }
}
