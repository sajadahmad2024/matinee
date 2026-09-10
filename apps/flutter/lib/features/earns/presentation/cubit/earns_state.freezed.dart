// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'earns_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$EarnsState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnsState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'EarnsState()';
}


}

/// @nodoc
class $EarnsStateCopyWith<$Res>  {
$EarnsStateCopyWith(EarnsState _, $Res Function(EarnsState) __);
}


/// Adds pattern-matching-related methods to [EarnsState].
extension EarnsStatePatterns on EarnsState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( EarnsInitial value)?  initial,TResult Function( EarnsLoading value)?  loading,TResult Function( EarnsSuccess value)?  success,TResult Function( EarnsFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case EarnsInitial() when initial != null:
return initial(_that);case EarnsLoading() when loading != null:
return loading(_that);case EarnsSuccess() when success != null:
return success(_that);case EarnsFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( EarnsInitial value)  initial,required TResult Function( EarnsLoading value)  loading,required TResult Function( EarnsSuccess value)  success,required TResult Function( EarnsFailure value)  failure,}){
final _that = this;
switch (_that) {
case EarnsInitial():
return initial(_that);case EarnsLoading():
return loading(_that);case EarnsSuccess():
return success(_that);case EarnsFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( EarnsInitial value)?  initial,TResult? Function( EarnsLoading value)?  loading,TResult? Function( EarnsSuccess value)?  success,TResult? Function( EarnsFailure value)?  failure,}){
final _that = this;
switch (_that) {
case EarnsInitial() when initial != null:
return initial(_that);case EarnsLoading() when loading != null:
return loading(_that);case EarnsSuccess() when success != null:
return success(_that);case EarnsFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( EarnsOverview overview)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case EarnsInitial() when initial != null:
return initial();case EarnsLoading() when loading != null:
return loading();case EarnsSuccess() when success != null:
return success(_that.overview);case EarnsFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( EarnsOverview overview)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case EarnsInitial():
return initial();case EarnsLoading():
return loading();case EarnsSuccess():
return success(_that.overview);case EarnsFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( EarnsOverview overview)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case EarnsInitial() when initial != null:
return initial();case EarnsLoading() when loading != null:
return loading();case EarnsSuccess() when success != null:
return success(_that.overview);case EarnsFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class EarnsInitial implements EarnsState {
  const EarnsInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnsInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'EarnsState.initial()';
}


}




/// @nodoc


class EarnsLoading implements EarnsState {
  const EarnsLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnsLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'EarnsState.loading()';
}


}




/// @nodoc


class EarnsSuccess implements EarnsState {
  const EarnsSuccess(this.overview);
  

 final  EarnsOverview overview;

/// Create a copy of EarnsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EarnsSuccessCopyWith<EarnsSuccess> get copyWith => _$EarnsSuccessCopyWithImpl<EarnsSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnsSuccess&&(identical(other.overview, overview) || other.overview == overview));
}


@override
int get hashCode {
    return Object.hash(runtimeType,overview);
}

@override
String toString() {
    return 'EarnsState.success(overview: $overview)';
}


}

/// @nodoc
abstract mixin class $EarnsSuccessCopyWith<$Res> implements $EarnsStateCopyWith<$Res> {
  factory $EarnsSuccessCopyWith(EarnsSuccess value, $Res Function(EarnsSuccess) _then) = _$EarnsSuccessCopyWithImpl;
@useResult
$Res call({
 EarnsOverview overview
});


$EarnsOverviewCopyWith<$Res> get overview;

}
/// @nodoc
class _$EarnsSuccessCopyWithImpl<$Res>
    implements $EarnsSuccessCopyWith<$Res> {
  _$EarnsSuccessCopyWithImpl(this._self, this._then);

  final EarnsSuccess _self;
  final $Res Function(EarnsSuccess) _then;

/// Create a copy of EarnsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? overview = null,}) {
  return _then(EarnsSuccess(
null == overview ? _self.overview : overview // ignore: cast_nullable_to_non_nullable
as EarnsOverview,
  ));
}

/// Create a copy of EarnsState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$EarnsOverviewCopyWith<$Res> get overview {
  
  return $EarnsOverviewCopyWith<$Res>(_self.overview, (value) {
    return _then(_self.copyWith(overview: value));
  });
}
}

/// @nodoc


class EarnsFailure implements EarnsState {
  const EarnsFailure(this.error);
  

 final  AppException error;

/// Create a copy of EarnsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EarnsFailureCopyWith<EarnsFailure> get copyWith => _$EarnsFailureCopyWithImpl<EarnsFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnsFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'EarnsState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $EarnsFailureCopyWith<$Res> implements $EarnsStateCopyWith<$Res> {
  factory $EarnsFailureCopyWith(EarnsFailure value, $Res Function(EarnsFailure) _then) = _$EarnsFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$EarnsFailureCopyWithImpl<$Res>
    implements $EarnsFailureCopyWith<$Res> {
  _$EarnsFailureCopyWithImpl(this._self, this._then);

  final EarnsFailure _self;
  final $Res Function(EarnsFailure) _then;

/// Create a copy of EarnsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(EarnsFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
