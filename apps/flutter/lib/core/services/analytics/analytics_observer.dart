import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/widgets.dart';

abstract class AnalyticsObserverProvider {
  NavigatorObserver? get observer;
}

class FirebaseAnalyticsObserverProvider implements AnalyticsObserverProvider {
  @override
  NavigatorObserver get observer => FirebaseAnalyticsObserver(
        analytics: FirebaseAnalytics.instance,
      );
}

class NoOpAnalyticsObserverProvider implements AnalyticsObserverProvider {
  @override
  NavigatorObserver? get observer => null;
}
