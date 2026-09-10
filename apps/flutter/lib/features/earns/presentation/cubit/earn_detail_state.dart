import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/earns/data/models/earn_detail.dart';

part 'earn_detail_state.freezed.dart';

@freezed
sealed class EarnDetailState with _$EarnDetailState {
  const factory EarnDetailState.initial() = EarnDetailInitial;
  const factory EarnDetailState.loading() = EarnDetailLoading;
  const factory EarnDetailState.success(EarnDetail detail) = EarnDetailSuccess;
  const factory EarnDetailState.failure(AppException error) = EarnDetailFailure;
}
