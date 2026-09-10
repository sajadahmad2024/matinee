import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/top_up_state.dart';

class TopUpCubit extends Cubit<TopUpState> {
  TopUpCubit(this._repository) : super(const TopUpState.initial());

  final RewardsRepository _repository;

  Future<void> load() async {
    emit(const TopUpState.loading());
    try {
      final packs = await _repository.fetchPointsPacks();
      if (packs.isEmpty) {
        // Nothing to buy is a server problem, not a sheet with no cards in it.
        emit(const TopUpState.failure(NotFoundException()));
        return;
      }
      emit(TopUpState.success(TopUpData(packs: packs, selected: packs.first)));
    } on AppException catch (e) {
      emit(TopUpState.failure(e));
    }
  }

  ///
  /// Selecting is a local change, so it edits the loaded data instead of
  /// dropping the sheet back through a loading state.
  ///
  Future<void> selectPack(PointsPack pack) async {
    if (state case TopUpSuccess(:final data)) {
      emit(TopUpState.success(data.copyWith(selected: pack)));
    }
  }

  ///
  /// Payment method selection belongs to the gateway this hands off to; the
  /// sheet goes straight from the pack to the credited panel.
  ///
  Future<void> purchase() async {
    if (state case TopUpSuccess(:final data)) {
      emit(const TopUpState.loading());
      try {
        await _repository.purchasePointsPack(data.selected);
        emit(TopUpState.success(data.copyWith(purchased: true)));
      } on AppException catch (e) {
        emit(TopUpState.failure(e));
      }
    }
  }
}
