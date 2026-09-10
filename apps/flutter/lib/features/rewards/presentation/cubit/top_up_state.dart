import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';

part 'top_up_state.freezed.dart';

@freezed
sealed class TopUpState with _$TopUpState {
  const factory TopUpState.initial() = TopUpInitial;
  const factory TopUpState.loading() = TopUpLoading;
  const factory TopUpState.success(TopUpData data) = TopUpSuccess;
  const factory TopUpState.failure(AppException error) = TopUpFailure;
}

///
/// The sheet's two faces in one shape: a pack picker until [purchased], the
/// success panel after it. What was credited is the selected pack's own size.
///
@freezed
abstract class TopUpData with _$TopUpData {
  const factory TopUpData({
    required List<PointsPack> packs,
    required PointsPack selected,
    @Default(false) bool purchased,
  }) = _TopUpData;
}
