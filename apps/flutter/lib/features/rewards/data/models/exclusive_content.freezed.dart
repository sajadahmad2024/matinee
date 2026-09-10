// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'exclusive_content.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$ExclusiveItem {

 String get id; String get title; String get category; int get unlockCost; String get preview; String get castAndCrew; String get imageAsset; bool get isUnlocked;
/// Create a copy of ExclusiveItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ExclusiveItemCopyWith<ExclusiveItem> get copyWith => _$ExclusiveItemCopyWithImpl<ExclusiveItem>(this as ExclusiveItem, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as ExclusiveItem;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ExclusiveItem&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.category, _this.category) || other.category == _this.category)&&(identical(other.unlockCost, _this.unlockCost) || other.unlockCost == _this.unlockCost)&&(identical(other.preview, _this.preview) || other.preview == _this.preview)&&(identical(other.castAndCrew, _this.castAndCrew) || other.castAndCrew == _this.castAndCrew)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset)&&(identical(other.isUnlocked, _this.isUnlocked) || other.isUnlocked == _this.isUnlocked));
}


@override
int get hashCode {
  final _this = this as ExclusiveItem;
  return Object.hash(runtimeType,_this.id,_this.title,_this.category,_this.unlockCost,_this.preview,_this.castAndCrew,_this.imageAsset,_this.isUnlocked);
}

@override
String toString() {
  final _this = this as ExclusiveItem;
  return 'ExclusiveItem(id: ${_this.id}, title: ${_this.title}, category: ${_this.category}, unlockCost: ${_this.unlockCost}, preview: ${_this.preview}, castAndCrew: ${_this.castAndCrew}, imageAsset: ${_this.imageAsset}, isUnlocked: ${_this.isUnlocked})';
}


}

/// @nodoc
abstract mixin class $ExclusiveItemCopyWith<$Res>  {
  factory $ExclusiveItemCopyWith(ExclusiveItem value, $Res Function(ExclusiveItem) _then) = _$ExclusiveItemCopyWithImpl;
@useResult
$Res call({
 String id, String title, String category, int unlockCost, String preview, String castAndCrew, String imageAsset, bool isUnlocked
});




}
/// @nodoc
class _$ExclusiveItemCopyWithImpl<$Res>
    implements $ExclusiveItemCopyWith<$Res> {
  _$ExclusiveItemCopyWithImpl(this._self, this._then);

  final ExclusiveItem _self;
  final $Res Function(ExclusiveItem) _then;

/// Create a copy of ExclusiveItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? category = null,Object? unlockCost = null,Object? preview = null,Object? castAndCrew = null,Object? imageAsset = null,Object? isUnlocked = null,}) {
  return _then(ExclusiveItem(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,unlockCost: null == unlockCost ? _self.unlockCost : unlockCost // ignore: cast_nullable_to_non_nullable
as int,preview: null == preview ? _self.preview : preview // ignore: cast_nullable_to_non_nullable
as String,castAndCrew: null == castAndCrew ? _self.castAndCrew : castAndCrew // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,isUnlocked: null == isUnlocked ? _self.isUnlocked : isUnlocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [ExclusiveItem].
extension ExclusiveItemPatterns on ExclusiveItem {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ExclusiveItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ExclusiveItem() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ExclusiveItem value)  $default,){
final _that = this;
switch (_that) {
case _ExclusiveItem():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ExclusiveItem value)?  $default,){
final _that = this;
switch (_that) {
case _ExclusiveItem() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String category,  int unlockCost,  String preview,  String castAndCrew,  String imageAsset,  bool isUnlocked)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ExclusiveItem() when $default != null:
return $default(_that.id,_that.title,_that.category,_that.unlockCost,_that.preview,_that.castAndCrew,_that.imageAsset,_that.isUnlocked);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String category,  int unlockCost,  String preview,  String castAndCrew,  String imageAsset,  bool isUnlocked)  $default,) {final _that = this;
switch (_that) {
case _ExclusiveItem():
return $default(_that.id,_that.title,_that.category,_that.unlockCost,_that.preview,_that.castAndCrew,_that.imageAsset,_that.isUnlocked);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String category,  int unlockCost,  String preview,  String castAndCrew,  String imageAsset,  bool isUnlocked)?  $default,) {final _that = this;
switch (_that) {
case _ExclusiveItem() when $default != null:
return $default(_that.id,_that.title,_that.category,_that.unlockCost,_that.preview,_that.castAndCrew,_that.imageAsset,_that.isUnlocked);case _:
  return null;

}
}

}

/// @nodoc


