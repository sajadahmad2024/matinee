import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/earns/data/models/earns_overview.dart';

part 'earns_state.freezed.dart';

@freezed
sealed class EarnsState with _$EarnsState {
  const factory EarnsState.initial() = EarnsInitial;
  const factory EarnsState.loading() = EarnsLoading;
  const factory EarnsState.success(EarnsOverview overview) = EarnsSuccess;
  const factory EarnsState.failure(AppException error) = EarnsFailure;
}
