import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/reels/data/reels_repository.dart';
import 'package:matinee/features/reels/domain/feed_reel.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_feed_state.dart';

///
/// The reels feed for the v2 screen. The repository hands it ready to play;
/// the cubit only holds it and applies unlocks.
///
class ReelsFeedCubit extends SafeCubit<ReelsFeedState> {
  ReelsFeedCubit(this._repository) : super(const ReelsFeedState.initial());

  final ReelsRepository _repository;

  // Where each reel sits in the feed, so an unlock jumps straight to it.
  Map<String, int> _indexById = const {};

  Future<void> load() async {
    emit(const ReelsFeedState.loading());
    try {
      final (feed, pointsBalance) = await (_repository.fetchFeed(), _repository.fetchPointsBalance()).wait;
      _indexById = {for (var i = 0; i < feed.length; i++) feed[i].id: i};
      emit(ReelsFeedState.success(feed, pointsBalance));
    } on AppException catch (e) {
      emit(ReelsFeedState.failure(e));
    }
  }

  ///
  /// Unlocks one reel for this session, until an unlock API exists. Only that
  /// element changes, so the feed reads just that reel again and plays it.
  ///
  Future<void> unlock(String id) async {
    final state = this.state;
    final index = _indexById[id];
    if (state is! ReelsFeedSuccess || index == null) {
      return;
    }
    final feed = List<FeedReel>.of(state.feed);
    feed[index] = feed[index].copyWith(isLocked: false);
    emit(state.copyWith(feed: feed));
  }
}
