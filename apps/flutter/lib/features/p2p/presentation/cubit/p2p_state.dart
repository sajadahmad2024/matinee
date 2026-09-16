import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/p2p_overview.dart';

part 'p2p_state.freezed.dart';

@freezed
sealed class P2pState with _$P2pState {
  const factory P2pState.initial() = P2pInitial;
  const factory P2pState.loading() = P2pLoading;
  const factory P2pState.success(P2pOverview overview) = P2pSuccess;
  const factory P2pState.failure(AppException error) = P2pFailure;
}
