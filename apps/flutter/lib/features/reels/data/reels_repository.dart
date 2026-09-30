import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/reels/data/mappers/reel_feed_mapper.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/services/reels_feed_api_service.dart';
import 'package:matinee/features/reels/domain/feed_reel.dart';

class ReelsRepository {
  const ReelsRepository(this._service);

  final ReelsFeedApiService _service;

  Future<List<Reel>> fetchReelsFeed() => guardApi(_service.fetchReelsFeed);

  /// The feed ready to play: unsupported reels dropped, sources and locks set.
  Future<List<FeedReel>> fetchFeed() async => toFeedReels(await fetchReelsFeed());

  Future<int> fetchPointsBalance() => guardApi(_service.fetchPointsBalance);
}
