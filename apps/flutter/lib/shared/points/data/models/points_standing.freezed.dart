// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'points_standing.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$PointsStanding {

 int get totalPoints; String get badgeName; int get pointsToNextBadge; String get nextBadgeName; double get progressToNextBadge;///
/// Where the balance sits inside the badge it has earned, and how wide that
/// rung is. The P2P header writes them as a fraction, and deriving them
/// from the progress share would not reproduce whole points.
///
 int get pointsIntoBadge; int get badgeSpan;
/// Create a copy of PointsStanding
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PointsStandingCopyWith<PointsStanding> get copyWith => _$PointsStandingCopyWithImpl<PointsStanding>(this as PointsStanding, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as PointsStanding;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PointsStanding&&(identical(other.totalPoints, _this.totalPoints) || other.totalPoints == _this.totalPoints)&&(identical(other.badgeName, _this.badgeName) || other.badgeName == _this.badgeName)&&(identical(other.pointsToNextBadge, _this.pointsToNextBadge) || other.pointsToNextBadge == _this.pointsToNextBadge)&&(identical(other.nextBadgeName, _this.nextBadgeName) || other.nextBadgeName == _this.nextBadgeName)&&(identical(other.progressToNextBadge, _this.progressToNextBadge) || other.progressToNextBadge == _this.progressToNextBadge)&&(identical(other.pointsIntoBadge, _this.pointsIntoBadge) || other.pointsIntoBadge == _this.pointsIntoBadge)&&(identical(other.badgeSpan, _this.badgeSpan) || other.badgeSpan == _this.badgeSpan));
}


@override
int get hashCode {
  final _this = this as PointsStanding;
  return Object.hash(runtimeType,_this.totalPoints,_this.badgeName,_this.pointsToNextBadge,_this.nextBadgeName,_this.progressToNextBadge,_this.pointsIntoBadge,_this.badgeSpan);
}

@override
String toString() {
  final _this = this as PointsStanding;
  return 'PointsStanding(totalPoints: ${_this.totalPoints}, badgeName: ${_this.badgeName}, pointsToNextBadge: ${_this.pointsToNextBadge}, nextBadgeName: ${_this.nextBadgeName}, progressToNextBadge: ${_this.progressToNextBadge}, pointsIntoBadge: ${_this.pointsIntoBadge}, badgeSpan: ${_this.badgeSpan})';
}


}

/// @nodoc
abstract mixin class $PointsStandingCopyWith<$Res>  {
  factory $PointsStandingCopyWith(PointsStanding value, $Res Function(PointsStanding) _then) = _$PointsStandingCopyWithImpl;
@useResult
$Res call({
 int totalPoints, String badgeName, int pointsToNextBadge, String nextBadgeName, double progressToNextBadge, int pointsIntoBadge, int badgeSpan
});




}
/// @nodoc
class _$PointsStandingCopyWithImpl<$Res>
    implements $PointsStandingCopyWith<$Res> {
  _$PointsStandingCopyWithImpl(this._self, this._then);

  final PointsStanding _self;
  final $Res Function(PointsStanding) _then;

/// Create a copy of PointsStanding
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? totalPoints = null,Object? badgeName = null,Object? pointsToNextBadge = null,Object? nextBadgeName = null,Object? progressToNextBadge = null,Object? pointsIntoBadge = null,Object? badgeSpan = null,}) {
  return _then(PointsStanding(
totalPoints: null == totalPoints ? _self.totalPoints : totalPoints // ignore: cast_nullable_to_non_nullable
as int,badgeName: null == badgeName ? _self.badgeName : badgeName // ignore: cast_nullable_to_non_nullable
as String,pointsToNextBadge: null == pointsToNextBadge ? _self.pointsToNextBadge : pointsToNextBadge // ignore: cast_nullable_to_non_nullable
as int,nextBadgeName: null == nextBadgeName ? _self.nextBadgeName : nextBadgeName // ignore: cast_nullable_to_non_nullable
as String,progressToNextBadge: null == progressToNextBadge ? _self.progressToNextBadge : progressToNextBadge // ignore: cast_nullable_to_non_nullable
as double,pointsIntoBadge: null == pointsIntoBadge ? _self.pointsIntoBadge : pointsIntoBadge // ignore: cast_nullable_to_non_nullable
as int,badgeSpan: null == badgeSpan ? _self.badgeSpan : badgeSpan // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [PointsStanding].
extension PointsStandingPatterns on PointsStanding {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PointsStanding value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PointsStanding() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PointsStanding value)  $default,){
final _that = this;
switch (_that) {
case _PointsStanding():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PointsStanding value)?  $default,){
final _that = this;
switch (_that) {
case _PointsStanding() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int totalPoints,  String badgeName,  int pointsToNextBadge,  String nextBadgeName,  double progressToNextBadge,  int pointsIntoBadge,  int badgeSpan)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PointsStanding() when $default != null:
return $default(_that.totalPoints,_that.badgeName,_that.pointsToNextBadge,_that.nextBadgeName,_that.progressToNextBadge,_that.pointsIntoBadge,_that.badgeSpan);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int totalPoints,  String badgeName,  int pointsToNextBadge,  String nextBadgeName,  double progressToNextBadge,  int pointsIntoBadge,  int badgeSpan)  $default,) {final _that = this;
switch (_that) {
case _PointsStanding():
return $default(_that.totalPoints,_that.badgeName,_that.pointsToNextBadge,_that.nextBadgeName,_that.progressToNextBadge,_that.pointsIntoBadge,_that.badgeSpan);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int totalPoints,  String badgeName,  int pointsToNextBadge,  String nextBadgeName,  double progressToNextBadge,  int pointsIntoBadge,  int badgeSpan)?  $default,) {final _that = this;
switch (_that) {
case _PointsStanding() when $default != null:
return $default(_that.totalPoints,_that.badgeName,_that.pointsToNextBadge,_that.nextBadgeName,_that.progressToNextBadge,_that.pointsIntoBadge,_that.badgeSpan);case _:
  return null;

}
}

}

