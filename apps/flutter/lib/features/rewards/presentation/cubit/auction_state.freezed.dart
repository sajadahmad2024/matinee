// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auction_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$AuctionState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'AuctionState()';
}


}

/// @nodoc
class $AuctionStateCopyWith<$Res>  {
$AuctionStateCopyWith(AuctionState _, $Res Function(AuctionState) __);
}


/// Adds pattern-matching-related methods to [AuctionState].
extension AuctionStatePatterns on AuctionState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( AuctionInitial value)?  initial,TResult Function( AuctionLoading value)?  loading,TResult Function( AuctionSuccess value)?  success,TResult Function( AuctionFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case AuctionInitial() when initial != null:
return initial(_that);case AuctionLoading() when loading != null:
return loading(_that);case AuctionSuccess() when success != null:
return success(_that);case AuctionFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( AuctionInitial value)  initial,required TResult Function( AuctionLoading value)  loading,required TResult Function( AuctionSuccess value)  success,required TResult Function( AuctionFailure value)  failure,}){
final _that = this;
switch (_that) {
case AuctionInitial():
return initial(_that);case AuctionLoading():
return loading(_that);case AuctionSuccess():
return success(_that);case AuctionFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( AuctionInitial value)?  initial,TResult? Function( AuctionLoading value)?  loading,TResult? Function( AuctionSuccess value)?  success,TResult? Function( AuctionFailure value)?  failure,}){
final _that = this;
switch (_that) {
case AuctionInitial() when initial != null:
return initial(_that);case AuctionLoading() when loading != null:
return loading(_that);case AuctionSuccess() when success != null:
return success(_that);case AuctionFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( AuctionBoard board)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case AuctionInitial() when initial != null:
return initial();case AuctionLoading() when loading != null:
return loading();case AuctionSuccess() when success != null:
return success(_that.board);case AuctionFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( AuctionBoard board)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case AuctionInitial():
return initial();case AuctionLoading():
return loading();case AuctionSuccess():
return success(_that.board);case AuctionFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( AuctionBoard board)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case AuctionInitial() when initial != null:
return initial();case AuctionLoading() when loading != null:
return loading();case AuctionSuccess() when success != null:
return success(_that.board);case AuctionFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class AuctionInitial implements AuctionState {
  const AuctionInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'AuctionState.initial()';
}


}




/// @nodoc


class AuctionLoading implements AuctionState {
  const AuctionLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'AuctionState.loading()';
}


}




/// @nodoc


class AuctionSuccess implements AuctionState {
  const AuctionSuccess(this.board);
  

 final  AuctionBoard board;

/// Create a copy of AuctionState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuctionSuccessCopyWith<AuctionSuccess> get copyWith => _$AuctionSuccessCopyWithImpl<AuctionSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionSuccess&&(identical(other.board, board) || other.board == board));
}


@override
int get hashCode {
    return Object.hash(runtimeType,board);
}

@override
String toString() {
    return 'AuctionState.success(board: $board)';
}


}

/// @nodoc
abstract mixin class $AuctionSuccessCopyWith<$Res> implements $AuctionStateCopyWith<$Res> {
  factory $AuctionSuccessCopyWith(AuctionSuccess value, $Res Function(AuctionSuccess) _then) = _$AuctionSuccessCopyWithImpl;
@useResult
$Res call({
 AuctionBoard board
});


$AuctionBoardCopyWith<$Res> get board;

}
/// @nodoc
class _$AuctionSuccessCopyWithImpl<$Res>
    implements $AuctionSuccessCopyWith<$Res> {
  _$AuctionSuccessCopyWithImpl(this._self, this._then);

  final AuctionSuccess _self;
  final $Res Function(AuctionSuccess) _then;

/// Create a copy of AuctionState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? board = null,}) {
  return _then(AuctionSuccess(
null == board ? _self.board : board // ignore: cast_nullable_to_non_nullable
as AuctionBoard,
  ));
}

/// Create a copy of AuctionState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuctionBoardCopyWith<$Res> get board {
  
  return $AuctionBoardCopyWith<$Res>(_self.board, (value) {
    return _then(_self.copyWith(board: value));
  });
}
}

/// @nodoc


class AuctionFailure implements AuctionState {
  const AuctionFailure(this.error);
  

 final  AppException error;

/// Create a copy of AuctionState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuctionFailureCopyWith<AuctionFailure> get copyWith => _$AuctionFailureCopyWithImpl<AuctionFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'AuctionState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $AuctionFailureCopyWith<$Res> implements $AuctionStateCopyWith<$Res> {
  factory $AuctionFailureCopyWith(AuctionFailure value, $Res Function(AuctionFailure) _then) = _$AuctionFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$AuctionFailureCopyWithImpl<$Res>
    implements $AuctionFailureCopyWith<$Res> {
  _$AuctionFailureCopyWithImpl(this._self, this._then);

  final AuctionFailure _self;
  final $Res Function(AuctionFailure) _then;

/// Create a copy of AuctionState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(AuctionFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
