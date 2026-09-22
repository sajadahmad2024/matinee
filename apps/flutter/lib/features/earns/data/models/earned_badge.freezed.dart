// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'earned_badge.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$EarnedBadge {

 String get id; String get name; String get requirement; BadgeStatus get status;
/// Create a copy of EarnedBadge
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EarnedBadgeCopyWith<EarnedBadge> get copyWith => _$EarnedBadgeCopyWithImpl<EarnedBadge>(this as EarnedBadge, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as EarnedBadge;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnedBadge&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.name, _this.name) || other.name == _this.name)&&(identical(other.requirement, _this.requirement) || other.requirement == _this.requirement)&&(identical(other.status, _this.status) || other.status == _this.status));
}


@override
int get hashCode {
  final _this = this as EarnedBadge;
  return Object.hash(runtimeType,_this.id,_this.name,_this.requirement,_this.status);
}

@override
String toString() {
  final _this = this as EarnedBadge;
  return 'EarnedBadge(id: ${_this.id}, name: ${_this.name}, requirement: ${_this.requirement}, status: ${_this.status})';
}


}

/// @nodoc
abstract mixin class $EarnedBadgeCopyWith<$Res>  {
  factory $EarnedBadgeCopyWith(EarnedBadge value, $Res Function(EarnedBadge) _then) = _$EarnedBadgeCopyWithImpl;
@useResult
$Res call({
 String id, String name, String requirement, BadgeStatus status
});




}
/// @nodoc
class _$EarnedBadgeCopyWithImpl<$Res>
    implements $EarnedBadgeCopyWith<$Res> {
  _$EarnedBadgeCopyWithImpl(this._self, this._then);

  final EarnedBadge _self;
  final $Res Function(EarnedBadge) _then;

/// Create a copy of EarnedBadge
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? requirement = null,Object? status = null,}) {
  return _then(EarnedBadge(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,requirement: null == requirement ? _self.requirement : requirement // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as BadgeStatus,
  ));
}

}


/// Adds pattern-matching-related methods to [EarnedBadge].
extension EarnedBadgePatterns on EarnedBadge {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _EarnedBadge value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _EarnedBadge() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _EarnedBadge value)  $default,){
final _that = this;
switch (_that) {
case _EarnedBadge():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _EarnedBadge value)?  $default,){
final _that = this;
switch (_that) {
case _EarnedBadge() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String requirement,  BadgeStatus status)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _EarnedBadge() when $default != null:
return $default(_that.id,_that.name,_that.requirement,_that.status);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String requirement,  BadgeStatus status)  $default,) {final _that = this;
switch (_that) {
case _EarnedBadge():
return $default(_that.id,_that.name,_that.requirement,_that.status);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String requirement,  BadgeStatus status)?  $default,) {final _that = this;
switch (_that) {
case _EarnedBadge() when $default != null:
return $default(_that.id,_that.name,_that.requirement,_that.status);case _:
  return null;

}
}

}

/// @nodoc


class _EarnedBadge implements EarnedBadge {
  const _EarnedBadge({required this.id, required this.name, required this.requirement, required this.status});
  

@override final  String id;
@override final  String name;
@override final  String requirement;
@override final  BadgeStatus status;

/// Create a copy of EarnedBadge
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$EarnedBadgeCopyWith<_EarnedBadge> get copyWith => __$EarnedBadgeCopyWithImpl<_EarnedBadge>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _EarnedBadge&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.requirement, requirement) || other.requirement == requirement)&&(identical(other.status, status) || other.status == status));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,name,requirement,status);
}

@override
String toString() {
    return 'EarnedBadge(id: $id, name: $name, requirement: $requirement, status: $status)';
}


}

/// @nodoc
abstract mixin class _$EarnedBadgeCopyWith<$Res> implements $EarnedBadgeCopyWith<$Res> {
  factory _$EarnedBadgeCopyWith(_EarnedBadge value, $Res Function(_EarnedBadge) _then) = __$EarnedBadgeCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String requirement, BadgeStatus status
});




}
/// @nodoc
class __$EarnedBadgeCopyWithImpl<$Res>
    implements _$EarnedBadgeCopyWith<$Res> {
  __$EarnedBadgeCopyWithImpl(this._self, this._then);

  final _EarnedBadge _self;
  final $Res Function(_EarnedBadge) _then;

/// Create a copy of EarnedBadge
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? requirement = null,Object? status = null,}) {
  return _then(_EarnedBadge(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,requirement: null == requirement ? _self.requirement : requirement // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as BadgeStatus,
  ));
}


}

// dart format on
