import 'package:freezed_annotation/freezed_annotation.dart';

part 'auction_win.freezed.dart';

/// One lot won at auction, as the win history lists it.
@freezed
abstract class AuctionWin with _$AuctionWin {
  const factory AuctionWin({
    required String id,
    required AuctionLotKind kind,
    required String title,
    required String imageAsset,
    required DateTime wonOn,
    required int winningBid,
    required int pointsAwarded,

    /// The badge the win unlocked, which the design shows as a gold chip.
    String? badgeAwarded,
  }) = _AuctionWin;
}

/// Names the lot, which the design tags over the still.
enum AuctionLotKind { memorabilia, experience, ticket, content }
