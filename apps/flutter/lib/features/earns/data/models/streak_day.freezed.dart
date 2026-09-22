// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'streak_day.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$StreakDay {

 DateTime get date; int get dayCount; int get minutesWatched; int get points;/// Null on a day that fell short of the first rung, which draws no pill.
 int? get level;/// The badge the day's streak length reached; the design rings the card gold.
 String? get badgeUnlocked;
/// Create a copy of StreakDay
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StreakDayCopyWith<StreakDay> get copyWith => _$StreakDayCopyWithImpl<StreakDay>(this as StreakDay, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as StreakDay;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is StreakDay&&(identical(other.date, _this.date) || other.date == _this.date)&&(identical(other.dayCount, _this.dayCount) || other.dayCount == _this.dayCount)&&(identical(other.minutesWatched, _this.minutesWatched) || other.minutesWatched == _this.minutesWatched)&&(identical(other.points, _this.points) || other.points == _this.points)&&(identical(other.level, _this.level) || other.level == _this.level)&&(identical(other.badgeUnlocked, _this.badgeUnlocked) || other.badgeUnlocked == _this.badgeUnlocked));
}


@override
int get hashCode {
  final _this = this as StreakDay;
  return Object.hash(runtimeType,_this.date,_this.dayCount,_this.minutesWatched,_this.points,_this.level,_this.badgeUnlocked);
}

@override
String toString() {
  final _this = this as StreakDay;
  return 'StreakDay(date: ${_this.date}, dayCount: ${_this.dayCount}, minutesWatched: ${_this.minutesWatched}, points: ${_this.points}, level: ${_this.level}, badgeUnlocked: ${_this.badgeUnlocked})';
}


}

