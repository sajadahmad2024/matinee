import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/models/streak_status.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/daily_streak_state.dart';

class DailyStreakCubit extends SafeCubit<DailyStreakState> {
  DailyStreakCubit(this._repository) : super(const DailyStreakInitial());

  final P2pRepository _repository;

  Future<void> load() async {
    emit(const DailyStreakState.loading());
    try {
      emit(DailyStreakState.success(await _repository.fetchStreak()));
    } on AppException catch (e) {
      emit(DailyStreakState.failure(e));
    }
  }

  /// The intro's CTA. Which screen shows afterwards is the streak's own state.
  Future<void> start() => _run(_repository.startStreak);

  ///
  /// The ladder's CTA. The level-complete drawer fires off the state this
  /// returns, so finishing a week is reachable rather than only tested.
  ///
  Future<void> completeToday() => _run(_repository.completeTodaysSession);

  Future<void> _run(Future<StreakStatus> Function() call) async {
    if (state case DailyStreakSuccess(:final streak, isBusy: false)) {
      emit(DailyStreakState.success(streak, isBusy: true));
      try {
        emit(DailyStreakState.success(await call()));
      } on AppException catch (e) {
        // The streak is still on screen and the tap is still worth repeating,
        // so the failure is reported beside it rather than in place of it.
        emit(DailyStreakState.success(streak, actionError: e));
      }
    }
  }
}