class _ExclusiveItem implements ExclusiveItem {
  const _ExclusiveItem({required this.id, required this.title, required this.category, required this.unlockCost, required this.preview, required this.castAndCrew, required this.imageAsset, this.isUnlocked = false});
  

@override final  String id;
@override final  String title;
@override final  String category;
@override final  int unlockCost;
@override final  String preview;
@override final  String castAndCrew;
@override final  String imageAsset;
@override@JsonKey() final  bool isUnlocked;

/// Create a copy of ExclusiveItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ExclusiveItemCopyWith<_ExclusiveItem> get copyWith => __$ExclusiveItemCopyWithImpl<_ExclusiveItem>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ExclusiveItem&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.category, category) || other.category == category)&&(identical(other.unlockCost, unlockCost) || other.unlockCost == unlockCost)&&(identical(other.preview, preview) || other.preview == preview)&&(identical(other.castAndCrew, castAndCrew) || other.castAndCrew == castAndCrew)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset)&&(identical(other.isUnlocked, isUnlocked) || other.isUnlocked == isUnlocked));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,title,category,unlockCost,preview,castAndCrew,imageAsset,isUnlocked);
}

@override
String toString() {
    return 'ExclusiveItem(id: $id, title: $title, category: $category, unlockCost: $unlockCost, preview: $preview, castAndCrew: $castAndCrew, imageAsset: $imageAsset, isUnlocked: $isUnlocked)';
}


}

/// @nodoc
abstract mixin class _$ExclusiveItemCopyWith<$Res> implements $ExclusiveItemCopyWith<$Res> {
  factory _$ExclusiveItemCopyWith(_ExclusiveItem value, $Res Function(_ExclusiveItem) _then) = __$ExclusiveItemCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String category, int unlockCost, String preview, String castAndCrew, String imageAsset, bool isUnlocked
});




}
/// @nodoc
class __$ExclusiveItemCopyWithImpl<$Res>
    implements _$ExclusiveItemCopyWith<$Res> {
  __$ExclusiveItemCopyWithImpl(this._self, this._then);

  final _ExclusiveItem _self;
  final $Res Function(_ExclusiveItem) _then;

/// Create a copy of ExclusiveItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? category = null,Object? unlockCost = null,Object? preview = null,Object? castAndCrew = null,Object? imageAsset = null,Object? isUnlocked = null,}) {
  return _then(_ExclusiveItem(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,unlockCost: null == unlockCost ? _self.unlockCost : unlockCost // ignore: cast_nullable_to_non_nullable
as int,preview: null == preview ? _self.preview : preview // ignore: cast_nullable_to_non_nullable
as String,castAndCrew: null == castAndCrew ? _self.castAndCrew : castAndCrew // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,isUnlocked: null == isUnlocked ? _self.isUnlocked : isUnlocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

/// @nodoc
mixin _$ExclusiveLibrary {

 List<String> get filters; String get selectedFilter; List<ExclusiveItem> get items;
/// Create a copy of ExclusiveLibrary
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ExclusiveLibraryCopyWith<ExclusiveLibrary> get copyWith => _$ExclusiveLibraryCopyWithImpl<ExclusiveLibrary>(this as ExclusiveLibrary, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as ExclusiveLibrary;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ExclusiveLibrary&&const DeepCollectionEquality().equals(other.filters, _this.filters)&&(identical(other.selectedFilter, _this.selectedFilter) || other.selectedFilter == _this.selectedFilter)&&const DeepCollectionEquality().equals(other.items, _this.items));
}


@override
int get hashCode {
  final _this = this as ExclusiveLibrary;
  return Object.hash(runtimeType,const DeepCollectionEquality().hash(_this.filters),_this.selectedFilter,const DeepCollectionEquality().hash(_this.items));
}

@override
String toString() {
  final _this = this as ExclusiveLibrary;
  return 'ExclusiveLibrary(filters: ${_this.filters}, selectedFilter: ${_this.selectedFilter}, items: ${_this.items})';
}


}

/// @nodoc
abstract mixin class $ExclusiveLibraryCopyWith<$Res>  {
  factory $ExclusiveLibraryCopyWith(ExclusiveLibrary value, $Res Function(ExclusiveLibrary) _then) = _$ExclusiveLibraryCopyWithImpl;
@useResult
$Res call({
 List<String> filters, String selectedFilter, List<ExclusiveItem> items
});




}
/// @nodoc
class _$ExclusiveLibraryCopyWithImpl<$Res>
    implements $ExclusiveLibraryCopyWith<$Res> {
  _$ExclusiveLibraryCopyWithImpl(this._self, this._then);

  final ExclusiveLibrary _self;
  final $Res Function(ExclusiveLibrary) _then;

/// Create a copy of ExclusiveLibrary
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? filters = null,Object? selectedFilter = null,Object? items = null,}) {
  return _then(ExclusiveLibrary(
filters: null == filters ? _self.filters : filters // ignore: cast_nullable_to_non_nullable
as List<String>,selectedFilter: null == selectedFilter ? _self.selectedFilter : selectedFilter // ignore: cast_nullable_to_non_nullable
as String,items: null == items ? _self.items : items // ignore: cast_nullable_to_non_nullable
as List<ExclusiveItem>,
  ));
}

}


