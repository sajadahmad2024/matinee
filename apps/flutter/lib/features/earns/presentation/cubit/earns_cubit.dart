import 'dart:async';

import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/earns/data/earns_repository.dart';
import 'package:matinee/features/earns/presentation/cubit/earns_state.dart';
import 'package:matinee/shared/points/data/points_repository.dart';

class EarnsCubit extends SafeCubit<EarnsState> {
  EarnsCubit(this._repository, this._points) : super(const EarnsState.initial()) {
    _balance = _points.pointsChanges.listen(_onPointsChanged);
  }

  final EarnsRepository _repository;
  final PointsRepository _points;

  late final StreamSubscription<int> _balance;

  Future<void> load() async {
    emit(const EarnsState.loading());
    try {
      emit(EarnsState.success(await _repository.fetchOverview()));
    } on AppException catch (e) {
      emit(EarnsState.failure(e));
    }
  }

  ///
  /// Spending elsewhere moves the balance while this screen is behind it, and
  /// the shares and the badge standing are read off that balance.
  ///
  void _onPointsChanged(int totalPoints) {
    if (state case EarnsSuccess(:final overview) when overview.standing.totalPoints != totalPoints) {
      unawaited(load());
    }
  }

  @override
  Future<void> close() async {
    await _balance.cancel();
    await super.close();
  }
}
