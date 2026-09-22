import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';

part 'p2p_overview.freezed.dart';

///
/// The P2P tab's header and the games under it: where the user stands, and the
/// three places points can be earned.
///
@freezed
abstract class P2pOverview with _$P2pOverview {
  const factory P2pOverview({
    required int rank,
    required int rankGainThisWeek,
    required int streakPoints,
    required int bestStreakDays,
    required PointsStanding standing,
    required List<P2pGame> games,
  }) = _P2pOverview;
}

/// One card in the GAMES list. The kind picks the route, so the row is data.
@freezed
abstract class P2pGame with _$P2pGame {
  const factory P2pGame({
    required P2pGameKind kind,
    required String category,
    required String title,
    required String subtitle,
    required String imageAsset,
  }) = _P2pGame;
}

enum P2pGameKind { weeklyQuests, dailyStreaks, predictionGames }
