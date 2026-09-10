import 'package:freezed_annotation/freezed_annotation.dart';

part 'auction.freezed.dart';

///
/// The auction screen's two subjects: the lot, and the balance the bid bar
/// spends from. They travel together so the header and the bar cannot show
/// figures fetched a moment apart.
///
@freezed
abstract class AuctionBoard with _$AuctionBoard {
  const factory AuctionBoard({
    required Auction auction,
    required int pointsBalance,
  }) = _AuctionBoard;
}

///
/// A live auction lot with the bids placed on it so far. [endsAt] drives the
/// countdown, so the screen formats a remaining duration rather than showing a
/// timestamp the server baked in.
///
@freezed
abstract class Auction with _$Auction {
  const factory Auction({
    required String id,
    required String title,
    required String description,
    required String imageAsset,
    required int currentBid,
    required int minimumIncrement,
    required int watching,
    required DateTime endsAt,
    required List<AuctionBid> bids,
    required List<int> quickIncrements,
  }) = _Auction;
}

///
/// One row of the bid history. [isLeading] marks the bid that currently holds
/// the lot, which the design draws in gold rather than by position alone.
///
@freezed
abstract class AuctionBid with _$AuctionBid {
  const factory AuctionBid({
    required String bidderName,
    required int amount,
    required DateTime placedAt,
    @Default(false) bool isLeading,
  }) = _AuctionBid;
}

///
/// A bundle of points on the top-up sheet. [priceLabel] arrives formatted
/// because the pack's currency belongs to the store the user bought it in.
///
@freezed
abstract class PointsPack with _$PointsPack {
  const factory PointsPack({
    required String id,
    required int points,
    required String priceLabel,
  }) = _PointsPack;
}
