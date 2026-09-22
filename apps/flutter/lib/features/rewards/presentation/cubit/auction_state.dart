import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';

part 'auction_state.freezed.dart';

@freezed
sealed class AuctionState with _$AuctionState {
  const factory AuctionState.initial() = AuctionInitial;
  const factory AuctionState.loading() = AuctionLoading;
  const factory AuctionState.success(AuctionBoard board) = AuctionSuccess;
  const factory AuctionState.failure(AppException error) = AuctionFailure;
}
