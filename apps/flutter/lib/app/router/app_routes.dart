import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:matinee/app/shell/app_shell.dart';
import 'package:matinee/app/startup/splash_screen.dart';
import 'package:matinee/features/auth/presentation/create_account_screen.dart';
import 'package:matinee/features/auth/presentation/sign_in_screen.dart';
import 'package:matinee/features/auth/presentation/subscribe_screen.dart';
import 'package:matinee/features/auth/presentation/verify_otp_screen.dart';
import 'package:matinee/features/home/presentation/home_screen.dart';
import 'package:matinee/features/onboarding/presentation/onboarding_screen.dart';
import 'package:matinee/features/p2p/presentation/p2p_screen.dart';
import 'package:matinee/features/profile/presentation/edit_profile_screen.dart';
import 'package:matinee/features/profile/presentation/profile_screen.dart';
import 'package:matinee/features/rewards/presentation/auction_screen.dart';
import 'package:matinee/features/rewards/presentation/exclusive_library_screen.dart';
import 'package:matinee/features/rewards/presentation/rewards_screen.dart';
import 'package:matinee/features/rewards/presentation/unlock_content_screen.dart';

part 'app_routes.g.dart';

@TypedGoRoute<SplashRoute>(path: '/splash')
class SplashRoute extends GoRouteData with $SplashRoute {
  const SplashRoute({this.from});

  // Where to return once startup completes, so a cold-start deep link is not lost.
  final String? from;

  @override
  Widget build(BuildContext context, GoRouterState state) => const SplashScreen();
}

///
/// The signed-in skeleton. Every tab is a branch with its own Navigator, so a
/// screen pushed inside one is still there after a trip to another.
///
@TypedStatefulShellRoute<AppShellRoute>(
  branches: [
    TypedStatefulShellBranch<HomeBranch>(routes: [TypedGoRoute<HomeRoute>(path: '/')]),
    TypedStatefulShellBranch<P2pBranch>(routes: [TypedGoRoute<P2pRoute>(path: '/p2p')]),
    TypedStatefulShellBranch<RewardsBranch>(routes: [TypedGoRoute<RewardsRoute>(path: '/rewards')]),
    TypedStatefulShellBranch<ProfileBranch>(routes: [TypedGoRoute<ProfileRoute>(path: '/profile')]),
  ],
)
class AppShellRoute extends StatefulShellRouteData {
  const AppShellRoute();

  @override
  Widget builder(BuildContext context, GoRouterState state, StatefulNavigationShell navigationShell) =>
      AppShell(navigationShell: navigationShell);
}

class HomeBranch extends StatefulShellBranchData {
  const HomeBranch();
}

class P2pBranch extends StatefulShellBranchData {
  const P2pBranch();
}

class RewardsBranch extends StatefulShellBranchData {
  const RewardsBranch();
}

class ProfileBranch extends StatefulShellBranchData {
  const ProfileBranch();
}

class HomeRoute extends GoRouteData with $HomeRoute {
  const HomeRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const HomeScreen();
}

class P2pRoute extends GoRouteData with $P2pRoute {
  const P2pRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const P2pScreen();
}

class RewardsRoute extends GoRouteData with $RewardsRoute {
  const RewardsRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const RewardsScreen();
}

class ProfileRoute extends GoRouteData with $ProfileRoute {
  const ProfileRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const ProfileScreen();
}

///
/// Outside the shell, not under the profile branch, because the frame draws no
/// bottom nav. The path still nests so the URL and back affordance read right.
///
@TypedGoRoute<EditProfileRoute>(path: '/profile/edit')
class EditProfileRoute extends GoRouteData with $EditProfileRoute {
  const EditProfileRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const EditProfileScreen();
}

///
/// The rewards detail screens, outside the shell for the same reason edit
/// profile is: their frames draw no bottom nav, so they cover it.
///
@TypedGoRoute<AuctionRoute>(path: '/rewards/auction')
class AuctionRoute extends GoRouteData with $AuctionRoute {
  const AuctionRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const AuctionScreen();
}

@TypedGoRoute<ExclusiveLibraryRoute>(
  path: '/rewards/exclusive',
  routes: [TypedGoRoute<UnlockContentRoute>(path: ':itemId/unlock')],
)
class ExclusiveLibraryRoute extends GoRouteData with $ExclusiveLibraryRoute {
  const ExclusiveLibraryRoute();

  @override
  Widget build(BuildContext context, GoRouterState state) => const ExclusiveLibraryScreen();
}

class UnlockContentRoute extends GoRouteData with $UnlockContentRoute {
  const UnlockContentRoute({required this.itemId});

  final String itemId;

  @override
  Widget build(BuildContext context, GoRouterState state) => UnlockContentScreen(itemId: itemId);
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
