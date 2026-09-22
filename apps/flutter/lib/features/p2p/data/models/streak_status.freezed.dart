// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'streak_status.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$StreakStatus {

/// False before the first day, which is the intro screen rather than a
/// streak of zero.
 bool get hasStarted; int get level; int get daysPerLevel; int get daysDoneThisWeek; int get minutesToday; int get currentStreakDays; int get bestStreakDays; int get activeDays; List<StreakTier> get tiers;
/// Create a copy of StreakStatus
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StreakStatusCopyWith<StreakStatus> get copyWith => _$StreakStatusCopyWithImpl<StreakStatus>(this as StreakStatus, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as StreakStatus;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is StreakStatus&&(identical(other.hasStarted, _this.hasStarted) || other.hasStarted == _this.hasStarted)&&(identical(other.level, _this.level) || other.level == _this.level)&&(identical(other.daysPerLevel, _this.daysPerLevel) || other.daysPerLevel == _this.daysPerLevel)&&(identical(other.daysDoneThisWeek, _this.daysDoneThisWeek) || other.daysDoneThisWeek == _this.daysDoneThisWeek)&&(identical(other.minutesToday, _this.minutesToday) || other.minutesToday == _this.minutesToday)&&(identical(other.currentStreakDays, _this.currentStreakDays) || other.currentStreakDays == _this.currentStreakDays)&&(identical(other.bestStreakDays, _this.bestStreakDays) || other.bestStreakDays == _this.bestStreakDays)&&(identical(other.activeDays, _this.activeDays) || other.activeDays == _this.activeDays)&&const DeepCollectionEquality().equals(other.tiers, _this.tiers));
}


@override
int get hashCode {
  final _this = this as StreakStatus;
  return Object.hash(runtimeType,_this.hasStarted,_this.level,_this.daysPerLevel,_this.daysDoneThisWeek,_this.minutesToday,_this.currentStreakDays,_this.bestStreakDays,_this.activeDays,const DeepCollectionEquality().hash(_this.tiers));
}

@override
String toString() {
  final _this = this as StreakStatus;
  return 'StreakStatus(hasStarted: ${_this.hasStarted}, level: ${_this.level}, daysPerLevel: ${_this.daysPerLevel}, daysDoneThisWeek: ${_this.daysDoneThisWeek}, minutesToday: ${_this.minutesToday}, currentStreakDays: ${_this.currentStreakDays}, bestStreakDays: ${_this.bestStreakDays}, activeDays: ${_this.activeDays}, tiers: ${_this.tiers})';
}


}

/// @nodoc
abstract mixin class $StreakStatusCopyWith<$Res>  {
  factory $StreakStatusCopyWith(StreakStatus value, $Res Function(StreakStatus) _then) = _$StreakStatusCopyWithImpl;
@useResult
$Res call({
 bool hasStarted, int level, int daysPerLevel, int daysDoneThisWeek, int minutesToday, int currentStreakDays, int bestStreakDays, int activeDays, List<StreakTier> tiers
});




}
/// @nodoc
class _$StreakStatusCopyWithImpl<$Res>
    implements $StreakStatusCopyWith<$Res> {
  _$StreakStatusCopyWithImpl(this._self, this._then);

  final StreakStatus _self;
  final $Res Function(StreakStatus) _then;

/// Create a copy of StreakStatus
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? hasStarted = null,Object? level = null,Object? daysPerLevel = null,Object? daysDoneThisWeek = null,Object? minutesToday = null,Object? currentStreakDays = null,Object? bestStreakDays = null,Object? activeDays = null,Object? tiers = null,}) {
  return _then(StreakStatus(
hasStarted: null == hasStarted ? _self.hasStarted : hasStarted // ignore: cast_nullable_to_non_nullable
as bool,level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,daysPerLevel: null == daysPerLevel ? _self.daysPerLevel : daysPerLevel // ignore: cast_nullable_to_non_nullable
as int,daysDoneThisWeek: null == daysDoneThisWeek ? _self.daysDoneThisWeek : daysDoneThisWeek // ignore: cast_nullable_to_non_nullable
as int,minutesToday: null == minutesToday ? _self.minutesToday : minutesToday // ignore: cast_nullable_to_non_nullable
as int,currentStreakDays: null == currentStreakDays ? _self.currentStreakDays : currentStreakDays // ignore: cast_nullable_to_non_nullable
as int,bestStreakDays: null == bestStreakDays ? _self.bestStreakDays : bestStreakDays // ignore: cast_nullable_to_non_nullable
as int,activeDays: null == activeDays ? _self.activeDays : activeDays // ignore: cast_nullable_to_non_nullable
as int,tiers: null == tiers ? _self.tiers : tiers // ignore: cast_nullable_to_non_nullable
as List<StreakTier>,
  ));
}

}


