// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'p2p_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$P2pState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is P2pState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'P2pState()';
}


}

/// @nodoc
class $P2pStateCopyWith<$Res>  {
$P2pStateCopyWith(P2pState _, $Res Function(P2pState) __);
}


/// Adds pattern-matching-related methods to [P2pState].
extension P2pStatePatterns on P2pState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( P2pInitial value)?  initial,TResult Function( P2pLoading value)?  loading,TResult Function( P2pSuccess value)?  success,TResult Function( P2pFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case P2pInitial() when initial != null:
return initial(_that);case P2pLoading() when loading != null:
return loading(_that);case P2pSuccess() when success != null:
return success(_that);case P2pFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( P2pInitial value)  initial,required TResult Function( P2pLoading value)  loading,required TResult Function( P2pSuccess value)  success,required TResult Function( P2pFailure value)  failure,}){
final _that = this;
switch (_that) {
case P2pInitial():
return initial(_that);case P2pLoading():
return loading(_that);case P2pSuccess():
return success(_that);case P2pFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( P2pInitial value)?  initial,TResult? Function( P2pLoading value)?  loading,TResult? Function( P2pSuccess value)?  success,TResult? Function( P2pFailure value)?  failure,}){
final _that = this;
switch (_that) {
case P2pInitial() when initial != null:
return initial(_that);case P2pLoading() when loading != null:
return loading(_that);case P2pSuccess() when success != null:
return success(_that);case P2pFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( P2pOverview overview)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case P2pInitial() when initial != null:
return initial();case P2pLoading() when loading != null:
return loading();case P2pSuccess() when success != null:
return success(_that.overview);case P2pFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( P2pOverview overview)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case P2pInitial():
return initial();case P2pLoading():
return loading();case P2pSuccess():
return success(_that.overview);case P2pFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( P2pOverview overview)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case P2pInitial() when initial != null:
return initial();case P2pLoading() when loading != null:
return loading();case P2pSuccess() when success != null:
return success(_that.overview);case P2pFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class P2pInitial implements P2pState {
  const P2pInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is P2pInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'P2pState.initial()';
}


}




/// @nodoc


class P2pLoading implements P2pState {
  const P2pLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is P2pLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'P2pState.loading()';
}


}




/// @nodoc


class P2pSuccess implements P2pState {
  const P2pSuccess(this.overview);
  

 final  P2pOverview overview;

/// Create a copy of P2pState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$P2pSuccessCopyWith<P2pSuccess> get copyWith => _$P2pSuccessCopyWithImpl<P2pSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is P2pSuccess&&(identical(other.overview, overview) || other.overview == overview));
}


@override
int get hashCode {
    return Object.hash(runtimeType,overview);
}

@override
String toString() {
    return 'P2pState.success(overview: $overview)';
}


}

/// @nodoc
abstract mixin class $P2pSuccessCopyWith<$Res> implements $P2pStateCopyWith<$Res> {
  factory $P2pSuccessCopyWith(P2pSuccess value, $Res Function(P2pSuccess) _then) = _$P2pSuccessCopyWithImpl;
@useResult
$Res call({
 P2pOverview overview
});


$P2pOverviewCopyWith<$Res> get overview;

}
/// @nodoc
class _$P2pSuccessCopyWithImpl<$Res>
    implements $P2pSuccessCopyWith<$Res> {
  _$P2pSuccessCopyWithImpl(this._self, this._then);

  final P2pSuccess _self;
  final $Res Function(P2pSuccess) _then;

/// Create a copy of P2pState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? overview = null,}) {
  return _then(P2pSuccess(
null == overview ? _self.overview : overview // ignore: cast_nullable_to_non_nullable
as P2pOverview,
  ));
}

/// Create a copy of P2pState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$P2pOverviewCopyWith<$Res> get overview {
  
  return $P2pOverviewCopyWith<$Res>(_self.overview, (value) {
    return _then(_self.copyWith(overview: value));
  });
}
}

/// @nodoc


class P2pFailure implements P2pState {
  const P2pFailure(this.error);
  

 final  AppException error;

/// Create a copy of P2pState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$P2pFailureCopyWith<P2pFailure> get copyWith => _$P2pFailureCopyWithImpl<P2pFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is P2pFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'P2pState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $P2pFailureCopyWith<$Res> implements $P2pStateCopyWith<$Res> {
  factory $P2pFailureCopyWith(P2pFailure value, $Res Function(P2pFailure) _then) = _$P2pFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$P2pFailureCopyWithImpl<$Res>
    implements $P2pFailureCopyWith<$Res> {
  _$P2pFailureCopyWithImpl(this._self, this._then);

  final P2pFailure _self;
  final $Res Function(P2pFailure) _then;

/// Create a copy of P2pState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(P2pFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
