import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/startup/splash_screen.dart';
import 'package:matinee/features/auth/presentation/create_account_screen.dart';
import 'package:matinee/features/auth/presentation/sign_in_screen.dart';
import 'package:matinee/features/auth/presentation/subscribe_screen.dart';
import 'package:matinee/features/auth/presentation/verify_otp_screen.dart';
import 'package:matinee/features/home/presentation/home_screen.dart';
import 'package:matinee/features/onboarding/presentation/onboarding_screen.dart';

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

@TypedGoRoute<OnboardingRoute>(path: '/onboarding')
class OnboardingRoute extends GoRouteData with $OnboardingRoute {
  const OnboardingRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const OnboardingScreen();
}

@TypedGoRoute<SignInRoute>(
  path: '/sign-in',
  routes: [
    TypedGoRoute<VerifyOtpRoute>(path: 'verify-otp/:dialCode/:phoneNumber'),
    TypedGoRoute<CreateAccountRoute>(path: 'create-account'),
  ],
)
class SignInRoute extends GoRouteData with $SignInRoute {
  const SignInRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const SignInScreen();
}

class VerifyOtpRoute extends GoRouteData with $VerifyOtpRoute {
  const VerifyOtpRoute({required this.dialCode, required this.phoneNumber});

  // The dialling code without its '+', which has no place in a path segment.
  final String dialCode;

  // The number the code went to, shown on the screen and sent back with it.
  final String phoneNumber;

  @override
  Widget build(BuildContext context, GoRouterState state) =>
      VerifyOtpScreen(dialCode: dialCode, phoneNumber: phoneNumber);
}

class CreateAccountRoute extends GoRouteData with $CreateAccountRoute {
  const CreateAccountRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const CreateAccountScreen();
}

@TypedGoRoute<SubscribeRoute>(path: '/subscribe')
class SubscribeRoute extends GoRouteData with $SubscribeRoute {
  const SubscribeRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const SubscribeScreen();
}