/// Adds pattern-matching-related methods to [StreakStatus].
extension StreakStatusPatterns on StreakStatus {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _StreakStatus value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _StreakStatus() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _StreakStatus value)  $default,){
final _that = this;
switch (_that) {
case _StreakStatus():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _StreakStatus value)?  $default,){
final _that = this;
switch (_that) {
case _StreakStatus() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( bool hasStarted,  int level,  int daysPerLevel,  int daysDoneThisWeek,  int minutesToday,  int currentStreakDays,  int bestStreakDays,  int activeDays,  List<StreakTier> tiers)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _StreakStatus() when $default != null:
return $default(_that.hasStarted,_that.level,_that.daysPerLevel,_that.daysDoneThisWeek,_that.minutesToday,_that.currentStreakDays,_that.bestStreakDays,_that.activeDays,_that.tiers);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( bool hasStarted,  int level,  int daysPerLevel,  int daysDoneThisWeek,  int minutesToday,  int currentStreakDays,  int bestStreakDays,  int activeDays,  List<StreakTier> tiers)  $default,) {final _that = this;
switch (_that) {
case _StreakStatus():
return $default(_that.hasStarted,_that.level,_that.daysPerLevel,_that.daysDoneThisWeek,_that.minutesToday,_that.currentStreakDays,_that.bestStreakDays,_that.activeDays,_that.tiers);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( bool hasStarted,  int level,  int daysPerLevel,  int daysDoneThisWeek,  int minutesToday,  int currentStreakDays,  int bestStreakDays,  int activeDays,  List<StreakTier> tiers)?  $default,) {final _that = this;
switch (_that) {
case _StreakStatus() when $default != null:
return $default(_that.hasStarted,_that.level,_that.daysPerLevel,_that.daysDoneThisWeek,_that.minutesToday,_that.currentStreakDays,_that.bestStreakDays,_that.activeDays,_that.tiers);case _:
  return null;

}
}

}

/// @nodoc


class _StreakStatus implements StreakStatus {
  const _StreakStatus({required this.hasStarted, required this.level, required this.daysPerLevel, required this.daysDoneThisWeek, required this.minutesToday, required this.currentStreakDays, required this.bestStreakDays, required this.activeDays, required  List<StreakTier> tiers}): _tiers = tiers;
  

/// False before the first day, which is the intro screen rather than a
/// streak of zero.
@override final  bool hasStarted;
@override final  int level;
@override final  int daysPerLevel;
@override final  int daysDoneThisWeek;
@override final  int minutesToday;
@override final  int currentStreakDays;
@override final  int bestStreakDays;
@override final  int activeDays;
 final  List<StreakTier> _tiers;
@override List<StreakTier> get tiers {
  if (_tiers is EqualUnmodifiableListView) return _tiers;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_tiers);
}


/// Create a copy of StreakStatus
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$StreakStatusCopyWith<_StreakStatus> get copyWith => __$StreakStatusCopyWithImpl<_StreakStatus>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _StreakStatus&&(identical(other.hasStarted, hasStarted) || other.hasStarted == hasStarted)&&(identical(other.level, level) || other.level == level)&&(identical(other.daysPerLevel, daysPerLevel) || other.daysPerLevel == daysPerLevel)&&(identical(other.daysDoneThisWeek, daysDoneThisWeek) || other.daysDoneThisWeek == daysDoneThisWeek)&&(identical(other.minutesToday, minutesToday) || other.minutesToday == minutesToday)&&(identical(other.currentStreakDays, currentStreakDays) || other.currentStreakDays == currentStreakDays)&&(identical(other.bestStreakDays, bestStreakDays) || other.bestStreakDays == bestStreakDays)&&(identical(other.activeDays, activeDays) || other.activeDays == activeDays)&&const DeepCollectionEquality().equals(other.tiers, _tiers));
}