/// @nodoc


class _PointsStanding implements PointsStanding {
  const _PointsStanding({required this.totalPoints, required this.badgeName, required this.pointsToNextBadge, required this.nextBadgeName, required this.progressToNextBadge, required this.pointsIntoBadge, required this.badgeSpan});
  

@override final  int totalPoints;
@override final  String badgeName;
@override final  int pointsToNextBadge;
@override final  String nextBadgeName;
@override final  double progressToNextBadge;
///
/// Where the balance sits inside the badge it has earned, and how wide that
/// rung is. The P2P header writes them as a fraction, and deriving them
/// from the progress share would not reproduce whole points.
///
@override final  int pointsIntoBadge;
@override final  int badgeSpan;

/// Create a copy of PointsStanding
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PointsStandingCopyWith<_PointsStanding> get copyWith => __$PointsStandingCopyWithImpl<_PointsStanding>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _PointsStanding&&(identical(other.totalPoints, totalPoints) || other.totalPoints == totalPoints)&&(identical(other.badgeName, badgeName) || other.badgeName == badgeName)&&(identical(other.pointsToNextBadge, pointsToNextBadge) || other.pointsToNextBadge == pointsToNextBadge)&&(identical(other.nextBadgeName, nextBadgeName) || other.nextBadgeName == nextBadgeName)&&(identical(other.progressToNextBadge, progressToNextBadge) || other.progressToNextBadge == progressToNextBadge)&&(identical(other.pointsIntoBadge, pointsIntoBadge) || other.pointsIntoBadge == pointsIntoBadge)&&(identical(other.badgeSpan, badgeSpan) || other.badgeSpan == badgeSpan));
}


@override
int get hashCode {
    return Object.hash(runtimeType,totalPoints,badgeName,pointsToNextBadge,nextBadgeName,progressToNextBadge,pointsIntoBadge,badgeSpan);
}

@override
String toString() {
    return 'PointsStanding(totalPoints: $totalPoints, badgeName: $badgeName, pointsToNextBadge: $pointsToNextBadge, nextBadgeName: $nextBadgeName, progressToNextBadge: $progressToNextBadge, pointsIntoBadge: $pointsIntoBadge, badgeSpan: $badgeSpan)';
}


}

/// @nodoc
abstract mixin class _$PointsStandingCopyWith<$Res> implements $PointsStandingCopyWith<$Res> {
  factory _$PointsStandingCopyWith(_PointsStanding value, $Res Function(_PointsStanding) _then) = __$PointsStandingCopyWithImpl;
@override @useResult
$Res call({
 int totalPoints, String badgeName, int pointsToNextBadge, String nextBadgeName, double progressToNextBadge, int pointsIntoBadge, int badgeSpan
});




}
/// @nodoc
class __$PointsStandingCopyWithImpl<$Res>
    implements _$PointsStandingCopyWith<$Res> {
  __$PointsStandingCopyWithImpl(this._self, this._then);

  final _PointsStanding _self;
  final $Res Function(_PointsStanding) _then;

/// Create a copy of PointsStanding
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? totalPoints = null,Object? badgeName = null,Object? pointsToNextBadge = null,Object? nextBadgeName = null,Object? progressToNextBadge = null,Object? pointsIntoBadge = null,Object? badgeSpan = null,}) {
  return _then(_PointsStanding(
totalPoints: null == totalPoints ? _self.totalPoints : totalPoints // ignore: cast_nullable_to_non_nullable
as int,badgeName: null == badgeName ? _self.badgeName : badgeName // ignore: cast_nullable_to_non_nullable
as String,pointsToNextBadge: null == pointsToNextBadge ? _self.pointsToNextBadge : pointsToNextBadge // ignore: cast_nullable_to_non_nullable
as int,nextBadgeName: null == nextBadgeName ? _self.nextBadgeName : nextBadgeName // ignore: cast_nullable_to_non_nullable
as String,progressToNextBadge: null == progressToNextBadge ? _self.progressToNextBadge : progressToNextBadge // ignore: cast_nullable_to_non_nullable
as double,pointsIntoBadge: null == pointsIntoBadge ? _self.pointsIntoBadge : pointsIntoBadge // ignore: cast_nullable_to_non_nullable
as int,badgeSpan: null == badgeSpan ? _self.badgeSpan : badgeSpan // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
