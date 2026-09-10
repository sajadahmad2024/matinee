// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'rewards_summary.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$RewardsSummary {

 int get totalPoints; String get badgeName; int get pointsToNextBadge; String get nextBadgeName; List<RedeemDestination> get destinations;
/// Create a copy of RewardsSummary
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RewardsSummaryCopyWith<RewardsSummary> get copyWith => _$RewardsSummaryCopyWithImpl<RewardsSummary>(this as RewardsSummary, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as RewardsSummary;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RewardsSummary&&(identical(other.totalPoints, _this.totalPoints) || other.totalPoints == _this.totalPoints)&&(identical(other.badgeName, _this.badgeName) || other.badgeName == _this.badgeName)&&(identical(other.pointsToNextBadge, _this.pointsToNextBadge) || other.pointsToNextBadge == _this.pointsToNextBadge)&&(identical(other.nextBadgeName, _this.nextBadgeName) || other.nextBadgeName == _this.nextBadgeName)&&const DeepCollectionEquality().equals(other.destinations, _this.destinations));
}


@override
int get hashCode {
  final _this = this as RewardsSummary;
  return Object.hash(runtimeType,_this.totalPoints,_this.badgeName,_this.pointsToNextBadge,_this.nextBadgeName,const DeepCollectionEquality().hash(_this.destinations));
}

@override
String toString() {
  final _this = this as RewardsSummary;
  return 'RewardsSummary(totalPoints: ${_this.totalPoints}, badgeName: ${_this.badgeName}, pointsToNextBadge: ${_this.pointsToNextBadge}, nextBadgeName: ${_this.nextBadgeName}, destinations: ${_this.destinations})';
}


}

/// @nodoc
abstract mixin class $RewardsSummaryCopyWith<$Res>  {
  factory $RewardsSummaryCopyWith(RewardsSummary value, $Res Function(RewardsSummary) _then) = _$RewardsSummaryCopyWithImpl;
@useResult
$Res call({
 int totalPoints, String badgeName, int pointsToNextBadge, String nextBadgeName, List<RedeemDestination> destinations
});




}
/// @nodoc
class _$RewardsSummaryCopyWithImpl<$Res>
    implements $RewardsSummaryCopyWith<$Res> {
  _$RewardsSummaryCopyWithImpl(this._self, this._then);

  final RewardsSummary _self;
  final $Res Function(RewardsSummary) _then;

/// Create a copy of RewardsSummary
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? totalPoints = null,Object? badgeName = null,Object? pointsToNextBadge = null,Object? nextBadgeName = null,Object? destinations = null,}) {
  return _then(RewardsSummary(
totalPoints: null == totalPoints ? _self.totalPoints : totalPoints // ignore: cast_nullable_to_non_nullable
as int,badgeName: null == badgeName ? _self.badgeName : badgeName // ignore: cast_nullable_to_non_nullable
as String,pointsToNextBadge: null == pointsToNextBadge ? _self.pointsToNextBadge : pointsToNextBadge // ignore: cast_nullable_to_non_nullable
as int,nextBadgeName: null == nextBadgeName ? _self.nextBadgeName : nextBadgeName // ignore: cast_nullable_to_non_nullable
as String,destinations: null == destinations ? _self.destinations : destinations // ignore: cast_nullable_to_non_nullable
as List<RedeemDestination>,
  ));
}

}


/// Adds pattern-matching-related methods to [RewardsSummary].
extension RewardsSummaryPatterns on RewardsSummary {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RewardsSummary value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RewardsSummary() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RewardsSummary value)  $default,){
final _that = this;
switch (_that) {
case _RewardsSummary():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RewardsSummary value)?  $default,){
final _that = this;
switch (_that) {
case _RewardsSummary() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int totalPoints,  String badgeName,  int pointsToNextBadge,  String nextBadgeName,  List<RedeemDestination> destinations)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RewardsSummary() when $default != null:
return $default(_that.totalPoints,_that.badgeName,_that.pointsToNextBadge,_that.nextBadgeName,_that.destinations);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int totalPoints,  String badgeName,  int pointsToNextBadge,  String nextBadgeName,  List<RedeemDestination> destinations)  $default,) {final _that = this;
switch (_that) {
case _RewardsSummary():
return $default(_that.totalPoints,_that.badgeName,_that.pointsToNextBadge,_that.nextBadgeName,_that.destinations);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int totalPoints,  String badgeName,  int pointsToNextBadge,  String nextBadgeName,  List<RedeemDestination> destinations)?  $default,) {final _that = this;
switch (_that) {
case _RewardsSummary() when $default != null:
return $default(_that.totalPoints,_that.badgeName,_that.pointsToNextBadge,_that.nextBadgeName,_that.destinations);case _:
  return null;

}
}

}

