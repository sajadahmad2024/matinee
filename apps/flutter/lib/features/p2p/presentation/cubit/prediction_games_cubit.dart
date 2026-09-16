import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_games_state.dart';

class PredictionGamesCubit extends SafeCubit<PredictionGamesState> {
  PredictionGamesCubit(this._repository) : super(const PredictionGamesState.initial());

  final P2pRepository _repository;

  Future<void> load() async {
    emit(const PredictionGamesState.loading());
    try {
      emit(PredictionGamesState.success(await _repository.fetchPredictions()));
    } on AppException catch (e) {
      emit(PredictionGamesState.failure(e));
    }
  }

  ///
  /// Re-reads the predictions after a trip to one of them, which can cast a
  /// vote. Silently, in both directions: the list is already on screen.
  ///
  Future<void> refresh() async {
    if (state is! PredictionGamesSuccess) {
      return;
    }
    try {
      emit(PredictionGamesState.success(await _repository.fetchPredictions()));
    } on AppException catch (_) {
      return;
    }
  }
}
