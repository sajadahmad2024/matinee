import 'package:matinee/core/network/error_mapper.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/models/rewards_summary.dart';
import 'package:matinee/features/rewards/data/services/rewards_api_service.dart';

class RewardsRepository {
  const RewardsRepository(this._service);

  final RewardsApiService _service;

  ///
  /// The balance, every time it changes. The tab keeps its state while other
  /// tabs are on screen, so it watches this rather than refetching on a guess
  /// about when spending happened elsewhere.
  ///
  Stream<int> get pointsChanges => _service.pointsChanges;

  Future<RewardsSummary> fetchSummary() => guardApi(_service.fetchSummary);

  Future<AuctionBoard> fetchAuctionBoard() => guardApi(_service.fetchAuctionBoard);

  Future<AuctionBoard> placeBid(int amount) => guardApi(() => _service.placeBid(amount));

  Future<List<PointsPack>> fetchPointsPacks() => guardApi(_service.fetchPointsPacks);

  Future<int> purchasePointsPack(PointsPack pack) {
    return guardApi(() => _service.purchasePointsPack(pack));
  }

  Future<ExclusiveLibrary> fetchLibrary({String? filter}) {
    return guardApi(() => _service.fetchLibrary(filter: filter));
  }

  Future<ExclusiveItem> fetchItem(String id) => guardApi(() => _service.fetchItem(id));

  Future<ExclusiveItem> unlockItem(String id) => guardApi(() => _service.unlockItem(id));
}