/// @nodoc


class _RewardsSummary implements RewardsSummary {
  const _RewardsSummary({required this.totalPoints, required this.badgeName, required this.pointsToNextBadge, required this.nextBadgeName, required  List<RedeemDestination> destinations}): _destinations = destinations;
  

@override final  int totalPoints;
@override final  String badgeName;
@override final  int pointsToNextBadge;
@override final  String nextBadgeName;
 final  List<RedeemDestination> _destinations;
@override List<RedeemDestination> get destinations {
  if (_destinations is EqualUnmodifiableListView) return _destinations;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_destinations);
}


/// Create a copy of RewardsSummary
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RewardsSummaryCopyWith<_RewardsSummary> get copyWith => __$RewardsSummaryCopyWithImpl<_RewardsSummary>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _RewardsSummary&&(identical(other.totalPoints, totalPoints) || other.totalPoints == totalPoints)&&(identical(other.badgeName, badgeName) || other.badgeName == badgeName)&&(identical(other.pointsToNextBadge, pointsToNextBadge) || other.pointsToNextBadge == pointsToNextBadge)&&(identical(other.nextBadgeName, nextBadgeName) || other.nextBadgeName == nextBadgeName)&&const DeepCollectionEquality().equals(other.destinations, _destinations));
}


@override
int get hashCode {
    return Object.hash(runtimeType,totalPoints,badgeName,pointsToNextBadge,nextBadgeName,const DeepCollectionEquality().hash(_destinations));
}

@override
String toString() {
    return 'RewardsSummary(totalPoints: $totalPoints, badgeName: $badgeName, pointsToNextBadge: $pointsToNextBadge, nextBadgeName: $nextBadgeName, destinations: $destinations)';
}


}

/// @nodoc
abstract mixin class _$RewardsSummaryCopyWith<$Res> implements $RewardsSummaryCopyWith<$Res> {
  factory _$RewardsSummaryCopyWith(_RewardsSummary value, $Res Function(_RewardsSummary) _then) = __$RewardsSummaryCopyWithImpl;
@override @useResult
$Res call({
 int totalPoints, String badgeName, int pointsToNextBadge, String nextBadgeName, List<RedeemDestination> destinations
});




}
/// @nodoc
class __$RewardsSummaryCopyWithImpl<$Res>
    implements _$RewardsSummaryCopyWith<$Res> {
  __$RewardsSummaryCopyWithImpl(this._self, this._then);

  final _RewardsSummary _self;
  final $Res Function(_RewardsSummary) _then;

/// Create a copy of RewardsSummary
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? totalPoints = null,Object? badgeName = null,Object? pointsToNextBadge = null,Object? nextBadgeName = null,Object? destinations = null,}) {
  return _then(_RewardsSummary(
totalPoints: null == totalPoints ? _self.totalPoints : totalPoints // ignore: cast_nullable_to_non_nullable
as int,badgeName: null == badgeName ? _self.badgeName : badgeName // ignore: cast_nullable_to_non_nullable
as String,pointsToNextBadge: null == pointsToNextBadge ? _self.pointsToNextBadge : pointsToNextBadge // ignore: cast_nullable_to_non_nullable
as int,nextBadgeName: null == nextBadgeName ? _self.nextBadgeName : nextBadgeName // ignore: cast_nullable_to_non_nullable
as String,destinations: null == destinations ? _self._destinations : destinations // ignore: cast_nullable_to_non_nullable
as List<RedeemDestination>,
  ));
}


}

/// @nodoc
mixin _$RedeemDestination {

 RedeemKind get kind; String get category; String get title; String get subtitle; String get imageAsset;
/// Create a copy of RedeemDestination
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RedeemDestinationCopyWith<RedeemDestination> get copyWith => _$RedeemDestinationCopyWithImpl<RedeemDestination>(this as RedeemDestination, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as RedeemDestination;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is RedeemDestination&&(identical(other.kind, _this.kind) || other.kind == _this.kind)&&(identical(other.category, _this.category) || other.category == _this.category)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.subtitle, _this.subtitle) || other.subtitle == _this.subtitle)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset));
}