@override
int get hashCode {
    return Object.hash(runtimeType,hasStarted,level,daysPerLevel,daysDoneThisWeek,minutesToday,currentStreakDays,bestStreakDays,activeDays,const DeepCollectionEquality().hash(_tiers));
}

@override
String toString() {
    return 'StreakStatus(hasStarted: $hasStarted, level: $level, daysPerLevel: $daysPerLevel, daysDoneThisWeek: $daysDoneThisWeek, minutesToday: $minutesToday, currentStreakDays: $currentStreakDays, bestStreakDays: $bestStreakDays, activeDays: $activeDays, tiers: $tiers)';
}


}

/// @nodoc
abstract mixin class _$StreakStatusCopyWith<$Res> implements $StreakStatusCopyWith<$Res> {
  factory _$StreakStatusCopyWith(_StreakStatus value, $Res Function(_StreakStatus) _then) = __$StreakStatusCopyWithImpl;
@override @useResult
$Res call({
 bool hasStarted, int level, int daysPerLevel, int daysDoneThisWeek, int minutesToday, int currentStreakDays, int bestStreakDays, int activeDays, List<StreakTier> tiers
});




}
/// @nodoc
class __$StreakStatusCopyWithImpl<$Res>
    implements _$StreakStatusCopyWith<$Res> {
  __$StreakStatusCopyWithImpl(this._self, this._then);

  final _StreakStatus _self;
  final $Res Function(_StreakStatus) _then;

/// Create a copy of StreakStatus
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? hasStarted = null,Object? level = null,Object? daysPerLevel = null,Object? daysDoneThisWeek = null,Object? minutesToday = null,Object? currentStreakDays = null,Object? bestStreakDays = null,Object? activeDays = null,Object? tiers = null,}) {
  return _then(_StreakStatus(
hasStarted: null == hasStarted ? _self.hasStarted : hasStarted // ignore: cast_nullable_to_non_nullable
as bool,level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,daysPerLevel: null == daysPerLevel ? _self.daysPerLevel : daysPerLevel // ignore: cast_nullable_to_non_nullable
as int,daysDoneThisWeek: null == daysDoneThisWeek ? _self.daysDoneThisWeek : daysDoneThisWeek // ignore: cast_nullable_to_non_nullable
as int,minutesToday: null == minutesToday ? _self.minutesToday : minutesToday // ignore: cast_nullable_to_non_nullable
as int,currentStreakDays: null == currentStreakDays ? _self.currentStreakDays : currentStreakDays // ignore: cast_nullable_to_non_nullable
as int,bestStreakDays: null == bestStreakDays ? _self.bestStreakDays : bestStreakDays // ignore: cast_nullable_to_non_nullable
as int,activeDays: null == activeDays ? _self.activeDays : activeDays // ignore: cast_nullable_to_non_nullable
as int,tiers: null == tiers ? _self._tiers : tiers // ignore: cast_nullable_to_non_nullable
as List<StreakTier>,
  ));
}


}

