library;

import '../entities/home_item.dart';
import '../../../../core/errors/failures.dart';

/// Repository interface for home feature operations.
///
/// Defines the contract for fetching data that powers the home screen.
/// Implementations live in the data layer.
abstract class HomeRepository {
  /// Load the items to display on the home screen.
  ///
  /// Returns a list of [HomeItem]s on success.
  /// Throws a [Failure] on error.
  Future<List<HomeItem>> loadHomeItems();
}