/// @nodoc
abstract mixin class $StreakDayCopyWith<$Res>  {
  factory $StreakDayCopyWith(StreakDay value, $Res Function(StreakDay) _then) = _$StreakDayCopyWithImpl;
@useResult
$Res call({
 DateTime date, int dayCount, int minutesWatched, int points, int? level, String? badgeUnlocked
});




}
/// @nodoc
class _$StreakDayCopyWithImpl<$Res>
    implements $StreakDayCopyWith<$Res> {
  _$StreakDayCopyWithImpl(this._self, this._then);

  final StreakDay _self;
  final $Res Function(StreakDay) _then;

/// Create a copy of StreakDay
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? date = null,Object? dayCount = null,Object? minutesWatched = null,Object? points = null,Object? level = freezed,Object? badgeUnlocked = freezed,}) {
  return _then(StreakDay(
date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as DateTime,dayCount: null == dayCount ? _self.dayCount : dayCount // ignore: cast_nullable_to_non_nullable
as int,minutesWatched: null == minutesWatched ? _self.minutesWatched : minutesWatched // ignore: cast_nullable_to_non_nullable
as int,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,level: freezed == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int?,badgeUnlocked: freezed == badgeUnlocked ? _self.badgeUnlocked : badgeUnlocked // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [StreakDay].
extension StreakDayPatterns on StreakDay {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _StreakDay value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _StreakDay() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _StreakDay value)  $default,){
final _that = this;
switch (_that) {
case _StreakDay():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _StreakDay value)?  $default,){
final _that = this;
switch (_that) {
case _StreakDay() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( DateTime date,  int dayCount,  int minutesWatched,  int points,  int? level,  String? badgeUnlocked)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _StreakDay() when $default != null:
return $default(_that.date,_that.dayCount,_that.minutesWatched,_that.points,_that.level,_that.badgeUnlocked);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( DateTime date,  int dayCount,  int minutesWatched,  int points,  int? level,  String? badgeUnlocked)  $default,) {final _that = this;
switch (_that) {
case _StreakDay():
return $default(_that.date,_that.dayCount,_that.minutesWatched,_that.points,_that.level,_that.badgeUnlocked);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( DateTime date,  int dayCount,  int minutesWatched,  int points,  int? level,  String? badgeUnlocked)?  $default,) {final _that = this;
switch (_that) {
case _StreakDay() when $default != null:
return $default(_that.date,_that.dayCount,_that.minutesWatched,_that.points,_that.level,_that.badgeUnlocked);case _:
  return null;

}
}

}

/// @nodoc


class _StreakDay implements StreakDay {
  const _StreakDay({required this.date, required this.dayCount, required this.minutesWatched, required this.points, required this.level, this.badgeUnlocked});
  

@override final  DateTime date;
@override final  int dayCount;
@override final  int minutesWatched;
@override final  int points;
/// Null on a day that fell short of the first rung, which draws no pill.
@override final  int? level;
/// The badge the day's streak length reached; the design rings the card gold.
@override final  String? badgeUnlocked;

/// Create a copy of StreakDay
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$StreakDayCopyWith<_StreakDay> get copyWith => __$StreakDayCopyWithImpl<_StreakDay>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _StreakDay&&(identical(other.date, date) || other.date == date)&&(identical(other.dayCount, dayCount) || other.dayCount == dayCount)&&(identical(other.minutesWatched, minutesWatched) || other.minutesWatched == minutesWatched)&&(identical(other.points, points) || other.points == points)&&(identical(other.level, level) || other.level == level)&&(identical(other.badgeUnlocked, badgeUnlocked) || other.badgeUnlocked == badgeUnlocked));
}


@override
int get hashCode {
    return Object.hash(runtimeType,date,dayCount,minutesWatched,points,level,badgeUnlocked);
}

@override
String toString() {
    return 'StreakDay(date: $date, dayCount: $dayCount, minutesWatched: $minutesWatched, points: $points, level: $level, badgeUnlocked: $badgeUnlocked)';
}


}

/// @nodoc
abstract mixin class _$StreakDayCopyWith<$Res> implements $StreakDayCopyWith<$Res> {
  factory _$StreakDayCopyWith(_StreakDay value, $Res Function(_StreakDay) _then) = __$StreakDayCopyWithImpl;
@override @useResult
$Res call({
 DateTime date, int dayCount, int minutesWatched, int points, int? level, String? badgeUnlocked
});




}
/// @nodoc
class __$StreakDayCopyWithImpl<$Res>
    implements _$StreakDayCopyWith<$Res> {
  __$StreakDayCopyWithImpl(this._self, this._then);

  final _StreakDay _self;
  final $Res Function(_StreakDay) _then;

/// Create a copy of StreakDay
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? date = null,Object? dayCount = null,Object? minutesWatched = null,Object? points = null,Object? level = freezed,Object? badgeUnlocked = freezed,}) {
  return _then(_StreakDay(
date: null == date ? _self.date : date // ignore: cast_nullable_to_non_nullable
as DateTime,dayCount: null == dayCount ? _self.dayCount : dayCount // ignore: cast_nullable_to_non_nullable
as int,minutesWatched: null == minutesWatched ? _self.minutesWatched : minutesWatched // ignore: cast_nullable_to_non_nullable
as int,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,level: freezed == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int?,badgeUnlocked: freezed == badgeUnlocked ? _self.badgeUnlocked : badgeUnlocked // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

/// @nodoc
mixin _$StreakLevel {

 int get level; int get minutes; bool get isReached;
/// Create a copy of StreakLevel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StreakLevelCopyWith<StreakLevel> get copyWith => _$StreakLevelCopyWithImpl<StreakLevel>(this as StreakLevel, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as StreakLevel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is StreakLevel&&(identical(other.level, _this.level) || other.level == _this.level)&&(identical(other.minutes, _this.minutes) || other.minutes == _this.minutes)&&(identical(other.isReached, _this.isReached) || other.isReached == _this.isReached));
}


@override
int get hashCode {
  final _this = this as StreakLevel;
  return Object.hash(runtimeType,_this.level,_this.minutes,_this.isReached);
}

@override
String toString() {
  final _this = this as StreakLevel;
  return 'StreakLevel(level: ${_this.level}, minutes: ${_this.minutes}, isReached: ${_this.isReached})';
}


}

/// @nodoc
abstract mixin class $StreakLevelCopyWith<$Res>  {
  factory $StreakLevelCopyWith(StreakLevel value, $Res Function(StreakLevel) _then) = _$StreakLevelCopyWithImpl;
@useResult
$Res call({
 int level, int minutes, bool isReached
});




}
/// @nodoc
class _$StreakLevelCopyWithImpl<$Res>
    implements $StreakLevelCopyWith<$Res> {
  _$StreakLevelCopyWithImpl(this._self, this._then);

  final StreakLevel _self;
  final $Res Function(StreakLevel) _then;

/// Create a copy of StreakLevel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? level = null,Object? minutes = null,Object? isReached = null,}) {
  return _then(StreakLevel(
level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,minutes: null == minutes ? _self.minutes : minutes // ignore: cast_nullable_to_non_nullable
as int,isReached: null == isReached ? _self.isReached : isReached // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [StreakLevel].
extension StreakLevelPatterns on StreakLevel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _StreakLevel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _StreakLevel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _StreakLevel value)  $default,){
final _that = this;
switch (_that) {
case _StreakLevel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _StreakLevel value)?  $default,){
final _that = this;
switch (_that) {
case _StreakLevel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int level,  int minutes,  bool isReached)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _StreakLevel() when $default != null:
return $default(_that.level,_that.minutes,_that.isReached);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int level,  int minutes,  bool isReached)  $default,) {final _that = this;
switch (_that) {
case _StreakLevel():
return $default(_that.level,_that.minutes,_that.isReached);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int level,  int minutes,  bool isReached)?  $default,) {final _that = this;
switch (_that) {
case _StreakLevel() when $default != null:
return $default(_that.level,_that.minutes,_that.isReached);case _:
  return null;

}
}

}

/// @nodoc


class _StreakLevel implements StreakLevel {
  const _StreakLevel({required this.level, required this.minutes, required this.isReached});
  

@override final  int level;
@override final  int minutes;
@override final  bool isReached;

/// Create a copy of StreakLevel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$StreakLevelCopyWith<_StreakLevel> get copyWith => __$StreakLevelCopyWithImpl<_StreakLevel>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _StreakLevel&&(identical(other.level, level) || other.level == level)&&(identical(other.minutes, minutes) || other.minutes == minutes)&&(identical(other.isReached, isReached) || other.isReached == isReached));
}


@override
int get hashCode {
    return Object.hash(runtimeType,level,minutes,isReached);
}

@override
String toString() {
    return 'StreakLevel(level: $level, minutes: $minutes, isReached: $isReached)';
}


}

/// @nodoc
abstract mixin class _$StreakLevelCopyWith<$Res> implements $StreakLevelCopyWith<$Res> {
  factory _$StreakLevelCopyWith(_StreakLevel value, $Res Function(_StreakLevel) _then) = __$StreakLevelCopyWithImpl;
@override @useResult
$Res call({
 int level, int minutes, bool isReached
});




}
/// @nodoc
class __$StreakLevelCopyWithImpl<$Res>
    implements _$StreakLevelCopyWith<$Res> {
  __$StreakLevelCopyWithImpl(this._self, this._then);

  final _StreakLevel _self;
  final $Res Function(_StreakLevel) _then;

/// Create a copy of StreakLevel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? level = null,Object? minutes = null,Object? isReached = null,}) {
  return _then(_StreakLevel(
level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,minutes: null == minutes ? _self.minutes : minutes // ignore: cast_nullable_to_non_nullable
as int,isReached: null == isReached ? _self.isReached : isReached // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
