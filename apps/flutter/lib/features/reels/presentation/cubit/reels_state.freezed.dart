// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'reels_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$ReelsState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ReelsState()';
}


}

/// @nodoc
class $ReelsStateCopyWith<$Res>  {
$ReelsStateCopyWith(ReelsState _, $Res Function(ReelsState) __);
}


/// Adds pattern-matching-related methods to [ReelsState].
extension ReelsStatePatterns on ReelsState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( ReelsInitial value)?  initial,TResult Function( ReelsLoading value)?  loading,TResult Function( ReelsSuccess value)?  success,TResult Function( ReelsFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case ReelsInitial() when initial != null:
return initial(_that);case ReelsLoading() when loading != null:
return loading(_that);case ReelsSuccess() when success != null:
return success(_that);case ReelsFailure() when failure != null:
return failure(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( ReelsInitial value)  initial,required TResult Function( ReelsLoading value)  loading,required TResult Function( ReelsSuccess value)  success,required TResult Function( ReelsFailure value)  failure,}){
final _that = this;
switch (_that) {
case ReelsInitial():
return initial(_that);case ReelsLoading():
return loading(_that);case ReelsSuccess():
return success(_that);case ReelsFailure():
return failure(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( ReelsInitial value)?  initial,TResult? Function( ReelsLoading value)?  loading,TResult? Function( ReelsSuccess value)?  success,TResult? Function( ReelsFailure value)?  failure,}){
final _that = this;
switch (_that) {
case ReelsInitial() when initial != null:
return initial(_that);case ReelsLoading() when loading != null:
return loading(_that);case ReelsSuccess() when success != null:
return success(_that);case ReelsFailure() when failure != null:
return failure(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( List<Reel> reels,  int pointsBalance)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case ReelsInitial() when initial != null:
return initial();case ReelsLoading() when loading != null:
return loading();case ReelsSuccess() when success != null:
return success(_that.reels,_that.pointsBalance);case ReelsFailure() when failure != null:
return failure(_that.error);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( List<Reel> reels,  int pointsBalance)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case ReelsInitial():
return initial();case ReelsLoading():
return loading();case ReelsSuccess():
return success(_that.reels,_that.pointsBalance);case ReelsFailure():
return failure(_that.error);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( List<Reel> reels,  int pointsBalance)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case ReelsInitial() when initial != null:
return initial();case ReelsLoading() when loading != null:
return loading();case ReelsSuccess() when success != null:
return success(_that.reels,_that.pointsBalance);case ReelsFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class ReelsInitial implements ReelsState {
  const ReelsInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ReelsState.initial()';
}


}




/// @nodoc


class ReelsLoading implements ReelsState {
  const ReelsLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ReelsState.loading()';
}


}




/// @nodoc


class ReelsSuccess implements ReelsState {
  const ReelsSuccess( List<Reel> reels, this.pointsBalance): _reels = reels;
  

 final  List<Reel> _reels;
 List<Reel> get reels {
  if (_reels is EqualUnmodifiableListView) return _reels;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_reels);
}

 final  int pointsBalance;

/// Create a copy of ReelsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelsSuccessCopyWith<ReelsSuccess> get copyWith => _$ReelsSuccessCopyWithImpl<ReelsSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsSuccess&&const DeepCollectionEquality().equals(other.reels, _reels)&&(identical(other.pointsBalance, pointsBalance) || other.pointsBalance == pointsBalance));
}


@override
int get hashCode {
    return Object.hash(runtimeType,const DeepCollectionEquality().hash(_reels),pointsBalance);
}

@override
String toString() {
    return 'ReelsState.success(reels: $reels, pointsBalance: $pointsBalance)';
}


}

/// @nodoc
abstract mixin class $ReelsSuccessCopyWith<$Res> implements $ReelsStateCopyWith<$Res> {
  factory $ReelsSuccessCopyWith(ReelsSuccess value, $Res Function(ReelsSuccess) _then) = _$ReelsSuccessCopyWithImpl;
@useResult
$Res call({
 List<Reel> reels, int pointsBalance
});




}
/// @nodoc
class _$ReelsSuccessCopyWithImpl<$Res>
    implements $ReelsSuccessCopyWith<$Res> {
  _$ReelsSuccessCopyWithImpl(this._self, this._then);

  final ReelsSuccess _self;
  final $Res Function(ReelsSuccess) _then;

/// Create a copy of ReelsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? reels = null,Object? pointsBalance = null,}) {
  return _then(ReelsSuccess(
null == reels ? _self._reels : reels // ignore: cast_nullable_to_non_nullable
as List<Reel>,null == pointsBalance ? _self.pointsBalance : pointsBalance // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

/// @nodoc


class ReelsFailure implements ReelsState {
  const ReelsFailure(this.error);
  

 final  AppException error;

/// Create a copy of ReelsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelsFailureCopyWith<ReelsFailure> get copyWith => _$ReelsFailureCopyWithImpl<ReelsFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'ReelsState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $ReelsFailureCopyWith<$Res> implements $ReelsStateCopyWith<$Res> {
  factory $ReelsFailureCopyWith(ReelsFailure value, $Res Function(ReelsFailure) _then) = _$ReelsFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$ReelsFailureCopyWithImpl<$Res>
    implements $ReelsFailureCopyWith<$Res> {
  _$ReelsFailureCopyWithImpl(this._self, this._then);

  final ReelsFailure _self;
  final $Res Function(ReelsFailure) _then;

/// Create a copy of ReelsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(ReelsFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
