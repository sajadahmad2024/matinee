// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'feed_reel.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$FeedReel {

 Reel get reel; ReelSource? get source; bool get isLocked;
/// Create a copy of FeedReel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$FeedReelCopyWith<FeedReel> get copyWith => _$FeedReelCopyWithImpl<FeedReel>(this as FeedReel, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as FeedReel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is FeedReel&&(identical(other.reel, _this.reel) || other.reel == _this.reel)&&(identical(other.source, _this.source) || other.source == _this.source)&&(identical(other.isLocked, _this.isLocked) || other.isLocked == _this.isLocked));
}


@override
int get hashCode {
  final _this = this as FeedReel;
  return Object.hash(runtimeType,_this.reel,_this.source,_this.isLocked);
}

@override
String toString() {
  final _this = this as FeedReel;
  return 'FeedReel(reel: ${_this.reel}, source: ${_this.source}, isLocked: ${_this.isLocked})';
}


}

/// @nodoc
abstract mixin class $FeedReelCopyWith<$Res>  {
  factory $FeedReelCopyWith(FeedReel value, $Res Function(FeedReel) _then) = _$FeedReelCopyWithImpl;
@useResult
$Res call({
 Reel reel, ReelSource? source, bool isLocked
});


$ReelCopyWith<$Res> get reel;

}
/// @nodoc
class _$FeedReelCopyWithImpl<$Res>
    implements $FeedReelCopyWith<$Res> {
  _$FeedReelCopyWithImpl(this._self, this._then);

  final FeedReel _self;
  final $Res Function(FeedReel) _then;

/// Create a copy of FeedReel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? reel = null,Object? source = freezed,Object? isLocked = null,}) {
  return _then(FeedReel(
reel: null == reel ? _self.reel : reel // ignore: cast_nullable_to_non_nullable
as Reel,source: freezed == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as ReelSource?,isLocked: null == isLocked ? _self.isLocked : isLocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}
/// Create a copy of FeedReel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelCopyWith<$Res> get reel {
  
  return $ReelCopyWith<$Res>(_self.reel, (value) {
    return _then(_self.copyWith(reel: value));
  });
}
}


/// Adds pattern-matching-related methods to [FeedReel].
extension FeedReelPatterns on FeedReel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _FeedReel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _FeedReel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _FeedReel value)  $default,){
final _that = this;
switch (_that) {
case _FeedReel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _FeedReel value)?  $default,){
final _that = this;
switch (_that) {
case _FeedReel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( Reel reel,  ReelSource? source,  bool isLocked)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _FeedReel() when $default != null:
return $default(_that.reel,_that.source,_that.isLocked);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( Reel reel,  ReelSource? source,  bool isLocked)  $default,) {final _that = this;
switch (_that) {
case _FeedReel():
return $default(_that.reel,_that.source,_that.isLocked);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( Reel reel,  ReelSource? source,  bool isLocked)?  $default,) {final _that = this;
switch (_that) {
case _FeedReel() when $default != null:
return $default(_that.reel,_that.source,_that.isLocked);case _:
  return null;

}
}

}

/// @nodoc


class _FeedReel extends FeedReel {
  const _FeedReel({required this.reel, required this.source, required this.isLocked}): super._();
  

@override final  Reel reel;
@override final  ReelSource? source;
@override final  bool isLocked;

/// Create a copy of FeedReel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$FeedReelCopyWith<_FeedReel> get copyWith => __$FeedReelCopyWithImpl<_FeedReel>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _FeedReel&&(identical(other.reel, reel) || other.reel == reel)&&(identical(other.source, source) || other.source == source)&&(identical(other.isLocked, isLocked) || other.isLocked == isLocked));
}


@override
int get hashCode {
    return Object.hash(runtimeType,reel,source,isLocked);
}

@override
String toString() {
    return 'FeedReel(reel: $reel, source: $source, isLocked: $isLocked)';
}


}

/// @nodoc
abstract mixin class _$FeedReelCopyWith<$Res> implements $FeedReelCopyWith<$Res> {
  factory _$FeedReelCopyWith(_FeedReel value, $Res Function(_FeedReel) _then) = __$FeedReelCopyWithImpl;
@override @useResult
$Res call({
 Reel reel, ReelSource? source, bool isLocked
});


@override $ReelCopyWith<$Res> get reel;

}
/// @nodoc
class __$FeedReelCopyWithImpl<$Res>
    implements _$FeedReelCopyWith<$Res> {
  __$FeedReelCopyWithImpl(this._self, this._then);

  final _FeedReel _self;
  final $Res Function(_FeedReel) _then;

/// Create a copy of FeedReel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? reel = null,Object? source = freezed,Object? isLocked = null,}) {
  return _then(_FeedReel(
reel: null == reel ? _self.reel : reel // ignore: cast_nullable_to_non_nullable
as Reel,source: freezed == source ? _self.source : source // ignore: cast_nullable_to_non_nullable
as ReelSource?,isLocked: null == isLocked ? _self.isLocked : isLocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

/// Create a copy of FeedReel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelCopyWith<$Res> get reel {
  
  return $ReelCopyWith<$Res>(_self.reel, (value) {
    return _then(_self.copyWith(reel: value));
  });
}
}

// dart format on
