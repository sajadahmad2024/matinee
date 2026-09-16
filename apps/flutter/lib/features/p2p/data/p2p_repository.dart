import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/p2p/data/models/p2p_overview.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/data/models/streak_status.dart';
import 'package:matinee/features/p2p/data/models/weekly_quest.dart';
import 'package:matinee/features/p2p/data/services/p2p_api_service.dart';

class P2pRepository {
  const P2pRepository(this._service);

  final P2pApiService _service;

  ///
  /// The balance, every time it changes. A quest claimed below the tab moves
  /// it, so the hub watches this rather than guessing when to refetch.
  ///
  Stream<int> get pointsChanges => _service.pointsChanges;

  Future<P2pOverview> fetchOverview() => guardApi(_service.fetchOverview);

  Future<List<WeeklyQuest>> fetchQuests() => guardApi(_service.fetchQuests);

  Future<WeeklyQuest> fetchQuest(String id) => guardApi(() => _service.fetchQuest(id));

  Future<WeeklyQuest> watchCuratedItem(String questId, String actionId, String itemId) =>
      guardApi(() => _service.watchCuratedItem(questId, actionId, itemId));

  Future<WeeklyQuest> claimQuest(String id) => guardApi(() => _service.claimQuest(id));

  Future<StreakStatus> fetchStreak() => guardApi(_service.fetchStreak);

  Future<StreakStatus> startStreak() => guardApi(_service.startStreak);

  Future<StreakStatus> completeTodaysSession() => guardApi(_service.completeTodaysSession);

  Future<List<Prediction>> fetchPredictions() => guardApi(_service.fetchPredictions);

  Future<Prediction> fetchPrediction(String id) => guardApi(() => _service.fetchPrediction(id));

  Future<Prediction> castVote(String id, PredictionSide side) => guardApi(() => _service.castVote(id, side));
}
