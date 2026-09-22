import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/auction_state.dart';

class AuctionCubit extends SafeCubit<AuctionState> {
  AuctionCubit(this._repository) : super(const AuctionState.initial());

  final RewardsRepository _repository;

  Future<void> load() => _run(_repository.fetchAuctionBoard);

  Future<void> placeBid(int amount) => _run(() => _repository.placeBid(amount));

  Future<void> _run(Future<AuctionBoard> Function() call) async {
    emit(const AuctionState.loading());
    try {
      emit(AuctionState.success(await call()));
    } on AppException catch (e) {
      emit(AuctionState.failure(e));
    }
  }
}
