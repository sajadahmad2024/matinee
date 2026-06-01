library;

import '../models/home_item_model.dart';

/// Abstract interface for remote home data source.
///
/// Responsible for fetching data required by the home feature
/// from a backend or third-party service.
abstract class HomeRemoteDataSource {
  /// Load home items from the remote source.
  ///
  /// Throws [AppException] on error.
  Future<List<HomeItemModel>> loadHomeItems();
}

/// Stub implementation of [HomeRemoteDataSource].
///
/// Replace the TODOs with real network calls (e.g. via HttpClient, Firebase).
class HomeRemoteDataSourceImpl implements HomeRemoteDataSource {
  @override
  Future<List<HomeItemModel>> loadHomeItems() async {
    // TODO: Implement real remote call.
    // For now, return an empty list so the app can run.
    return <HomeItemModel>[];
  }
}

