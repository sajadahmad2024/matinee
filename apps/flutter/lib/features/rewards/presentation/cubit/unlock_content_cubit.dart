import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_state.dart';

class UnlockContentCubit extends Cubit<UnlockContentState> {
  UnlockContentCubit(this._repository, this._itemId) : super(const UnlockContentState.initial());

  final RewardsRepository _repository;
  final String _itemId;

  Future<void> load() => _run(() => _repository.fetchItem(_itemId));

  Future<void> unlock() {
    return _run(() => _repository.unlockItem(_itemId), justUnlocked: true);
  }

  Future<void> _run(
    Future<ExclusiveItem> Function() call, {
    bool justUnlocked = false,
  }) async {
    emit(const UnlockContentState.loading());
    try {
      emit(UnlockContentState.success(await call(), justUnlocked: justUnlocked));
    } on AppException catch (e) {
      emit(UnlockContentState.failure(e));
    }
  }
}
