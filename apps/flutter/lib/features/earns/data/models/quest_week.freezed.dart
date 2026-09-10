// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quest_week.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$QuestWeek {

 String get id; String get title; DateTime get startsOn; DateTime get endsOn; DateTime get completedOn; int get actionsCompleted; int get actionsTotal; int get pointsAwarded; String? get badgeAwarded;
/// Create a copy of QuestWeek
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuestWeekCopyWith<QuestWeek> get copyWith => _$QuestWeekCopyWithImpl<QuestWeek>(this as QuestWeek, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as QuestWeek;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuestWeek&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.startsOn, _this.startsOn) || other.startsOn == _this.startsOn)&&(identical(other.endsOn, _this.endsOn) || other.endsOn == _this.endsOn)&&(identical(other.completedOn, _this.completedOn) || other.completedOn == _this.completedOn)&&(identical(other.actionsCompleted, _this.actionsCompleted) || other.actionsCompleted == _this.actionsCompleted)&&(identical(other.actionsTotal, _this.actionsTotal) || other.actionsTotal == _this.actionsTotal)&&(identical(other.pointsAwarded, _this.pointsAwarded) || other.pointsAwarded == _this.pointsAwarded)&&(identical(other.badgeAwarded, _this.badgeAwarded) || other.badgeAwarded == _this.badgeAwarded));
}


@override
int get hashCode {
  final _this = this as QuestWeek;
  return Object.hash(runtimeType,_this.id,_this.title,_this.startsOn,_this.endsOn,_this.completedOn,_this.actionsCompleted,_this.actionsTotal,_this.pointsAwarded,_this.badgeAwarded);
}

@override
String toString() {
  final _this = this as QuestWeek;
  return 'QuestWeek(id: ${_this.id}, title: ${_this.title}, startsOn: ${_this.startsOn}, endsOn: ${_this.endsOn}, completedOn: ${_this.completedOn}, actionsCompleted: ${_this.actionsCompleted}, actionsTotal: ${_this.actionsTotal}, pointsAwarded: ${_this.pointsAwarded}, badgeAwarded: ${_this.badgeAwarded})';
}


}

/// @nodoc
abstract mixin class $QuestWeekCopyWith<$Res>  {
  factory $QuestWeekCopyWith(QuestWeek value, $Res Function(QuestWeek) _then) = _$QuestWeekCopyWithImpl;
@useResult
$Res call({
 String id, String title, DateTime startsOn, DateTime endsOn, DateTime completedOn, int actionsCompleted, int actionsTotal, int pointsAwarded, String? badgeAwarded
});




}
/// @nodoc
class _$QuestWeekCopyWithImpl<$Res>
    implements $QuestWeekCopyWith<$Res> {
  _$QuestWeekCopyWithImpl(this._self, this._then);

  final QuestWeek _self;
  final $Res Function(QuestWeek) _then;

/// Create a copy of QuestWeek
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? startsOn = null,Object? endsOn = null,Object? completedOn = null,Object? actionsCompleted = null,Object? actionsTotal = null,Object? pointsAwarded = null,Object? badgeAwarded = freezed,}) {
  return _then(QuestWeek(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,startsOn: null == startsOn ? _self.startsOn : startsOn // ignore: cast_nullable_to_non_nullable
as DateTime,endsOn: null == endsOn ? _self.endsOn : endsOn // ignore: cast_nullable_to_non_nullable
as DateTime,completedOn: null == completedOn ? _self.completedOn : completedOn // ignore: cast_nullable_to_non_nullable
as DateTime,actionsCompleted: null == actionsCompleted ? _self.actionsCompleted : actionsCompleted // ignore: cast_nullable_to_non_nullable
as int,actionsTotal: null == actionsTotal ? _self.actionsTotal : actionsTotal // ignore: cast_nullable_to_non_nullable
as int,pointsAwarded: null == pointsAwarded ? _self.pointsAwarded : pointsAwarded // ignore: cast_nullable_to_non_nullable
as int,badgeAwarded: freezed == badgeAwarded ? _self.badgeAwarded : badgeAwarded // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [QuestWeek].
extension QuestWeekPatterns on QuestWeek {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _QuestWeek value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _QuestWeek() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _QuestWeek value)  $default,){
final _that = this;
switch (_that) {
case _QuestWeek():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _QuestWeek value)?  $default,){
final _that = this;
switch (_that) {
case _QuestWeek() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  DateTime startsOn,  DateTime endsOn,  DateTime completedOn,  int actionsCompleted,  int actionsTotal,  int pointsAwarded,  String? badgeAwarded)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _QuestWeek() when $default != null:
return $default(_that.id,_that.title,_that.startsOn,_that.endsOn,_that.completedOn,_that.actionsCompleted,_that.actionsTotal,_that.pointsAwarded,_that.badgeAwarded);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  DateTime startsOn,  DateTime endsOn,  DateTime completedOn,  int actionsCompleted,  int actionsTotal,  int pointsAwarded,  String? badgeAwarded)  $default,) {final _that = this;
switch (_that) {
case _QuestWeek():
return $default(_that.id,_that.title,_that.startsOn,_that.endsOn,_that.completedOn,_that.actionsCompleted,_that.actionsTotal,_that.pointsAwarded,_that.badgeAwarded);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  DateTime startsOn,  DateTime endsOn,  DateTime completedOn,  int actionsCompleted,  int actionsTotal,  int pointsAwarded,  String? badgeAwarded)?  $default,) {final _that = this;
switch (_that) {
case _QuestWeek() when $default != null:
return $default(_that.id,_that.title,_that.startsOn,_that.endsOn,_that.completedOn,_that.actionsCompleted,_that.actionsTotal,_that.pointsAwarded,_that.badgeAwarded);case _:
  return null;

}
}

}

