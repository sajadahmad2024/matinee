// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'earn_detail_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$EarnDetailState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnDetailState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'EarnDetailState()';
}


}

/// @nodoc
class $EarnDetailStateCopyWith<$Res>  {
$EarnDetailStateCopyWith(EarnDetailState _, $Res Function(EarnDetailState) __);
}


/// Adds pattern-matching-related methods to [EarnDetailState].
extension EarnDetailStatePatterns on EarnDetailState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( EarnDetailInitial value)?  initial,TResult Function( EarnDetailLoading value)?  loading,TResult Function( EarnDetailSuccess value)?  success,TResult Function( EarnDetailFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case EarnDetailInitial() when initial != null:
return initial(_that);case EarnDetailLoading() when loading != null:
return loading(_that);case EarnDetailSuccess() when success != null:
return success(_that);case EarnDetailFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( EarnDetailInitial value)  initial,required TResult Function( EarnDetailLoading value)  loading,required TResult Function( EarnDetailSuccess value)  success,required TResult Function( EarnDetailFailure value)  failure,}){
final _that = this;
switch (_that) {
case EarnDetailInitial():
return initial(_that);case EarnDetailLoading():
return loading(_that);case EarnDetailSuccess():
return success(_that);case EarnDetailFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( EarnDetailInitial value)?  initial,TResult? Function( EarnDetailLoading value)?  loading,TResult? Function( EarnDetailSuccess value)?  success,TResult? Function( EarnDetailFailure value)?  failure,}){
final _that = this;
switch (_that) {
case EarnDetailInitial() when initial != null:
return initial(_that);case EarnDetailLoading() when loading != null:
return loading(_that);case EarnDetailSuccess() when success != null:
return success(_that);case EarnDetailFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( EarnDetail detail)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case EarnDetailInitial() when initial != null:
return initial();case EarnDetailLoading() when loading != null:
return loading();case EarnDetailSuccess() when success != null:
return success(_that.detail);case EarnDetailFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( EarnDetail detail)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case EarnDetailInitial():
return initial();case EarnDetailLoading():
return loading();case EarnDetailSuccess():
return success(_that.detail);case EarnDetailFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( EarnDetail detail)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case EarnDetailInitial() when initial != null:
return initial();case EarnDetailLoading() when loading != null:
return loading();case EarnDetailSuccess() when success != null:
return success(_that.detail);case EarnDetailFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class EarnDetailInitial implements EarnDetailState {
  const EarnDetailInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnDetailInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'EarnDetailState.initial()';
}


}




/// @nodoc


class EarnDetailLoading implements EarnDetailState {
  const EarnDetailLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnDetailLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'EarnDetailState.loading()';
}


}




/// @nodoc


class EarnDetailSuccess implements EarnDetailState {
  const EarnDetailSuccess(this.detail);
  

 final  EarnDetail detail;

/// Create a copy of EarnDetailState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EarnDetailSuccessCopyWith<EarnDetailSuccess> get copyWith => _$EarnDetailSuccessCopyWithImpl<EarnDetailSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnDetailSuccess&&(identical(other.detail, detail) || other.detail == detail));
}


@override
int get hashCode {
    return Object.hash(runtimeType,detail);
}

@override
String toString() {
    return 'EarnDetailState.success(detail: $detail)';
}


}

/// @nodoc
abstract mixin class $EarnDetailSuccessCopyWith<$Res> implements $EarnDetailStateCopyWith<$Res> {
  factory $EarnDetailSuccessCopyWith(EarnDetailSuccess value, $Res Function(EarnDetailSuccess) _then) = _$EarnDetailSuccessCopyWithImpl;
@useResult
$Res call({
 EarnDetail detail
});


$EarnDetailCopyWith<$Res> get detail;

}
/// @nodoc
class _$EarnDetailSuccessCopyWithImpl<$Res>
    implements $EarnDetailSuccessCopyWith<$Res> {
  _$EarnDetailSuccessCopyWithImpl(this._self, this._then);

  final EarnDetailSuccess _self;
  final $Res Function(EarnDetailSuccess) _then;

/// Create a copy of EarnDetailState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? detail = null,}) {
  return _then(EarnDetailSuccess(
null == detail ? _self.detail : detail // ignore: cast_nullable_to_non_nullable
as EarnDetail,
  ));
}

/// Create a copy of EarnDetailState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$EarnDetailCopyWith<$Res> get detail {
  
  return $EarnDetailCopyWith<$Res>(_self.detail, (value) {
    return _then(_self.copyWith(detail: value));
  });
}
}

/// @nodoc


class EarnDetailFailure implements EarnDetailState {
  const EarnDetailFailure(this.error);
  

 final  AppException error;

/// Create a copy of EarnDetailState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EarnDetailFailureCopyWith<EarnDetailFailure> get copyWith => _$EarnDetailFailureCopyWithImpl<EarnDetailFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnDetailFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'EarnDetailState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $EarnDetailFailureCopyWith<$Res> implements $EarnDetailStateCopyWith<$Res> {
  factory $EarnDetailFailureCopyWith(EarnDetailFailure value, $Res Function(EarnDetailFailure) _then) = _$EarnDetailFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$EarnDetailFailureCopyWithImpl<$Res>
    implements $EarnDetailFailureCopyWith<$Res> {
  _$EarnDetailFailureCopyWithImpl(this._self, this._then);

  final EarnDetailFailure _self;
  final $Res Function(EarnDetailFailure) _then;

/// Create a copy of EarnDetailState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(EarnDetailFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
