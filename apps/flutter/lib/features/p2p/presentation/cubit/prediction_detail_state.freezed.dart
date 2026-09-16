// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'prediction_detail_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$PredictionDetailState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionDetailState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'PredictionDetailState()';
}


}

/// @nodoc
class $PredictionDetailStateCopyWith<$Res>  {
$PredictionDetailStateCopyWith(PredictionDetailState _, $Res Function(PredictionDetailState) __);
}


/// Adds pattern-matching-related methods to [PredictionDetailState].
extension PredictionDetailStatePatterns on PredictionDetailState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( PredictionDetailInitial value)?  initial,TResult Function( PredictionDetailLoading value)?  loading,TResult Function( PredictionDetailSuccess value)?  success,TResult Function( PredictionDetailFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case PredictionDetailInitial() when initial != null:
return initial(_that);case PredictionDetailLoading() when loading != null:
return loading(_that);case PredictionDetailSuccess() when success != null:
return success(_that);case PredictionDetailFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( PredictionDetailInitial value)  initial,required TResult Function( PredictionDetailLoading value)  loading,required TResult Function( PredictionDetailSuccess value)  success,required TResult Function( PredictionDetailFailure value)  failure,}){
final _that = this;
switch (_that) {
case PredictionDetailInitial():
return initial(_that);case PredictionDetailLoading():
return loading(_that);case PredictionDetailSuccess():
return success(_that);case PredictionDetailFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( PredictionDetailInitial value)?  initial,TResult? Function( PredictionDetailLoading value)?  loading,TResult? Function( PredictionDetailSuccess value)?  success,TResult? Function( PredictionDetailFailure value)?  failure,}){
final _that = this;
switch (_that) {
case PredictionDetailInitial() when initial != null:
return initial(_that);case PredictionDetailLoading() when loading != null:
return loading(_that);case PredictionDetailSuccess() when success != null:
return success(_that);case PredictionDetailFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( Prediction prediction,  PredictionSide? selection,  bool isSubmitting,  AppException? actionError)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case PredictionDetailInitial() when initial != null:
return initial();case PredictionDetailLoading() when loading != null:
return loading();case PredictionDetailSuccess() when success != null:
return success(_that.prediction,_that.selection,_that.isSubmitting,_that.actionError);case PredictionDetailFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( Prediction prediction,  PredictionSide? selection,  bool isSubmitting,  AppException? actionError)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case PredictionDetailInitial():
return initial();case PredictionDetailLoading():
return loading();case PredictionDetailSuccess():
return success(_that.prediction,_that.selection,_that.isSubmitting,_that.actionError);case PredictionDetailFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( Prediction prediction,  PredictionSide? selection,  bool isSubmitting,  AppException? actionError)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case PredictionDetailInitial() when initial != null:
return initial();case PredictionDetailLoading() when loading != null:
return loading();case PredictionDetailSuccess() when success != null:
return success(_that.prediction,_that.selection,_that.isSubmitting,_that.actionError);case PredictionDetailFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class PredictionDetailInitial implements PredictionDetailState {
  const PredictionDetailInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionDetailInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'PredictionDetailState.initial()';
}


}




/// @nodoc


class PredictionDetailLoading implements PredictionDetailState {
  const PredictionDetailLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionDetailLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'PredictionDetailState.loading()';
}


}




/// @nodoc


class PredictionDetailSuccess implements PredictionDetailState {
  const PredictionDetailSuccess(this.prediction, {this.selection, this.isSubmitting = false, this.actionError});
  

 final  Prediction prediction;
 final  PredictionSide? selection;
@JsonKey() final  bool isSubmitting;
 final  AppException? actionError;

/// Create a copy of PredictionDetailState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PredictionDetailSuccessCopyWith<PredictionDetailSuccess> get copyWith => _$PredictionDetailSuccessCopyWithImpl<PredictionDetailSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionDetailSuccess&&(identical(other.prediction, prediction) || other.prediction == prediction)&&(identical(other.selection, selection) || other.selection == selection)&&(identical(other.isSubmitting, isSubmitting) || other.isSubmitting == isSubmitting)&&(identical(other.actionError, actionError) || other.actionError == actionError));
}


@override
int get hashCode {
    return Object.hash(runtimeType,prediction,selection,isSubmitting,actionError);
}

@override
String toString() {
    return 'PredictionDetailState.success(prediction: $prediction, selection: $selection, isSubmitting: $isSubmitting, actionError: $actionError)';
}


}

/// @nodoc
abstract mixin class $PredictionDetailSuccessCopyWith<$Res> implements $PredictionDetailStateCopyWith<$Res> {
  factory $PredictionDetailSuccessCopyWith(PredictionDetailSuccess value, $Res Function(PredictionDetailSuccess) _then) = _$PredictionDetailSuccessCopyWithImpl;
@useResult
$Res call({
 Prediction prediction, PredictionSide? selection, bool isSubmitting, AppException? actionError
});


$PredictionCopyWith<$Res> get prediction;

}
/// @nodoc
class _$PredictionDetailSuccessCopyWithImpl<$Res>
    implements $PredictionDetailSuccessCopyWith<$Res> {
  _$PredictionDetailSuccessCopyWithImpl(this._self, this._then);

  final PredictionDetailSuccess _self;
  final $Res Function(PredictionDetailSuccess) _then;

/// Create a copy of PredictionDetailState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? prediction = null,Object? selection = freezed,Object? isSubmitting = null,Object? actionError = freezed,}) {
  return _then(PredictionDetailSuccess(
null == prediction ? _self.prediction : prediction // ignore: cast_nullable_to_non_nullable
as Prediction,selection: freezed == selection ? _self.selection : selection // ignore: cast_nullable_to_non_nullable
as PredictionSide?,isSubmitting: null == isSubmitting ? _self.isSubmitting : isSubmitting // ignore: cast_nullable_to_non_nullable
as bool,actionError: freezed == actionError ? _self.actionError : actionError // ignore: cast_nullable_to_non_nullable
as AppException?,
  ));
}

/// Create a copy of PredictionDetailState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PredictionCopyWith<$Res> get prediction {
  
  return $PredictionCopyWith<$Res>(_self.prediction, (value) {
    return _then(_self.copyWith(prediction: value));
  });
}
}

/// @nodoc


class PredictionDetailFailure implements PredictionDetailState {
  const PredictionDetailFailure(this.error);
  

 final  AppException error;

/// Create a copy of PredictionDetailState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PredictionDetailFailureCopyWith<PredictionDetailFailure> get copyWith => _$PredictionDetailFailureCopyWithImpl<PredictionDetailFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionDetailFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'PredictionDetailState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $PredictionDetailFailureCopyWith<$Res> implements $PredictionDetailStateCopyWith<$Res> {
  factory $PredictionDetailFailureCopyWith(PredictionDetailFailure value, $Res Function(PredictionDetailFailure) _then) = _$PredictionDetailFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$PredictionDetailFailureCopyWithImpl<$Res>
    implements $PredictionDetailFailureCopyWith<$Res> {
  _$PredictionDetailFailureCopyWithImpl(this._self, this._then);

  final PredictionDetailFailure _self;
  final $Res Function(PredictionDetailFailure) _then;

/// Create a copy of PredictionDetailState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(PredictionDetailFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
