// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'daily_streak_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$DailyStreakState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is DailyStreakState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'DailyStreakState()';
}


}

/// @nodoc
class $DailyStreakStateCopyWith<$Res>  {
$DailyStreakStateCopyWith(DailyStreakState _, $Res Function(DailyStreakState) __);
}


/// Adds pattern-matching-related methods to [DailyStreakState].
extension DailyStreakStatePatterns on DailyStreakState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( DailyStreakInitial value)?  initial,TResult Function( DailyStreakLoading value)?  loading,TResult Function( DailyStreakSuccess value)?  success,TResult Function( DailyStreakFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case DailyStreakInitial() when initial != null:
return initial(_that);case DailyStreakLoading() when loading != null:
return loading(_that);case DailyStreakSuccess() when success != null:
return success(_that);case DailyStreakFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( DailyStreakInitial value)  initial,required TResult Function( DailyStreakLoading value)  loading,required TResult Function( DailyStreakSuccess value)  success,required TResult Function( DailyStreakFailure value)  failure,}){
final _that = this;
switch (_that) {
case DailyStreakInitial():
return initial(_that);case DailyStreakLoading():
return loading(_that);case DailyStreakSuccess():
return success(_that);case DailyStreakFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( DailyStreakInitial value)?  initial,TResult? Function( DailyStreakLoading value)?  loading,TResult? Function( DailyStreakSuccess value)?  success,TResult? Function( DailyStreakFailure value)?  failure,}){
final _that = this;
switch (_that) {
case DailyStreakInitial() when initial != null:
return initial(_that);case DailyStreakLoading() when loading != null:
return loading(_that);case DailyStreakSuccess() when success != null:
return success(_that);case DailyStreakFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( StreakStatus streak,  bool isBusy,  AppException? actionError)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case DailyStreakInitial() when initial != null:
return initial();case DailyStreakLoading() when loading != null:
return loading();case DailyStreakSuccess() when success != null:
return success(_that.streak,_that.isBusy,_that.actionError);case DailyStreakFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( StreakStatus streak,  bool isBusy,  AppException? actionError)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case DailyStreakInitial():
return initial();case DailyStreakLoading():
return loading();case DailyStreakSuccess():
return success(_that.streak,_that.isBusy,_that.actionError);case DailyStreakFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( StreakStatus streak,  bool isBusy,  AppException? actionError)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case DailyStreakInitial() when initial != null:
return initial();case DailyStreakLoading() when loading != null:
return loading();case DailyStreakSuccess() when success != null:
return success(_that.streak,_that.isBusy,_that.actionError);case DailyStreakFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class DailyStreakInitial implements DailyStreakState {
  const DailyStreakInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is DailyStreakInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'DailyStreakState.initial()';
}


}




/// @nodoc


class DailyStreakLoading implements DailyStreakState {
  const DailyStreakLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is DailyStreakLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'DailyStreakState.loading()';
}


}




/// @nodoc


class DailyStreakSuccess implements DailyStreakState {
  const DailyStreakSuccess(this.streak, {this.isBusy = false, this.actionError});
  

 final  StreakStatus streak;
@JsonKey() final  bool isBusy;
 final  AppException? actionError;

/// Create a copy of DailyStreakState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DailyStreakSuccessCopyWith<DailyStreakSuccess> get copyWith => _$DailyStreakSuccessCopyWithImpl<DailyStreakSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is DailyStreakSuccess&&(identical(other.streak, streak) || other.streak == streak)&&(identical(other.isBusy, isBusy) || other.isBusy == isBusy)&&(identical(other.actionError, actionError) || other.actionError == actionError));
}


@override
int get hashCode {
    return Object.hash(runtimeType,streak,isBusy,actionError);
}

@override
String toString() {
    return 'DailyStreakState.success(streak: $streak, isBusy: $isBusy, actionError: $actionError)';
}


}

/// @nodoc
abstract mixin class $DailyStreakSuccessCopyWith<$Res> implements $DailyStreakStateCopyWith<$Res> {
  factory $DailyStreakSuccessCopyWith(DailyStreakSuccess value, $Res Function(DailyStreakSuccess) _then) = _$DailyStreakSuccessCopyWithImpl;
@useResult
$Res call({
 StreakStatus streak, bool isBusy, AppException? actionError
});


$StreakStatusCopyWith<$Res> get streak;

}
/// @nodoc
class _$DailyStreakSuccessCopyWithImpl<$Res>
    implements $DailyStreakSuccessCopyWith<$Res> {
  _$DailyStreakSuccessCopyWithImpl(this._self, this._then);

  final DailyStreakSuccess _self;
  final $Res Function(DailyStreakSuccess) _then;

/// Create a copy of DailyStreakState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? streak = null,Object? isBusy = null,Object? actionError = freezed,}) {
  return _then(DailyStreakSuccess(
null == streak ? _self.streak : streak // ignore: cast_nullable_to_non_nullable
as StreakStatus,isBusy: null == isBusy ? _self.isBusy : isBusy // ignore: cast_nullable_to_non_nullable
as bool,actionError: freezed == actionError ? _self.actionError : actionError // ignore: cast_nullable_to_non_nullable
as AppException?,
  ));
}

/// Create a copy of DailyStreakState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$StreakStatusCopyWith<$Res> get streak {
  
  return $StreakStatusCopyWith<$Res>(_self.streak, (value) {
    return _then(_self.copyWith(streak: value));
  });
}
}

/// @nodoc


class DailyStreakFailure implements DailyStreakState {
  const DailyStreakFailure(this.error);
  

 final  AppException error;

/// Create a copy of DailyStreakState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$DailyStreakFailureCopyWith<DailyStreakFailure> get copyWith => _$DailyStreakFailureCopyWithImpl<DailyStreakFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is DailyStreakFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'DailyStreakState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $DailyStreakFailureCopyWith<$Res> implements $DailyStreakStateCopyWith<$Res> {
  factory $DailyStreakFailureCopyWith(DailyStreakFailure value, $Res Function(DailyStreakFailure) _then) = _$DailyStreakFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$DailyStreakFailureCopyWithImpl<$Res>
    implements $DailyStreakFailureCopyWith<$Res> {
  _$DailyStreakFailureCopyWithImpl(this._self, this._then);

  final DailyStreakFailure _self;
  final $Res Function(DailyStreakFailure) _then;

/// Create a copy of DailyStreakState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(DailyStreakFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