/// @nodoc
mixin _$StreakTier {

 int get level; int get minutesPerDay;
/// Create a copy of StreakTier
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StreakTierCopyWith<StreakTier> get copyWith => _$StreakTierCopyWithImpl<StreakTier>(this as StreakTier, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as StreakTier;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is StreakTier&&(identical(other.level, _this.level) || other.level == _this.level)&&(identical(other.minutesPerDay, _this.minutesPerDay) || other.minutesPerDay == _this.minutesPerDay));
}


@override
int get hashCode {
  final _this = this as StreakTier;
  return Object.hash(runtimeType,_this.level,_this.minutesPerDay);
}

@override
String toString() {
  final _this = this as StreakTier;
  return 'StreakTier(level: ${_this.level}, minutesPerDay: ${_this.minutesPerDay})';
}


}

/// @nodoc
abstract mixin class $StreakTierCopyWith<$Res>  {
  factory $StreakTierCopyWith(StreakTier value, $Res Function(StreakTier) _then) = _$StreakTierCopyWithImpl;
@useResult
$Res call({
 int level, int minutesPerDay
});




}
/// @nodoc
class _$StreakTierCopyWithImpl<$Res>
    implements $StreakTierCopyWith<$Res> {
  _$StreakTierCopyWithImpl(this._self, this._then);

  final StreakTier _self;
  final $Res Function(StreakTier) _then;

/// Create a copy of StreakTier
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? level = null,Object? minutesPerDay = null,}) {
  return _then(StreakTier(
level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,minutesPerDay: null == minutesPerDay ? _self.minutesPerDay : minutesPerDay // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [StreakTier].
extension StreakTierPatterns on StreakTier {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _StreakTier value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _StreakTier() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _StreakTier value)  $default,){
final _that = this;
switch (_that) {
case _StreakTier():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _StreakTier value)?  $default,){
final _that = this;
switch (_that) {
case _StreakTier() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int level,  int minutesPerDay)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _StreakTier() when $default != null:
return $default(_that.level,_that.minutesPerDay);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int level,  int minutesPerDay)  $default,) {final _that = this;
switch (_that) {
case _StreakTier():
return $default(_that.level,_that.minutesPerDay);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int level,  int minutesPerDay)?  $default,) {final _that = this;
switch (_that) {
case _StreakTier() when $default != null:
return $default(_that.level,_that.minutesPerDay);case _:
  return null;

}
}

}

/// @nodoc


class _StreakTier implements StreakTier {
  const _StreakTier({required this.level, required this.minutesPerDay});
  

@override final  int level;
@override final  int minutesPerDay;

/// Create a copy of StreakTier
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$StreakTierCopyWith<_StreakTier> get copyWith => __$StreakTierCopyWithImpl<_StreakTier>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _StreakTier&&(identical(other.level, level) || other.level == level)&&(identical(other.minutesPerDay, minutesPerDay) || other.minutesPerDay == minutesPerDay));
}


@override
int get hashCode {
    return Object.hash(runtimeType,level,minutesPerDay);
}

@override
String toString() {
    return 'StreakTier(level: $level, minutesPerDay: $minutesPerDay)';
}


}

/// @nodoc
abstract mixin class _$StreakTierCopyWith<$Res> implements $StreakTierCopyWith<$Res> {
  factory _$StreakTierCopyWith(_StreakTier value, $Res Function(_StreakTier) _then) = __$StreakTierCopyWithImpl;
@override @useResult
$Res call({
 int level, int minutesPerDay
});




}
/// @nodoc
class __$StreakTierCopyWithImpl<$Res>
    implements _$StreakTierCopyWith<$Res> {
  __$StreakTierCopyWithImpl(this._self, this._then);

  final _StreakTier _self;
  final $Res Function(_StreakTier) _then;

/// Create a copy of StreakTier
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? level = null,Object? minutesPerDay = null,}) {
  return _then(_StreakTier(
level: null == level ? _self.level : level // ignore: cast_nullable_to_non_nullable
as int,minutesPerDay: null == minutesPerDay ? _self.minutesPerDay : minutesPerDay // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
