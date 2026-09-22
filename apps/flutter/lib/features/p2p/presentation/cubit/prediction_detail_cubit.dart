import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/prediction.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/prediction_detail_state.dart';

///
/// One prediction, and the vote being composed on it. Picking a side is local
/// until it is submitted, so a mis-tap costs nothing.
///
class PredictionDetailCubit extends SafeCubit<PredictionDetailState> {
  PredictionDetailCubit(this._repository, this.predictionId) : super(const PredictionDetailState.initial());

  final P2pRepository _repository;

  final String predictionId;

  Future<void> load() async {
    emit(const PredictionDetailState.loading());
    try {
      final prediction = await _repository.fetchPrediction(predictionId);
      // A vote already cast is the selection, so returning to the screen shows
      // the side the user chose rather than an empty pair.
      emit(PredictionDetailState.success(prediction, selection: prediction.vote));
    } on AppException catch (e) {
      emit(PredictionDetailState.failure(e));
    }
  }

  void select(PredictionSide side) {
    if (state case PredictionDetailSuccess(:final prediction, isSubmitting: false)) {
      emit(PredictionDetailState.success(prediction, selection: side));
    }
  }

  Future<void> submit() async {
    if (state case PredictionDetailSuccess(
      :final prediction,
      :final selection?,
      isSubmitting: false,
    )) {
      emit(PredictionDetailState.success(prediction, selection: selection, isSubmitting: true));
      try {
        final voted = await _repository.castVote(predictionId, selection);
        emit(PredictionDetailState.success(voted, selection: voted.vote));
      } on AppException catch (e) {
        // The pick survives the failure, so the vote can be sent again
        // without choosing a side a second time.
        emit(PredictionDetailState.success(prediction, selection: selection, actionError: e));
      }
    }
  }
}
