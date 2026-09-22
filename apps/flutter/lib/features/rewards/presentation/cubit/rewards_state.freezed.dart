// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'rewards_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$RewardsState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is RewardsState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'RewardsState()';
}


}

/// @nodoc
class $RewardsStateCopyWith<$Res>  {
$RewardsStateCopyWith(RewardsState _, $Res Function(RewardsState) __);
}


/// Adds pattern-matching-related methods to [RewardsState].
extension RewardsStatePatterns on RewardsState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( RewardsInitial value)?  initial,TResult Function( RewardsLoading value)?  loading,TResult Function( RewardsSuccess value)?  success,TResult Function( RewardsFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case RewardsInitial() when initial != null:
return initial(_that);case RewardsLoading() when loading != null:
return loading(_that);case RewardsSuccess() when success != null:
return success(_that);case RewardsFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( RewardsInitial value)  initial,required TResult Function( RewardsLoading value)  loading,required TResult Function( RewardsSuccess value)  success,required TResult Function( RewardsFailure value)  failure,}){
final _that = this;
switch (_that) {
case RewardsInitial():
return initial(_that);case RewardsLoading():
return loading(_that);case RewardsSuccess():
return success(_that);case RewardsFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( RewardsInitial value)?  initial,TResult? Function( RewardsLoading value)?  loading,TResult? Function( RewardsSuccess value)?  success,TResult? Function( RewardsFailure value)?  failure,}){
final _that = this;
switch (_that) {
case RewardsInitial() when initial != null:
return initial(_that);case RewardsLoading() when loading != null:
return loading(_that);case RewardsSuccess() when success != null:
return success(_that);case RewardsFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( RewardsSummary summary)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case RewardsInitial() when initial != null:
return initial();case RewardsLoading() when loading != null:
return loading();case RewardsSuccess() when success != null:
return success(_that.summary);case RewardsFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( RewardsSummary summary)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case RewardsInitial():
return initial();case RewardsLoading():
return loading();case RewardsSuccess():
return success(_that.summary);case RewardsFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( RewardsSummary summary)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case RewardsInitial() when initial != null:
return initial();case RewardsLoading() when loading != null:
return loading();case RewardsSuccess() when success != null:
return success(_that.summary);case RewardsFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class RewardsInitial implements RewardsState {
  const RewardsInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is RewardsInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'RewardsState.initial()';
}


}




/// @nodoc


class RewardsLoading implements RewardsState {
  const RewardsLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is RewardsLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'RewardsState.loading()';
}


}




/// @nodoc


class RewardsSuccess implements RewardsState {
  const RewardsSuccess(this.summary);
  

 final  RewardsSummary summary;

/// Create a copy of RewardsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RewardsSuccessCopyWith<RewardsSuccess> get copyWith => _$RewardsSuccessCopyWithImpl<RewardsSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is RewardsSuccess&&(identical(other.summary, summary) || other.summary == summary));
}


@override
int get hashCode {
    return Object.hash(runtimeType,summary);
}

@override
String toString() {
    return 'RewardsState.success(summary: $summary)';
}


}

/// @nodoc
abstract mixin class $RewardsSuccessCopyWith<$Res> implements $RewardsStateCopyWith<$Res> {
  factory $RewardsSuccessCopyWith(RewardsSuccess value, $Res Function(RewardsSuccess) _then) = _$RewardsSuccessCopyWithImpl;
@useResult
$Res call({
 RewardsSummary summary
});


$RewardsSummaryCopyWith<$Res> get summary;

}
/// @nodoc
class _$RewardsSuccessCopyWithImpl<$Res>
    implements $RewardsSuccessCopyWith<$Res> {
  _$RewardsSuccessCopyWithImpl(this._self, this._then);

  final RewardsSuccess _self;
  final $Res Function(RewardsSuccess) _then;

/// Create a copy of RewardsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? summary = null,}) {
  return _then(RewardsSuccess(
null == summary ? _self.summary : summary // ignore: cast_nullable_to_non_nullable
as RewardsSummary,
  ));
}

/// Create a copy of RewardsState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$RewardsSummaryCopyWith<$Res> get summary {
  
  return $RewardsSummaryCopyWith<$Res>(_self.summary, (value) {
    return _then(_self.copyWith(summary: value));
  });
}
}

/// @nodoc


class RewardsFailure implements RewardsState {
  const RewardsFailure(this.error);
  

 final  AppException error;

/// Create a copy of RewardsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$RewardsFailureCopyWith<RewardsFailure> get copyWith => _$RewardsFailureCopyWithImpl<RewardsFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is RewardsFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'RewardsState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $RewardsFailureCopyWith<$Res> implements $RewardsStateCopyWith<$Res> {
  factory $RewardsFailureCopyWith(RewardsFailure value, $Res Function(RewardsFailure) _then) = _$RewardsFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$RewardsFailureCopyWithImpl<$Res>
    implements $RewardsFailureCopyWith<$Res> {
  _$RewardsFailureCopyWithImpl(this._self, this._then);

  final RewardsFailure _self;
  final $Res Function(RewardsFailure) _then;

/// Create a copy of RewardsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(RewardsFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
