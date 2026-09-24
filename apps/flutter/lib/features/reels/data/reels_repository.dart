import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/services/reels_feed_api_service.dart';

class ReelsRepository {
  const ReelsRepository(this._service);

  final ReelsFeedApiService _service;

  Future<List<Reel>> fetchReelsFeed() => guardApi(_service.fetchReelsFeed);

  Future<int> fetchPointsBalance() => guardApi(_service.fetchPointsBalance);
}
