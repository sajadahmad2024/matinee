// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'unlock_content_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$UnlockContentState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is UnlockContentState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'UnlockContentState()';
}


}

/// @nodoc
class $UnlockContentStateCopyWith<$Res>  {
$UnlockContentStateCopyWith(UnlockContentState _, $Res Function(UnlockContentState) __);
}


/// Adds pattern-matching-related methods to [UnlockContentState].
extension UnlockContentStatePatterns on UnlockContentState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( UnlockContentInitial value)?  initial,TResult Function( UnlockContentLoading value)?  loading,TResult Function( UnlockContentSuccess value)?  success,TResult Function( UnlockContentFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case UnlockContentInitial() when initial != null:
return initial(_that);case UnlockContentLoading() when loading != null:
return loading(_that);case UnlockContentSuccess() when success != null:
return success(_that);case UnlockContentFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( UnlockContentInitial value)  initial,required TResult Function( UnlockContentLoading value)  loading,required TResult Function( UnlockContentSuccess value)  success,required TResult Function( UnlockContentFailure value)  failure,}){
final _that = this;
switch (_that) {
case UnlockContentInitial():
return initial(_that);case UnlockContentLoading():
return loading(_that);case UnlockContentSuccess():
return success(_that);case UnlockContentFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( UnlockContentInitial value)?  initial,TResult? Function( UnlockContentLoading value)?  loading,TResult? Function( UnlockContentSuccess value)?  success,TResult? Function( UnlockContentFailure value)?  failure,}){
final _that = this;
switch (_that) {
case UnlockContentInitial() when initial != null:
return initial(_that);case UnlockContentLoading() when loading != null:
return loading(_that);case UnlockContentSuccess() when success != null:
return success(_that);case UnlockContentFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( ExclusiveItem item,  bool justUnlocked)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case UnlockContentInitial() when initial != null:
return initial();case UnlockContentLoading() when loading != null:
return loading();case UnlockContentSuccess() when success != null:
return success(_that.item,_that.justUnlocked);case UnlockContentFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( ExclusiveItem item,  bool justUnlocked)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case UnlockContentInitial():
return initial();case UnlockContentLoading():
return loading();case UnlockContentSuccess():
return success(_that.item,_that.justUnlocked);case UnlockContentFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( ExclusiveItem item,  bool justUnlocked)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case UnlockContentInitial() when initial != null:
return initial();case UnlockContentLoading() when loading != null:
return loading();case UnlockContentSuccess() when success != null:
return success(_that.item,_that.justUnlocked);case UnlockContentFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class UnlockContentInitial implements UnlockContentState {
  const UnlockContentInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is UnlockContentInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'UnlockContentState.initial()';
}


}




/// @nodoc


class UnlockContentLoading implements UnlockContentState {
  const UnlockContentLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is UnlockContentLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'UnlockContentState.loading()';
}


}




/// @nodoc


class UnlockContentSuccess implements UnlockContentState {
  const UnlockContentSuccess(this.item, {this.justUnlocked = false});
  

 final  ExclusiveItem item;
@JsonKey() final  bool justUnlocked;

/// Create a copy of UnlockContentState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UnlockContentSuccessCopyWith<UnlockContentSuccess> get copyWith => _$UnlockContentSuccessCopyWithImpl<UnlockContentSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is UnlockContentSuccess&&(identical(other.item, item) || other.item == item)&&(identical(other.justUnlocked, justUnlocked) || other.justUnlocked == justUnlocked));
}


@override
int get hashCode {
    return Object.hash(runtimeType,item,justUnlocked);
}

@override
String toString() {
    return 'UnlockContentState.success(item: $item, justUnlocked: $justUnlocked)';
}


}

/// @nodoc
abstract mixin class $UnlockContentSuccessCopyWith<$Res> implements $UnlockContentStateCopyWith<$Res> {
  factory $UnlockContentSuccessCopyWith(UnlockContentSuccess value, $Res Function(UnlockContentSuccess) _then) = _$UnlockContentSuccessCopyWithImpl;
@useResult
$Res call({
 ExclusiveItem item, bool justUnlocked
});


$ExclusiveItemCopyWith<$Res> get item;

}
/// @nodoc
class _$UnlockContentSuccessCopyWithImpl<$Res>
    implements $UnlockContentSuccessCopyWith<$Res> {
  _$UnlockContentSuccessCopyWithImpl(this._self, this._then);

  final UnlockContentSuccess _self;
  final $Res Function(UnlockContentSuccess) _then;

/// Create a copy of UnlockContentState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? item = null,Object? justUnlocked = null,}) {
  return _then(UnlockContentSuccess(
null == item ? _self.item : item // ignore: cast_nullable_to_non_nullable
as ExclusiveItem,justUnlocked: null == justUnlocked ? _self.justUnlocked : justUnlocked // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

/// Create a copy of UnlockContentState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ExclusiveItemCopyWith<$Res> get item {
  
  return $ExclusiveItemCopyWith<$Res>(_self.item, (value) {
    return _then(_self.copyWith(item: value));
  });
}
}

/// @nodoc


class UnlockContentFailure implements UnlockContentState {
  const UnlockContentFailure(this.error);
  

 final  AppException error;

/// Create a copy of UnlockContentState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$UnlockContentFailureCopyWith<UnlockContentFailure> get copyWith => _$UnlockContentFailureCopyWithImpl<UnlockContentFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is UnlockContentFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'UnlockContentState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $UnlockContentFailureCopyWith<$Res> implements $UnlockContentStateCopyWith<$Res> {
  factory $UnlockContentFailureCopyWith(UnlockContentFailure value, $Res Function(UnlockContentFailure) _then) = _$UnlockContentFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$UnlockContentFailureCopyWithImpl<$Res>
    implements $UnlockContentFailureCopyWith<$Res> {
  _$UnlockContentFailureCopyWithImpl(this._self, this._then);

  final UnlockContentFailure _self;
  final $Res Function(UnlockContentFailure) _then;

/// Create a copy of UnlockContentState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(UnlockContentFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
