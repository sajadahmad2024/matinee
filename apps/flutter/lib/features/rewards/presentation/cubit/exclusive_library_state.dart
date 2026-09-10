import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';

part 'exclusive_library_state.freezed.dart';

@freezed
sealed class ExclusiveLibraryState with _$ExclusiveLibraryState {
  const factory ExclusiveLibraryState.initial() = ExclusiveLibraryInitial;
  const factory ExclusiveLibraryState.loading() = ExclusiveLibraryLoading;
  const factory ExclusiveLibraryState.success(ExclusiveLibrary library) = ExclusiveLibrarySuccess;
  const factory ExclusiveLibraryState.failure(AppException error) = ExclusiveLibraryFailure;
}