/// Adds pattern-matching-related methods to [ExclusiveLibrary].
extension ExclusiveLibraryPatterns on ExclusiveLibrary {
/// A variant of `map` that fallback to returning `orElse`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ExclusiveLibrary value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ExclusiveLibrary() when $default != null:
return $default(_that);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// Callbacks receives the raw object, upcasted.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case final Subclass2 value:
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ExclusiveLibrary value)  $default,){
final _that = this;
switch (_that) {
case _ExclusiveLibrary():
return $default(_that);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `map` that fallback to returning `null`.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case final Subclass value:
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ExclusiveLibrary value)?  $default,){
final _that = this;
switch (_that) {
case _ExclusiveLibrary() when $default != null:
return $default(_that);case _:
  return null;

}
}
/// A variant of `when` that fallback to an `orElse` callback.
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return orElse();
/// }
/// ```

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<String> filters,  String selectedFilter,  List<ExclusiveItem> items)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ExclusiveLibrary() when $default != null:
return $default(_that.filters,_that.selectedFilter,_that.items);case _:
  return orElse();

}
}
/// A `switch`-like method, using callbacks.
///
/// As opposed to `map`, this offers destructuring.
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case Subclass2(:final field2):
///     return ...;
/// }
/// ```

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<String> filters,  String selectedFilter,  List<ExclusiveItem> items)  $default,) {final _that = this;
switch (_that) {
case _ExclusiveLibrary():
return $default(_that.filters,_that.selectedFilter,_that.items);case _:
  throw StateError('Unexpected subclass');

}
}
/// A variant of `when` that fallback to returning `null`
///
/// It is equivalent to doing:
/// ```dart
/// switch (sealedClass) {
///   case Subclass(:final field):
///     return ...;
///   case _:
///     return null;
/// }
/// ```

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<String> filters,  String selectedFilter,  List<ExclusiveItem> items)?  $default,) {final _that = this;
switch (_that) {
case _ExclusiveLibrary() when $default != null:
return $default(_that.filters,_that.selectedFilter,_that.items);case _:
  return null;

}
}

}

/// @nodoc


class _ExclusiveLibrary implements ExclusiveLibrary {
  const _ExclusiveLibrary({required  List<String> filters, required this.selectedFilter, required  List<ExclusiveItem> items}): _filters = filters,_items = items;
  

 final  List<String> _filters;
@override List<String> get filters {
  if (_filters is EqualUnmodifiableListView) return _filters;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_filters);
}

@override final  String selectedFilter;
 final  List<ExclusiveItem> _items;
@override List<ExclusiveItem> get items {
  if (_items is EqualUnmodifiableListView) return _items;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_items);
}


/// Create a copy of ExclusiveLibrary
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ExclusiveLibraryCopyWith<_ExclusiveLibrary> get copyWith => __$ExclusiveLibraryCopyWithImpl<_ExclusiveLibrary>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ExclusiveLibrary&&const DeepCollectionEquality().equals(other.filters, _filters)&&(identical(other.selectedFilter, selectedFilter) || other.selectedFilter == selectedFilter)&&const DeepCollectionEquality().equals(other.items, _items));
}


@override
int get hashCode {
    return Object.hash(runtimeType,const DeepCollectionEquality().hash(_filters),selectedFilter,const DeepCollectionEquality().hash(_items));
}

@override
String toString() {
    return 'ExclusiveLibrary(filters: $filters, selectedFilter: $selectedFilter, items: $items)';
}


}

/// @nodoc
abstract mixin class _$ExclusiveLibraryCopyWith<$Res> implements $ExclusiveLibraryCopyWith<$Res> {
  factory _$ExclusiveLibraryCopyWith(_ExclusiveLibrary value, $Res Function(_ExclusiveLibrary) _then) = __$ExclusiveLibraryCopyWithImpl;
@override @useResult
$Res call({
 List<String> filters, String selectedFilter, List<ExclusiveItem> items
});




}
/// @nodoc
class __$ExclusiveLibraryCopyWithImpl<$Res>
    implements _$ExclusiveLibraryCopyWith<$Res> {
  __$ExclusiveLibraryCopyWithImpl(this._self, this._then);

  final _ExclusiveLibrary _self;
  final $Res Function(_ExclusiveLibrary) _then;

/// Create a copy of ExclusiveLibrary
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? filters = null,Object? selectedFilter = null,Object? items = null,}) {
  return _then(_ExclusiveLibrary(
filters: null == filters ? _self._filters : filters // ignore: cast_nullable_to_non_nullable
as List<String>,selectedFilter: null == selectedFilter ? _self.selectedFilter : selectedFilter // ignore: cast_nullable_to_non_nullable
as String,items: null == items ? _self._items : items // ignore: cast_nullable_to_non_nullable
as List<ExclusiveItem>,
  ));
}


}

// dart format on
