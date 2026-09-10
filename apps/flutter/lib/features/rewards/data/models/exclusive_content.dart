import 'package:freezed_annotation/freezed_annotation.dart';

part 'exclusive_content.freezed.dart';

///
/// One tile in the exclusive content grid. A locked item draws the lock and
/// costs [unlockCost]; every item carries a still, showing or not.
///
@freezed
abstract class ExclusiveItem with _$ExclusiveItem {
  const factory ExclusiveItem({
    required String id,
    required String title,
    required String category,
    required int unlockCost,
    required String preview,
    required String castAndCrew,
    required String imageAsset,
    @Default(false) bool isUnlocked,
  }) = _ExclusiveItem;
}

///
/// The library and the filter row above it. The filters come with the library
/// so the chips match what the catalogue actually holds.
///
@freezed
abstract class ExclusiveLibrary with _$ExclusiveLibrary {
  const factory ExclusiveLibrary({
    required List<String> filters,
    required String selectedFilter,
    required List<ExclusiveItem> items,
  }) = _ExclusiveLibrary;
}
