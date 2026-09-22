import 'dart:async';

import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/p2p/data/p2p_repository.dart';
import 'package:matinee/features/p2p/presentation/cubit/p2p_state.dart';

class P2pCubit extends SafeCubit<P2pState> {
  P2pCubit(this._repository) : super(const P2pState.initial()) {
    _points = _repository.pointsChanges.listen((_) => unawaited(_refresh()));
  }

  final P2pRepository _repository;

  late final StreamSubscription<int> _points;

  Future<void> load() async {
    emit(const P2pState.loading());
    try {
      emit(P2pState.success(await _repository.fetchOverview()));
    } on AppException catch (e) {
      emit(P2pState.failure(e));
    }
  }

  ///
  /// A claim made below the tab changes the balance and the badge standing with
  /// it, and the standing is derived rather than carried, so the header is
  /// fetched again. Silently, in both directions: nobody asked for this, so it
  /// neither blanks the tab with a loading state nor replaces it with an error.
  /// The figures already on screen stay until a fetch succeeds.
  ///
  Future<void> _refresh() async {
    if (state is! P2pSuccess) {
      return;
    }
    try {
      emit(P2pState.success(await _repository.fetchOverview()));
    } on AppException catch (_) {
      return;
    }
  }

  @override
  Future<void> close() async {
    await _points.cancel();
    await super.close();
  }
}
