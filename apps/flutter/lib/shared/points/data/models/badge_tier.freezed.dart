// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'badge_tier.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$BadgeTier {

 String get id; String get name; int get threshold; String get requirement;
/// Create a copy of BadgeTier
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$BadgeTierCopyWith<BadgeTier> get copyWith => _$BadgeTierCopyWithImpl<BadgeTier>(this as BadgeTier, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as BadgeTier;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is BadgeTier&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.name, _this.name) || other.name == _this.name)&&(identical(other.threshold, _this.threshold) || other.threshold == _this.threshold)&&(identical(other.requirement, _this.requirement) || other.requirement == _this.requirement));
}


@override
int get hashCode {
  final _this = this as BadgeTier;
  return Object.hash(runtimeType,_this.id,_this.name,_this.threshold,_this.requirement);
}

@override
String toString() {
  final _this = this as BadgeTier;
  return 'BadgeTier(id: ${_this.id}, name: ${_this.name}, threshold: ${_this.threshold}, requirement: ${_this.requirement})';
}


}

/// @nodoc
abstract mixin class $BadgeTierCopyWith<$Res>  {
  factory $BadgeTierCopyWith(BadgeTier value, $Res Function(BadgeTier) _then) = _$BadgeTierCopyWithImpl;
@useResult
$Res call({
 String id, String name, int threshold, String requirement
});




}
/// @nodoc
class _$BadgeTierCopyWithImpl<$Res>
    implements $BadgeTierCopyWith<$Res> {
  _$BadgeTierCopyWithImpl(this._self, this._then);

  final BadgeTier _self;
  final $Res Function(BadgeTier) _then;

/// Create a copy of BadgeTier
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? threshold = null,Object? requirement = null,}) {
  return _then(BadgeTier(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,threshold: null == threshold ? _self.threshold : threshold // ignore: cast_nullable_to_non_nullable
as int,requirement: null == requirement ? _self.requirement : requirement // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [BadgeTier].
extension BadgeTierPatterns on BadgeTier {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _BadgeTier value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _BadgeTier() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _BadgeTier value)  $default,){
final _that = this;
switch (_that) {
case _BadgeTier():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _BadgeTier value)?  $default,){
final _that = this;
switch (_that) {
case _BadgeTier() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  int threshold,  String requirement)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _BadgeTier() when $default != null:
return $default(_that.id,_that.name,_that.threshold,_that.requirement);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  int threshold,  String requirement)  $default,) {final _that = this;
switch (_that) {
case _BadgeTier():
return $default(_that.id,_that.name,_that.threshold,_that.requirement);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  int threshold,  String requirement)?  $default,) {final _that = this;
switch (_that) {
case _BadgeTier() when $default != null:
return $default(_that.id,_that.name,_that.threshold,_that.requirement);case _:
  return null;

}
}

}

/// @nodoc


class _BadgeTier implements BadgeTier {
  const _BadgeTier({required this.id, required this.name, required this.threshold, required this.requirement});
  

@override final  String id;
@override final  String name;
@override final  int threshold;
@override final  String requirement;

/// Create a copy of BadgeTier
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$BadgeTierCopyWith<_BadgeTier> get copyWith => __$BadgeTierCopyWithImpl<_BadgeTier>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _BadgeTier&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.threshold, threshold) || other.threshold == threshold)&&(identical(other.requirement, requirement) || other.requirement == requirement));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,name,threshold,requirement);
}

@override
String toString() {
    return 'BadgeTier(id: $id, name: $name, threshold: $threshold, requirement: $requirement)';
}


}

/// @nodoc
abstract mixin class _$BadgeTierCopyWith<$Res> implements $BadgeTierCopyWith<$Res> {
  factory _$BadgeTierCopyWith(_BadgeTier value, $Res Function(_BadgeTier) _then) = __$BadgeTierCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, int threshold, String requirement
});




}
/// @nodoc
class __$BadgeTierCopyWithImpl<$Res>
    implements _$BadgeTierCopyWith<$Res> {
  __$BadgeTierCopyWithImpl(this._self, this._then);

  final _BadgeTier _self;
  final $Res Function(_BadgeTier) _then;

/// Create a copy of BadgeTier
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? threshold = null,Object? requirement = null,}) {
  return _then(_BadgeTier(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,threshold: null == threshold ? _self.threshold : threshold // ignore: cast_nullable_to_non_nullable
as int,requirement: null == requirement ? _self.requirement : requirement // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
