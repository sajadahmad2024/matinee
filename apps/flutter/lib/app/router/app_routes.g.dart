// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_routes.dart';

// **************************************************************************
// GoRouterGenerator
// **************************************************************************

List<RouteBase> get $appRoutes => [
  $splashRoute,
  $appShellRoute,
  $streakHistoryRoute,
  $auctionWinsRoute,
  $predictionHistoryRoute,
  $questHistoryRoute,
  $weeklyQuestsRoute,
  $dailyStreakRoute,
  $predictionGamesRoute,
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
          routes: [
            GoRouteData.$route(
              path: 'earns',
              hasOverriddenOnExit: false,
              factory: $EarnsRoute._fromState,
            ),
          ],
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

mixin $EarnsRoute on GoRouteData {
  static EarnsRoute _fromState(GoRouterState state) => const EarnsRoute();

  @override
  String get location => GoRouteData.$location('/profile/earns');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $streakHistoryRoute => GoRouteData.$route(
  path: '/profile/earns/streaks',
  hasOverriddenOnExit: false,
  factory: $StreakHistoryRoute._fromState,
);

mixin $StreakHistoryRoute on GoRouteData {
  static StreakHistoryRoute _fromState(GoRouterState state) => const StreakHistoryRoute();

  @override
  String get location => GoRouteData.$location('/profile/earns/streaks');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $auctionWinsRoute => GoRouteData.$route(
  path: '/profile/earns/auction-wins',
  hasOverriddenOnExit: false,
  factory: $AuctionWinsRoute._fromState,
);

mixin $AuctionWinsRoute on GoRouteData {
  static AuctionWinsRoute _fromState(GoRouterState state) => const AuctionWinsRoute();

  @override
  String get location => GoRouteData.$location('/profile/earns/auction-wins');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $predictionHistoryRoute => GoRouteData.$route(
  path: '/profile/earns/predictions',
  hasOverriddenOnExit: false,
  factory: $PredictionHistoryRoute._fromState,
);

mixin $PredictionHistoryRoute on GoRouteData {
  static PredictionHistoryRoute _fromState(GoRouterState state) => const PredictionHistoryRoute();

  @override
  String get location => GoRouteData.$location('/profile/earns/predictions');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $questHistoryRoute => GoRouteData.$route(
  path: '/profile/earns/quests',
  hasOverriddenOnExit: false,
  factory: $QuestHistoryRoute._fromState,
);

mixin $QuestHistoryRoute on GoRouteData {
  static QuestHistoryRoute _fromState(GoRouterState state) => const QuestHistoryRoute();

  @override
  String get location => GoRouteData.$location('/profile/earns/quests');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $weeklyQuestsRoute => GoRouteData.$route(
  path: '/p2p/quests',
  hasOverriddenOnExit: false,
  factory: $WeeklyQuestsRoute._fromState,
  routes: [
    GoRouteData.$route(
      path: ':questId',
      hasOverriddenOnExit: false,
      factory: $QuestProgressRoute._fromState,
      routes: [
        GoRouteData.$route(
          path: 'claimed',
          hasOverriddenOnExit: false,
          factory: $QuestClaimedRoute._fromState,
        ),
      ],
    ),
  ],
);

mixin $WeeklyQuestsRoute on GoRouteData {
  static WeeklyQuestsRoute _fromState(GoRouterState state) => const WeeklyQuestsRoute();

  @override
  String get location => GoRouteData.$location('/p2p/quests');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

mixin $QuestProgressRoute on GoRouteData {
  static QuestProgressRoute _fromState(GoRouterState state) =>
      QuestProgressRoute(questId: state.pathParameters['questId']!);

  QuestProgressRoute get _self => this as QuestProgressRoute;

  @override
  String get location => GoRouteData.$location(
    '/p2p/quests/${Uri.encodeComponent(_self.questId)}',
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

mixin $QuestClaimedRoute on GoRouteData {
  static QuestClaimedRoute _fromState(GoRouterState state) =>
      QuestClaimedRoute(questId: state.pathParameters['questId']!);

  QuestClaimedRoute get _self => this as QuestClaimedRoute;

  @override
  String get location => GoRouteData.$location(
    '/p2p/quests/${Uri.encodeComponent(_self.questId)}/claimed',
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

RouteBase get $dailyStreakRoute => GoRouteData.$route(
  path: '/p2p/streaks',
  hasOverriddenOnExit: false,
  factory: $DailyStreakRoute._fromState,
);

mixin $DailyStreakRoute on GoRouteData {
  static DailyStreakRoute _fromState(GoRouterState state) => const DailyStreakRoute();

  @override
  String get location => GoRouteData.$location('/p2p/streaks');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

RouteBase get $predictionGamesRoute => GoRouteData.$route(
  path: '/p2p/predictions',
  hasOverriddenOnExit: false,
  factory: $PredictionGamesRoute._fromState,
  routes: [
    GoRouteData.$route(
      path: ':predictionId',
      hasOverriddenOnExit: false,
      factory: $PredictionDetailRoute._fromState,
    ),
  ],
);

mixin $PredictionGamesRoute on GoRouteData {
  static PredictionGamesRoute _fromState(GoRouterState state) => const PredictionGamesRoute();

  @override
  String get location => GoRouteData.$location('/p2p/predictions');

  @override
  void go(BuildContext context) => context.go(location);

  @override
  Future<T?> push<T>(BuildContext context) => context.push<T>(location);

  @override
  void pushReplacement(BuildContext context) => context.pushReplacement(location);

  @override
  void replace(BuildContext context) => context.replace(location);
}

mixin $PredictionDetailRoute on GoRouteData {
  static PredictionDetailRoute _fromState(GoRouterState state) => PredictionDetailRoute(
    predictionId: state.pathParameters['predictionId']!,
  );

  PredictionDetailRoute get _self => this as PredictionDetailRoute;

  @override
  String get location => GoRouteData.$location(
    '/p2p/predictions/${Uri.encodeComponent(_self.predictionId)}',
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
