// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'exclusive_library_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$ExclusiveLibraryState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ExclusiveLibraryState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ExclusiveLibraryState()';
}


}

/// @nodoc
class $ExclusiveLibraryStateCopyWith<$Res>  {
$ExclusiveLibraryStateCopyWith(ExclusiveLibraryState _, $Res Function(ExclusiveLibraryState) __);
}


/// Adds pattern-matching-related methods to [ExclusiveLibraryState].
extension ExclusiveLibraryStatePatterns on ExclusiveLibraryState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( ExclusiveLibraryInitial value)?  initial,TResult Function( ExclusiveLibraryLoading value)?  loading,TResult Function( ExclusiveLibrarySuccess value)?  success,TResult Function( ExclusiveLibraryFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case ExclusiveLibraryInitial() when initial != null:
return initial(_that);case ExclusiveLibraryLoading() when loading != null:
return loading(_that);case ExclusiveLibrarySuccess() when success != null:
return success(_that);case ExclusiveLibraryFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( ExclusiveLibraryInitial value)  initial,required TResult Function( ExclusiveLibraryLoading value)  loading,required TResult Function( ExclusiveLibrarySuccess value)  success,required TResult Function( ExclusiveLibraryFailure value)  failure,}){
final _that = this;
switch (_that) {
case ExclusiveLibraryInitial():
return initial(_that);case ExclusiveLibraryLoading():
return loading(_that);case ExclusiveLibrarySuccess():
return success(_that);case ExclusiveLibraryFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( ExclusiveLibraryInitial value)?  initial,TResult? Function( ExclusiveLibraryLoading value)?  loading,TResult? Function( ExclusiveLibrarySuccess value)?  success,TResult? Function( ExclusiveLibraryFailure value)?  failure,}){
final _that = this;
switch (_that) {
case ExclusiveLibraryInitial() when initial != null:
return initial(_that);case ExclusiveLibraryLoading() when loading != null:
return loading(_that);case ExclusiveLibrarySuccess() when success != null:
return success(_that);case ExclusiveLibraryFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( ExclusiveLibrary library)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case ExclusiveLibraryInitial() when initial != null:
return initial();case ExclusiveLibraryLoading() when loading != null:
return loading();case ExclusiveLibrarySuccess() when success != null:
return success(_that.library);case ExclusiveLibraryFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( ExclusiveLibrary library)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case ExclusiveLibraryInitial():
return initial();case ExclusiveLibraryLoading():
return loading();case ExclusiveLibrarySuccess():
return success(_that.library);case ExclusiveLibraryFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( ExclusiveLibrary library)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case ExclusiveLibraryInitial() when initial != null:
return initial();case ExclusiveLibraryLoading() when loading != null:
return loading();case ExclusiveLibrarySuccess() when success != null:
return success(_that.library);case ExclusiveLibraryFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class ExclusiveLibraryInitial implements ExclusiveLibraryState {
  const ExclusiveLibraryInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ExclusiveLibraryInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ExclusiveLibraryState.initial()';
}


}




/// @nodoc


class ExclusiveLibraryLoading implements ExclusiveLibraryState {
  const ExclusiveLibraryLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ExclusiveLibraryLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'ExclusiveLibraryState.loading()';
}


}




/// @nodoc


class ExclusiveLibrarySuccess implements ExclusiveLibraryState {
  const ExclusiveLibrarySuccess(this.library);
  

 final  ExclusiveLibrary library;

/// Create a copy of ExclusiveLibraryState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ExclusiveLibrarySuccessCopyWith<ExclusiveLibrarySuccess> get copyWith => _$ExclusiveLibrarySuccessCopyWithImpl<ExclusiveLibrarySuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ExclusiveLibrarySuccess&&(identical(other.library, library) || other.library == library));
}


@override
int get hashCode {
    return Object.hash(runtimeType,library);
}

@override
String toString() {
    return 'ExclusiveLibraryState.success(library: $library)';
}


}

/// @nodoc
abstract mixin class $ExclusiveLibrarySuccessCopyWith<$Res> implements $ExclusiveLibraryStateCopyWith<$Res> {
  factory $ExclusiveLibrarySuccessCopyWith(ExclusiveLibrarySuccess value, $Res Function(ExclusiveLibrarySuccess) _then) = _$ExclusiveLibrarySuccessCopyWithImpl;
@useResult
$Res call({
 ExclusiveLibrary library
});


$ExclusiveLibraryCopyWith<$Res> get library;

}
/// @nodoc
class _$ExclusiveLibrarySuccessCopyWithImpl<$Res>
    implements $ExclusiveLibrarySuccessCopyWith<$Res> {
  _$ExclusiveLibrarySuccessCopyWithImpl(this._self, this._then);

  final ExclusiveLibrarySuccess _self;
  final $Res Function(ExclusiveLibrarySuccess) _then;

/// Create a copy of ExclusiveLibraryState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? library = null,}) {
  return _then(ExclusiveLibrarySuccess(
null == library ? _self.library : library // ignore: cast_nullable_to_non_nullable
as ExclusiveLibrary,
  ));
}

/// Create a copy of ExclusiveLibraryState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ExclusiveLibraryCopyWith<$Res> get library {
  
  return $ExclusiveLibraryCopyWith<$Res>(_self.library, (value) {
    return _then(_self.copyWith(library: value));
  });
}
}

/// @nodoc


class ExclusiveLibraryFailure implements ExclusiveLibraryState {
  const ExclusiveLibraryFailure(this.error);
  

 final  AppException error;

/// Create a copy of ExclusiveLibraryState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ExclusiveLibraryFailureCopyWith<ExclusiveLibraryFailure> get copyWith => _$ExclusiveLibraryFailureCopyWithImpl<ExclusiveLibraryFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is ExclusiveLibraryFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'ExclusiveLibraryState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $ExclusiveLibraryFailureCopyWith<$Res> implements $ExclusiveLibraryStateCopyWith<$Res> {
  factory $ExclusiveLibraryFailureCopyWith(ExclusiveLibraryFailure value, $Res Function(ExclusiveLibraryFailure) _then) = _$ExclusiveLibraryFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$ExclusiveLibraryFailureCopyWithImpl<$Res>
    implements $ExclusiveLibraryFailureCopyWith<$Res> {
  _$ExclusiveLibraryFailureCopyWithImpl(this._self, this._then);

  final ExclusiveLibraryFailure _self;
  final $Res Function(ExclusiveLibraryFailure) _then;

/// Create a copy of ExclusiveLibraryState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(ExclusiveLibraryFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
