// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'prediction_games_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$PredictionGamesState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionGamesState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'PredictionGamesState()';
}


}

/// @nodoc
class $PredictionGamesStateCopyWith<$Res>  {
$PredictionGamesStateCopyWith(PredictionGamesState _, $Res Function(PredictionGamesState) __);
}


/// Adds pattern-matching-related methods to [PredictionGamesState].
extension PredictionGamesStatePatterns on PredictionGamesState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( PredictionGamesInitial value)?  initial,TResult Function( PredictionGamesLoading value)?  loading,TResult Function( PredictionGamesSuccess value)?  success,TResult Function( PredictionGamesFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case PredictionGamesInitial() when initial != null:
return initial(_that);case PredictionGamesLoading() when loading != null:
return loading(_that);case PredictionGamesSuccess() when success != null:
return success(_that);case PredictionGamesFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( PredictionGamesInitial value)  initial,required TResult Function( PredictionGamesLoading value)  loading,required TResult Function( PredictionGamesSuccess value)  success,required TResult Function( PredictionGamesFailure value)  failure,}){
final _that = this;
switch (_that) {
case PredictionGamesInitial():
return initial(_that);case PredictionGamesLoading():
return loading(_that);case PredictionGamesSuccess():
return success(_that);case PredictionGamesFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( PredictionGamesInitial value)?  initial,TResult? Function( PredictionGamesLoading value)?  loading,TResult? Function( PredictionGamesSuccess value)?  success,TResult? Function( PredictionGamesFailure value)?  failure,}){
final _that = this;
switch (_that) {
case PredictionGamesInitial() when initial != null:
return initial(_that);case PredictionGamesLoading() when loading != null:
return loading(_that);case PredictionGamesSuccess() when success != null:
return success(_that);case PredictionGamesFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( List<Prediction> predictions)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case PredictionGamesInitial() when initial != null:
return initial();case PredictionGamesLoading() when loading != null:
return loading();case PredictionGamesSuccess() when success != null:
return success(_that.predictions);case PredictionGamesFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( List<Prediction> predictions)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case PredictionGamesInitial():
return initial();case PredictionGamesLoading():
return loading();case PredictionGamesSuccess():
return success(_that.predictions);case PredictionGamesFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( List<Prediction> predictions)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case PredictionGamesInitial() when initial != null:
return initial();case PredictionGamesLoading() when loading != null:
return loading();case PredictionGamesSuccess() when success != null:
return success(_that.predictions);case PredictionGamesFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class PredictionGamesInitial implements PredictionGamesState {
  const PredictionGamesInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionGamesInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'PredictionGamesState.initial()';
}


}




/// @nodoc


class PredictionGamesLoading implements PredictionGamesState {
  const PredictionGamesLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionGamesLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'PredictionGamesState.loading()';
}


}




/// @nodoc


class PredictionGamesSuccess implements PredictionGamesState {
  const PredictionGamesSuccess( List<Prediction> predictions): _predictions = predictions;
  

 final  List<Prediction> _predictions;
 List<Prediction> get predictions {
  if (_predictions is EqualUnmodifiableListView) return _predictions;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_predictions);
}


/// Create a copy of PredictionGamesState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PredictionGamesSuccessCopyWith<PredictionGamesSuccess> get copyWith => _$PredictionGamesSuccessCopyWithImpl<PredictionGamesSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionGamesSuccess&&const DeepCollectionEquality().equals(other.predictions, _predictions));
}


@override
int get hashCode {
    return Object.hash(runtimeType,const DeepCollectionEquality().hash(_predictions));
}

@override
String toString() {
    return 'PredictionGamesState.success(predictions: $predictions)';
}


}

/// @nodoc
abstract mixin class $PredictionGamesSuccessCopyWith<$Res> implements $PredictionGamesStateCopyWith<$Res> {
  factory $PredictionGamesSuccessCopyWith(PredictionGamesSuccess value, $Res Function(PredictionGamesSuccess) _then) = _$PredictionGamesSuccessCopyWithImpl;
@useResult
$Res call({
 List<Prediction> predictions
});




}
/// @nodoc
class _$PredictionGamesSuccessCopyWithImpl<$Res>
    implements $PredictionGamesSuccessCopyWith<$Res> {
  _$PredictionGamesSuccessCopyWithImpl(this._self, this._then);

  final PredictionGamesSuccess _self;
  final $Res Function(PredictionGamesSuccess) _then;

/// Create a copy of PredictionGamesState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? predictions = null,}) {
  return _then(PredictionGamesSuccess(
null == predictions ? _self._predictions : predictions // ignore: cast_nullable_to_non_nullable
as List<Prediction>,
  ));
}


}

/// @nodoc


class PredictionGamesFailure implements PredictionGamesState {
  const PredictionGamesFailure(this.error);
  

 final  AppException error;

/// Create a copy of PredictionGamesState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PredictionGamesFailureCopyWith<PredictionGamesFailure> get copyWith => _$PredictionGamesFailureCopyWithImpl<PredictionGamesFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionGamesFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'PredictionGamesState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $PredictionGamesFailureCopyWith<$Res> implements $PredictionGamesStateCopyWith<$Res> {
  factory $PredictionGamesFailureCopyWith(PredictionGamesFailure value, $Res Function(PredictionGamesFailure) _then) = _$PredictionGamesFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$PredictionGamesFailureCopyWithImpl<$Res>
    implements $PredictionGamesFailureCopyWith<$Res> {
  _$PredictionGamesFailureCopyWithImpl(this._self, this._then);

  final PredictionGamesFailure _self;
  final $Res Function(PredictionGamesFailure) _then;

/// Create a copy of PredictionGamesState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(PredictionGamesFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
