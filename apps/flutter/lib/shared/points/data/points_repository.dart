import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';
import 'package:matinee/shared/points/data/services/points_service.dart';

class PointsRepository {
  const PointsRepository(this._service);

  final PointsService _service;

  ///
  /// The balance, every time it changes. A tab keeps its state while others
  /// are on screen, so it watches this rather than guessing when to refetch.
  ///
  Stream<int> get pointsChanges => _service.pointsChanges;

  Future<PointsStanding> fetchStanding() => guardApi(_service.fetchStanding);
}
