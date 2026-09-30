// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'reels_feed_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$ReelsFeedState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsFeedState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ReelsFeedState()';
}


}

/// @nodoc
class $ReelsFeedStateCopyWith<$Res>  {
$ReelsFeedStateCopyWith(ReelsFeedState _, $Res Function(ReelsFeedState) __);
}


/// Adds pattern-matching-related methods to [ReelsFeedState].
extension ReelsFeedStatePatterns on ReelsFeedState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( ReelsFeedInitial value)?  initial,TResult Function( ReelsFeedLoading value)?  loading,TResult Function( ReelsFeedSuccess value)?  success,TResult Function( ReelsFeedFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case ReelsFeedInitial() when initial != null:
return initial(_that);case ReelsFeedLoading() when loading != null:
return loading(_that);case ReelsFeedSuccess() when success != null:
return success(_that);case ReelsFeedFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( ReelsFeedInitial value)  initial,required TResult Function( ReelsFeedLoading value)  loading,required TResult Function( ReelsFeedSuccess value)  success,required TResult Function( ReelsFeedFailure value)  failure,}){
final _that = this;
switch (_that) {
case ReelsFeedInitial():
return initial(_that);case ReelsFeedLoading():
return loading(_that);case ReelsFeedSuccess():
return success(_that);case ReelsFeedFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( ReelsFeedInitial value)?  initial,TResult? Function( ReelsFeedLoading value)?  loading,TResult? Function( ReelsFeedSuccess value)?  success,TResult? Function( ReelsFeedFailure value)?  failure,}){
final _that = this;
switch (_that) {
case ReelsFeedInitial() when initial != null:
return initial(_that);case ReelsFeedLoading() when loading != null:
return loading(_that);case ReelsFeedSuccess() when success != null:
return success(_that);case ReelsFeedFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( List<FeedReel> feed,  int pointsBalance)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case ReelsFeedInitial() when initial != null:
return initial();case ReelsFeedLoading() when loading != null:
return loading();case ReelsFeedSuccess() when success != null:
return success(_that.feed,_that.pointsBalance);case ReelsFeedFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( List<FeedReel> feed,  int pointsBalance)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case ReelsFeedInitial():
return initial();case ReelsFeedLoading():
return loading();case ReelsFeedSuccess():
return success(_that.feed,_that.pointsBalance);case ReelsFeedFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( List<FeedReel> feed,  int pointsBalance)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case ReelsFeedInitial() when initial != null:
return initial();case ReelsFeedLoading() when loading != null:
return loading();case ReelsFeedSuccess() when success != null:
return success(_that.feed,_that.pointsBalance);case ReelsFeedFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class ReelsFeedInitial implements ReelsFeedState {
  const ReelsFeedInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsFeedInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ReelsFeedState.initial()';
}


}




/// @nodoc


class ReelsFeedLoading implements ReelsFeedState {
  const ReelsFeedLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsFeedLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ReelsFeedState.loading()';
}


}




/// @nodoc


class ReelsFeedSuccess implements ReelsFeedState {
  const ReelsFeedSuccess( List<FeedReel> feed, this.pointsBalance): _feed = feed;
  

 final  List<FeedReel> _feed;
 List<FeedReel> get feed {
  if (_feed is EqualUnmodifiableListView) return _feed;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_feed);
}

 final  int pointsBalance;

/// Create a copy of ReelsFeedState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelsFeedSuccessCopyWith<ReelsFeedSuccess> get copyWith => _$ReelsFeedSuccessCopyWithImpl<ReelsFeedSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsFeedSuccess&&const DeepCollectionEquality().equals(other.feed, _feed)&&(identical(other.pointsBalance, pointsBalance) || other.pointsBalance == pointsBalance));
}


@override
int get hashCode {
    return Object.hash(runtimeType,const DeepCollectionEquality().hash(_feed),pointsBalance);
}

@override
String toString() {
    return 'ReelsFeedState.success(feed: $feed, pointsBalance: $pointsBalance)';
}


}

/// @nodoc
abstract mixin class $ReelsFeedSuccessCopyWith<$Res> implements $ReelsFeedStateCopyWith<$Res> {
  factory $ReelsFeedSuccessCopyWith(ReelsFeedSuccess value, $Res Function(ReelsFeedSuccess) _then) = _$ReelsFeedSuccessCopyWithImpl;
@useResult
$Res call({
 List<FeedReel> feed, int pointsBalance
});




}
/// @nodoc
class _$ReelsFeedSuccessCopyWithImpl<$Res>
    implements $ReelsFeedSuccessCopyWith<$Res> {
  _$ReelsFeedSuccessCopyWithImpl(this._self, this._then);

  final ReelsFeedSuccess _self;
  final $Res Function(ReelsFeedSuccess) _then;

/// Create a copy of ReelsFeedState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? feed = null,Object? pointsBalance = null,}) {
  return _then(ReelsFeedSuccess(
null == feed ? _self._feed : feed // ignore: cast_nullable_to_non_nullable
as List<FeedReel>,null == pointsBalance ? _self.pointsBalance : pointsBalance // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

/// @nodoc


class ReelsFeedFailure implements ReelsFeedState {
  const ReelsFeedFailure(this.error);
  

 final  AppException error;

/// Create a copy of ReelsFeedState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelsFeedFailureCopyWith<ReelsFeedFailure> get copyWith => _$ReelsFeedFailureCopyWithImpl<ReelsFeedFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelsFeedFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'ReelsFeedState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $ReelsFeedFailureCopyWith<$Res> implements $ReelsFeedStateCopyWith<$Res> {
  factory $ReelsFeedFailureCopyWith(ReelsFeedFailure value, $Res Function(ReelsFeedFailure) _then) = _$ReelsFeedFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$ReelsFeedFailureCopyWithImpl<$Res>
    implements $ReelsFeedFailureCopyWith<$Res> {
  _$ReelsFeedFailureCopyWithImpl(this._self, this._then);

  final ReelsFeedFailure _self;
  final $Res Function(ReelsFeedFailure) _then;

/// Create a copy of ReelsFeedState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(ReelsFeedFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
