import 'package:matinee/core/bloc/safe_cubit.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/earns/data/earns_repository.dart';
import 'package:matinee/features/earns/data/models/earn_source.dart';
import 'package:matinee/features/earns/presentation/cubit/earn_detail_state.dart';

///
/// One earn source's history. The source is fixed for the screen's life, so it
/// is a constructor argument rather than an argument to [load].
///
/// No balance subscription, unlike the My Earns cubit: what a source has paid
/// does not move when points are spent elsewhere.
///
class EarnDetailCubit extends SafeCubit<EarnDetailState> {
  EarnDetailCubit(this._repository, this.kind) : super(const EarnDetailState.initial());

  final EarnsRepository _repository;

  final EarnSourceKind kind;

  Future<void> load() async {
    emit(const EarnDetailState.loading());
    try {
      emit(EarnDetailState.success(await _repository.fetchDetail(kind)));
    } on AppException catch (e) {
      emit(EarnDetailState.failure(e));
    }
  }
}
