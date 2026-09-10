// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'earn_source.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$EarnSource {

 EarnSourceKind get kind; String get title; String get activity; int get points;
/// Create a copy of EarnSource
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EarnSourceCopyWith<EarnSource> get copyWith => _$EarnSourceCopyWithImpl<EarnSource>(this as EarnSource, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as EarnSource;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnSource&&(identical(other.kind, _this.kind) || other.kind == _this.kind)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.activity, _this.activity) || other.activity == _this.activity)&&(identical(other.points, _this.points) || other.points == _this.points));
}


@override
int get hashCode {
  final _this = this as EarnSource;
  return Object.hash(runtimeType,_this.kind,_this.title,_this.activity,_this.points);
}

@override
String toString() {
  final _this = this as EarnSource;
  return 'EarnSource(kind: ${_this.kind}, title: ${_this.title}, activity: ${_this.activity}, points: ${_this.points})';
}


}

/// @nodoc
abstract mixin class $EarnSourceCopyWith<$Res>  {
  factory $EarnSourceCopyWith(EarnSource value, $Res Function(EarnSource) _then) = _$EarnSourceCopyWithImpl;
@useResult
$Res call({
 EarnSourceKind kind, String title, String activity, int points
});




}
/// @nodoc
class _$EarnSourceCopyWithImpl<$Res>
    implements $EarnSourceCopyWith<$Res> {
  _$EarnSourceCopyWithImpl(this._self, this._then);

  final EarnSource _self;
  final $Res Function(EarnSource) _then;

/// Create a copy of EarnSource
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? kind = null,Object? title = null,Object? activity = null,Object? points = null,}) {
  return _then(EarnSource(
kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as EarnSourceKind,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,activity: null == activity ? _self.activity : activity // ignore: cast_nullable_to_non_nullable
as String,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [EarnSource].
extension EarnSourcePatterns on EarnSource {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _EarnSource value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _EarnSource() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _EarnSource value)  $default,){
final _that = this;
switch (_that) {
case _EarnSource():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _EarnSource value)?  $default,){
final _that = this;
switch (_that) {
case _EarnSource() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( EarnSourceKind kind,  String title,  String activity,  int points)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _EarnSource() when $default != null:
return $default(_that.kind,_that.title,_that.activity,_that.points);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( EarnSourceKind kind,  String title,  String activity,  int points)  $default,) {final _that = this;
switch (_that) {
case _EarnSource():
return $default(_that.kind,_that.title,_that.activity,_that.points);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( EarnSourceKind kind,  String title,  String activity,  int points)?  $default,) {final _that = this;
switch (_that) {
case _EarnSource() when $default != null:
return $default(_that.kind,_that.title,_that.activity,_that.points);case _:
  return null;

}
}

}

/// @nodoc


class _EarnSource implements EarnSource {
  const _EarnSource({required this.kind, required this.title, required this.activity, required this.points});
  

@override final  EarnSourceKind kind;
@override final  String title;
@override final  String activity;
@override final  int points;

/// Create a copy of EarnSource
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$EarnSourceCopyWith<_EarnSource> get copyWith => __$EarnSourceCopyWithImpl<_EarnSource>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _EarnSource&&(identical(other.kind, kind) || other.kind == kind)&&(identical(other.title, title) || other.title == title)&&(identical(other.activity, activity) || other.activity == activity)&&(identical(other.points, points) || other.points == points));
}


@override
int get hashCode {
    return Object.hash(runtimeType,kind,title,activity,points);
}

@override
String toString() {
    return 'EarnSource(kind: $kind, title: $title, activity: $activity, points: $points)';
}


}

/// @nodoc
abstract mixin class _$EarnSourceCopyWith<$Res> implements $EarnSourceCopyWith<$Res> {
  factory _$EarnSourceCopyWith(_EarnSource value, $Res Function(_EarnSource) _then) = __$EarnSourceCopyWithImpl;
@override @useResult
$Res call({
 EarnSourceKind kind, String title, String activity, int points
});




}
/// @nodoc
class __$EarnSourceCopyWithImpl<$Res>
    implements _$EarnSourceCopyWith<$Res> {
  __$EarnSourceCopyWithImpl(this._self, this._then);

  final _EarnSource _self;
  final $Res Function(_EarnSource) _then;

/// Create a copy of EarnSource
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? kind = null,Object? title = null,Object? activity = null,Object? points = null,}) {
  return _then(_EarnSource(
kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as EarnSourceKind,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,activity: null == activity ? _self.activity : activity // ignore: cast_nullable_to_non_nullable
as String,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

// dart format on
