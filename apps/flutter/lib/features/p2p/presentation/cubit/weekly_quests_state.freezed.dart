// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'weekly_quests_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$WeeklyQuestsState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is WeeklyQuestsState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'WeeklyQuestsState()';
}


}

/// @nodoc
class $WeeklyQuestsStateCopyWith<$Res>  {
$WeeklyQuestsStateCopyWith(WeeklyQuestsState _, $Res Function(WeeklyQuestsState) __);
}


/// Adds pattern-matching-related methods to [WeeklyQuestsState].
extension WeeklyQuestsStatePatterns on WeeklyQuestsState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( WeeklyQuestsInitial value)?  initial,TResult Function( WeeklyQuestsLoading value)?  loading,TResult Function( WeeklyQuestsSuccess value)?  success,TResult Function( WeeklyQuestsFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case WeeklyQuestsInitial() when initial != null:
return initial(_that);case WeeklyQuestsLoading() when loading != null:
return loading(_that);case WeeklyQuestsSuccess() when success != null:
return success(_that);case WeeklyQuestsFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( WeeklyQuestsInitial value)  initial,required TResult Function( WeeklyQuestsLoading value)  loading,required TResult Function( WeeklyQuestsSuccess value)  success,required TResult Function( WeeklyQuestsFailure value)  failure,}){
final _that = this;
switch (_that) {
case WeeklyQuestsInitial():
return initial(_that);case WeeklyQuestsLoading():
return loading(_that);case WeeklyQuestsSuccess():
return success(_that);case WeeklyQuestsFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( WeeklyQuestsInitial value)?  initial,TResult? Function( WeeklyQuestsLoading value)?  loading,TResult? Function( WeeklyQuestsSuccess value)?  success,TResult? Function( WeeklyQuestsFailure value)?  failure,}){
final _that = this;
switch (_that) {
case WeeklyQuestsInitial() when initial != null:
return initial(_that);case WeeklyQuestsLoading() when loading != null:
return loading(_that);case WeeklyQuestsSuccess() when success != null:
return success(_that);case WeeklyQuestsFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( List<WeeklyQuest> quests)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case WeeklyQuestsInitial() when initial != null:
return initial();case WeeklyQuestsLoading() when loading != null:
return loading();case WeeklyQuestsSuccess() when success != null:
return success(_that.quests);case WeeklyQuestsFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( List<WeeklyQuest> quests)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case WeeklyQuestsInitial():
return initial();case WeeklyQuestsLoading():
return loading();case WeeklyQuestsSuccess():
return success(_that.quests);case WeeklyQuestsFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( List<WeeklyQuest> quests)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case WeeklyQuestsInitial() when initial != null:
return initial();case WeeklyQuestsLoading() when loading != null:
return loading();case WeeklyQuestsSuccess() when success != null:
return success(_that.quests);case WeeklyQuestsFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class WeeklyQuestsInitial implements WeeklyQuestsState {
  const WeeklyQuestsInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is WeeklyQuestsInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'WeeklyQuestsState.initial()';
}


}




/// @nodoc


class WeeklyQuestsLoading implements WeeklyQuestsState {
  const WeeklyQuestsLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is WeeklyQuestsLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'WeeklyQuestsState.loading()';
}


}




/// @nodoc


class WeeklyQuestsSuccess implements WeeklyQuestsState {
  const WeeklyQuestsSuccess( List<WeeklyQuest> quests): _quests = quests;
  

 final  List<WeeklyQuest> _quests;
 List<WeeklyQuest> get quests {
  if (_quests is EqualUnmodifiableListView) return _quests;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_quests);
}


/// Create a copy of WeeklyQuestsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$WeeklyQuestsSuccessCopyWith<WeeklyQuestsSuccess> get copyWith => _$WeeklyQuestsSuccessCopyWithImpl<WeeklyQuestsSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is WeeklyQuestsSuccess&&const DeepCollectionEquality().equals(other.quests, _quests));
}


@override
int get hashCode {
    return Object.hash(runtimeType,const DeepCollectionEquality().hash(_quests));
}

@override
String toString() {
    return 'WeeklyQuestsState.success(quests: $quests)';
}


}

/// @nodoc
abstract mixin class $WeeklyQuestsSuccessCopyWith<$Res> implements $WeeklyQuestsStateCopyWith<$Res> {
  factory $WeeklyQuestsSuccessCopyWith(WeeklyQuestsSuccess value, $Res Function(WeeklyQuestsSuccess) _then) = _$WeeklyQuestsSuccessCopyWithImpl;
@useResult
$Res call({
 List<WeeklyQuest> quests
});




}
/// @nodoc
class _$WeeklyQuestsSuccessCopyWithImpl<$Res>
    implements $WeeklyQuestsSuccessCopyWith<$Res> {
  _$WeeklyQuestsSuccessCopyWithImpl(this._self, this._then);

  final WeeklyQuestsSuccess _self;
  final $Res Function(WeeklyQuestsSuccess) _then;

/// Create a copy of WeeklyQuestsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? quests = null,}) {
  return _then(WeeklyQuestsSuccess(
null == quests ? _self._quests : quests // ignore: cast_nullable_to_non_nullable
as List<WeeklyQuest>,
  ));
}


}

/// @nodoc


class WeeklyQuestsFailure implements WeeklyQuestsState {
  const WeeklyQuestsFailure(this.error);
  

 final  AppException error;

/// Create a copy of WeeklyQuestsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$WeeklyQuestsFailureCopyWith<WeeklyQuestsFailure> get copyWith => _$WeeklyQuestsFailureCopyWithImpl<WeeklyQuestsFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is WeeklyQuestsFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'WeeklyQuestsState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $WeeklyQuestsFailureCopyWith<$Res> implements $WeeklyQuestsStateCopyWith<$Res> {
  factory $WeeklyQuestsFailureCopyWith(WeeklyQuestsFailure value, $Res Function(WeeklyQuestsFailure) _then) = _$WeeklyQuestsFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$WeeklyQuestsFailureCopyWithImpl<$Res>
    implements $WeeklyQuestsFailureCopyWith<$Res> {
  _$WeeklyQuestsFailureCopyWithImpl(this._self, this._then);

  final WeeklyQuestsFailure _self;
  final $Res Function(WeeklyQuestsFailure) _then;

/// Create a copy of WeeklyQuestsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(WeeklyQuestsFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