@override
int get hashCode {
  final _this = this as RedeemDestination;
  return Object.hash(runtimeType,_this.kind,_this.category,_this.title,_this.subtitle,_this.imageAsset);
}

@override
String toString() {
  final _this = this as RedeemDestination;
  return 'RedeemDestination(kind: ${_this.kind}, category: ${_this.category}, title: ${_this.title}, subtitle: ${_this.subtitle}, imageAsset: ${_this.imageAsset})';
}


}

/// @nodoc
abstract mixin class $RedeemDestinationCopyWith<$Res>  {
  factory $RedeemDestinationCopyWith(RedeemDestination value, $Res Function(RedeemDestination) _then) = _$RedeemDestinationCopyWithImpl;
@useResult
$Res call({
 RedeemKind kind, String category, String title, String subtitle, String imageAsset
});




}
/// @nodoc
class _$RedeemDestinationCopyWithImpl<$Res>
    implements $RedeemDestinationCopyWith<$Res> {
  _$RedeemDestinationCopyWithImpl(this._self, this._then);

  final RedeemDestination _self;
  final $Res Function(RedeemDestination) _then;

/// Create a copy of RedeemDestination
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? kind = null,Object? category = null,Object? title = null,Object? subtitle = null,Object? imageAsset = null,}) {
  return _then(RedeemDestination(
kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as RedeemKind,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,subtitle: null == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [RedeemDestination].
extension RedeemDestinationPatterns on RedeemDestination {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _RedeemDestination value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _RedeemDestination() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _RedeemDestination value)  $default,){
final _that = this;
switch (_that) {
case _RedeemDestination():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _RedeemDestination value)?  $default,){
final _that = this;
switch (_that) {
case _RedeemDestination() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( RedeemKind kind,  String category,  String title,  String subtitle,  String imageAsset)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _RedeemDestination() when $default != null:
return $default(_that.kind,_that.category,_that.title,_that.subtitle,_that.imageAsset);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( RedeemKind kind,  String category,  String title,  String subtitle,  String imageAsset)  $default,) {final _that = this;
switch (_that) {
case _RedeemDestination():
return $default(_that.kind,_that.category,_that.title,_that.subtitle,_that.imageAsset);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( RedeemKind kind,  String category,  String title,  String subtitle,  String imageAsset)?  $default,) {final _that = this;
switch (_that) {
case _RedeemDestination() when $default != null:
return $default(_that.kind,_that.category,_that.title,_that.subtitle,_that.imageAsset);case _:
  return null;

}
}

}

/// @nodoc


class _RedeemDestination implements RedeemDestination {
  const _RedeemDestination({required this.kind, required this.category, required this.title, required this.subtitle, required this.imageAsset});
  

@override final  RedeemKind kind;
@override final  String category;
@override final  String title;
@override final  String subtitle;
@override final  String imageAsset;

/// Create a copy of RedeemDestination
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$RedeemDestinationCopyWith<_RedeemDestination> get copyWith => __$RedeemDestinationCopyWithImpl<_RedeemDestination>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _RedeemDestination&&(identical(other.kind, kind) || other.kind == kind)&&(identical(other.category, category) || other.category == category)&&(identical(other.title, title) || other.title == title)&&(identical(other.subtitle, subtitle) || other.subtitle == subtitle)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset));
}


@override
int get hashCode {
    return Object.hash(runtimeType,kind,category,title,subtitle,imageAsset);
}

@override
String toString() {
    return 'RedeemDestination(kind: $kind, category: $category, title: $title, subtitle: $subtitle, imageAsset: $imageAsset)';
}


}

/// @nodoc
abstract mixin class _$RedeemDestinationCopyWith<$Res> implements $RedeemDestinationCopyWith<$Res> {
  factory _$RedeemDestinationCopyWith(_RedeemDestination value, $Res Function(_RedeemDestination) _then) = __$RedeemDestinationCopyWithImpl;
@override @useResult
$Res call({
 RedeemKind kind, String category, String title, String subtitle, String imageAsset
});




}
/// @nodoc
class __$RedeemDestinationCopyWithImpl<$Res>
    implements _$RedeemDestinationCopyWith<$Res> {
  __$RedeemDestinationCopyWithImpl(this._self, this._then);

  final _RedeemDestination _self;
  final $Res Function(_RedeemDestination) _then;

/// Create a copy of RedeemDestination
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? kind = null,Object? category = null,Object? title = null,Object? subtitle = null,Object? imageAsset = null,}) {
  return _then(_RedeemDestination(
kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as RedeemKind,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,subtitle: null == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