/// @nodoc


class _QuestWeek implements QuestWeek {
  const _QuestWeek({required this.id, required this.title, required this.startsOn, required this.endsOn, required this.completedOn, required this.actionsCompleted, required this.actionsTotal, required this.pointsAwarded, this.badgeAwarded});
  

@override final  String id;
@override final  String title;
@override final  DateTime startsOn;
@override final  DateTime endsOn;
@override final  DateTime completedOn;
@override final  int actionsCompleted;
@override final  int actionsTotal;
@override final  int pointsAwarded;
@override final  String? badgeAwarded;

/// Create a copy of QuestWeek
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$QuestWeekCopyWith<_QuestWeek> get copyWith => __$QuestWeekCopyWithImpl<_QuestWeek>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _QuestWeek&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.startsOn, startsOn) || other.startsOn == startsOn)&&(identical(other.endsOn, endsOn) || other.endsOn == endsOn)&&(identical(other.completedOn, completedOn) || other.completedOn == completedOn)&&(identical(other.actionsCompleted, actionsCompleted) || other.actionsCompleted == actionsCompleted)&&(identical(other.actionsTotal, actionsTotal) || other.actionsTotal == actionsTotal)&&(identical(other.pointsAwarded, pointsAwarded) || other.pointsAwarded == pointsAwarded)&&(identical(other.badgeAwarded, badgeAwarded) || other.badgeAwarded == badgeAwarded));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,title,startsOn,endsOn,completedOn,actionsCompleted,actionsTotal,pointsAwarded,badgeAwarded);
}

@override
String toString() {
    return 'QuestWeek(id: $id, title: $title, startsOn: $startsOn, endsOn: $endsOn, completedOn: $completedOn, actionsCompleted: $actionsCompleted, actionsTotal: $actionsTotal, pointsAwarded: $pointsAwarded, badgeAwarded: $badgeAwarded)';
}


}

/// @nodoc
abstract mixin class _$QuestWeekCopyWith<$Res> implements $QuestWeekCopyWith<$Res> {
  factory _$QuestWeekCopyWith(_QuestWeek value, $Res Function(_QuestWeek) _then) = __$QuestWeekCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, DateTime startsOn, DateTime endsOn, DateTime completedOn, int actionsCompleted, int actionsTotal, int pointsAwarded, String? badgeAwarded
});




}
/// @nodoc
class __$QuestWeekCopyWithImpl<$Res>
    implements _$QuestWeekCopyWith<$Res> {
  __$QuestWeekCopyWithImpl(this._self, this._then);

  final _QuestWeek _self;
  final $Res Function(_QuestWeek) _then;

/// Create a copy of QuestWeek
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? startsOn = null,Object? endsOn = null,Object? completedOn = null,Object? actionsCompleted = null,Object? actionsTotal = null,Object? pointsAwarded = null,Object? badgeAwarded = freezed,}) {
  return _then(_QuestWeek(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,startsOn: null == startsOn ? _self.startsOn : startsOn // ignore: cast_nullable_to_non_nullable
as DateTime,endsOn: null == endsOn ? _self.endsOn : endsOn // ignore: cast_nullable_to_non_nullable
as DateTime,completedOn: null == completedOn ? _self.completedOn : completedOn // ignore: cast_nullable_to_non_nullable
as DateTime,actionsCompleted: null == actionsCompleted ? _self.actionsCompleted : actionsCompleted // ignore: cast_nullable_to_non_nullable
as int,actionsTotal: null == actionsTotal ? _self.actionsTotal : actionsTotal // ignore: cast_nullable_to_non_nullable
as int,pointsAwarded: null == pointsAwarded ? _self.pointsAwarded : pointsAwarded // ignore: cast_nullable_to_non_nullable
as int,badgeAwarded: freezed == badgeAwarded ? _self.badgeAwarded : badgeAwarded // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
