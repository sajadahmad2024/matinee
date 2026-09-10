// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_routes.dart';

// **************************************************************************
// GoRouterGenerator
// **************************************************************************

List<RouteBase> get $appRoutes => [
  $splashRoute,
  $appShellRoute,
  $editProfileRoute,
  $auctionRoute,
  $exclusiveLibraryRoute,
  $onboardingRoute,
  $signInRoute,
  $subscribeRoute,
];

RouteBase get $splashRoute => GoRouteData.$route(
  path: '/splash',
  hasOverriddenOnExit: false,
  factory: $SplashRoute._fromState,
);

mixin $SplashRoute on GoRouteData {
  static SplashRoute _fromState(GoRouterState state) => SplashRoute(from: state.uri.queryParameters['from']);

  SplashRoute get _self => this as SplashRoute;

  @override
  String get location => GoRouteData.$location(
    '/splash',
    queryParams: {if (_self.from != null) 'from': _self.from},
  );

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $appShellRoute => StatefulShellRouteData.$route(
  factory: $AppShellRouteExtension._fromState,
  branches: [
    StatefulShellBranchData.$branch(
      routes: [
        GoRouteData.$route(
          path: '/',
          hasOverriddenOnExit: false,
          factory: $HomeRoute._fromState,
        ),
      ],
    ),
    StatefulShellBranchData.$branch(
      routes: [
        GoRouteData.$route(
          path: '/p2p',
          hasOverriddenOnExit: false,
          factory: $P2pRoute._fromState,
        ),
      ],
    ),
    StatefulShellBranchData.$branch(
      routes: [
        GoRouteData.$route(
          path: '/rewards',
          hasOverriddenOnExit: false,
          factory: $RewardsRoute._fromState,
        ),
      ],
    ),
    StatefulShellBranchData.$branch(
      routes: [
        GoRouteData.$route(
          path: '/profile',
          hasOverriddenOnExit: false,
          factory: $ProfileRoute._fromState,
        ),
      ],
    ),
  ],
);

extension $AppShellRouteExtension on AppShellRoute {
  static AppShellRoute _fromState(GoRouterState state) => const AppShellRoute();
}

mixin $HomeRoute on GoRouteData {
  static HomeRoute _fromState(GoRouterState state) => const HomeRoute();

  @override
  String get location => GoRouteData.$location('/');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

mixin $P2pRoute on GoRouteData {
  static P2pRoute _fromState(GoRouterState state) => const P2pRoute();

  @override
  String get location => GoRouteData.$location('/p2p');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

mixin $RewardsRoute on GoRouteData {
  static RewardsRoute _fromState(GoRouterState state) => const RewardsRoute();

  @override
  String get location => GoRouteData.$location('/rewards');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

mixin $ProfileRoute on GoRouteData {
  static ProfileRoute _fromState(GoRouterState state) => const ProfileRoute();

  @override
  String get location => GoRouteData.$location('/profile');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $editProfileRoute => GoRouteData.$route(
  path: '/profile/edit',
  hasOverriddenOnExit: false,
  factory: $EditProfileRoute._fromState,
);

mixin $EditProfileRoute on GoRouteData {
  static EditProfileRoute _fromState(GoRouterState state) => const EditProfileRoute();

  @override
  String get location => GoRouteData.$location('/profile/edit');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $auctionRoute => GoRouteData.$route(
  path: '/rewards/auction',
  hasOverriddenOnExit: false,
  factory: $AuctionRoute._fromState,
);

mixin $AuctionRoute on GoRouteData {
  static AuctionRoute _fromState(GoRouterState state) => const AuctionRoute();

  @override
  String get location => GoRouteData.$location('/rewards/auction');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $exclusiveLibraryRoute => GoRouteData.$route(
  path: '/rewards/exclusive',
  hasOverriddenOnExit: false,
  factory: $ExclusiveLibraryRoute._fromState,
  routes: [
    GoRouteData.$route(
      path: ':itemId/unlock',
      hasOverriddenOnExit: false,
      factory: $UnlockContentRoute._fromState,
    ),
  ],
);

mixin $ExclusiveLibraryRoute on GoRouteData {
  static ExclusiveLibraryRoute _fromState(GoRouterState state) => const ExclusiveLibraryRoute();

  @override
  String get location => GoRouteData.$location('/rewards/exclusive');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

mixin $UnlockContentRoute on GoRouteData {
  static UnlockContentRoute _fromState(GoRouterState state) =>
      UnlockContentRoute(itemId: state.pathParameters['itemId']!);

  UnlockContentRoute get _self => this as UnlockContentRoute;

  @override
  String get location => GoRouteData.$location(
    '/rewards/exclusive/${Uri.encodeComponent(_self.itemId)}/unlock',
  );

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $onboardingRoute => GoRouteData.$route(
  path: '/onboarding',
  hasOverriddenOnExit: false,
  factory: $OnboardingRoute._fromState,
);

mixin $OnboardingRoute on GoRouteData {
  static OnboardingRoute _fromState(GoRouterState state) => const OnboardingRoute();

  @override
  String get location => GoRouteData.$location('/onboarding');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $signInRoute => GoRouteData.$route(
  path: '/sign-in',
  hasOverriddenOnExit: false,
  factory: $SignInRoute._fromState,
  routes: [
    GoRouteData.$route(
      path: 'verify-otp/:dialCode/:phoneNumber',
      hasOverriddenOnExit: false,
      factory: $VerifyOtpRoute._fromState,
    ),
    GoRouteData.$route(
      path: 'create-account',
      hasOverriddenOnExit: false,
      factory: $CreateAccountRoute._fromState,
    ),
  ],
);

mixin $SignInRoute on GoRouteData {
  static SignInRoute _fromState(GoRouterState state) => const SignInRoute();

  @override
  String get location => GoRouteData.$location('/sign-in');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

mixin $VerifyOtpRoute on GoRouteData {
  static VerifyOtpRoute _fromState(GoRouterState state) => VerifyOtpRoute(
    dialCode: state.pathParameters['dialCode']!,
    phoneNumber: state.pathParameters['phoneNumber']!,
  );

  VerifyOtpRoute get _self => this as VerifyOtpRoute;

  @override
  String get location => GoRouteData.$location(
    '/sign-in/verify-otp/${Uri.encodeComponent(_self.dialCode)}/${Uri.encodeComponent(_self.phoneNumber)}',
  );

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

mixin $CreateAccountRoute on GoRouteData {
  static CreateAccountRoute _fromState(GoRouterState state) => const CreateAccountRoute();

  @override
  String get location => GoRouteData.$location('/sign-in/create-account');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $subscribeRoute => GoRouteData.$route(
  path: '/subscribe',
  hasOverriddenOnExit: false,
  factory: $SubscribeRoute._fromState,
);

mixin $SubscribeRoute on GoRouteData {
  static SubscribeRoute _fromState(GoRouterState state) => const SubscribeRoute();

  @override
  String get location => GoRouteData.$location('/subscribe');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}
