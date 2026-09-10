import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/rewards_state.dart';

class RewardsCubit extends Cubit<RewardsState> {
  RewardsCubit(this._repository) : super(const RewardsState.initial()) {
    _points = _repository.pointsChanges.listen(_onPointsChanged);
  }

  final RewardsRepository _repository;

  late final StreamSubscription<int> _points;

  Future<void> load() async {
    emit(const RewardsState.loading());
    try {
      emit(RewardsState.success(await _repository.fetchSummary()));
    } on AppException catch (e) {
      emit(RewardsState.failure(e));
    }
  }

  ///
  /// Spending on a screen the tab is not showing still moves the balance, so
  /// the loaded summary is corrected in place rather than fetched again.
  ///
  void _onPointsChanged(int totalPoints) {
    if (state case RewardsSuccess(:final summary)) {
      emit(RewardsState.success(summary.copyWith(totalPoints: totalPoints)));
    }
  }

  @override
  Future<void> close() async {
    await _points.cancel();
    await super.close();
  }
}
