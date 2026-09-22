// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'quest_progress_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$QuestProgressState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is QuestProgressState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'QuestProgressState()';
}


}

/// @nodoc
class $QuestProgressStateCopyWith<$Res>  {
$QuestProgressStateCopyWith(QuestProgressState _, $Res Function(QuestProgressState) __);
}


/// Adds pattern-matching-related methods to [QuestProgressState].
extension QuestProgressStatePatterns on QuestProgressState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( QuestProgressInitial value)?  initial,TResult Function( QuestProgressLoading value)?  loading,TResult Function( QuestProgressSuccess value)?  success,TResult Function( QuestProgressFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case QuestProgressInitial() when initial != null:
return initial(_that);case QuestProgressLoading() when loading != null:
return loading(_that);case QuestProgressSuccess() when success != null:
return success(_that);case QuestProgressFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( QuestProgressInitial value)  initial,required TResult Function( QuestProgressLoading value)  loading,required TResult Function( QuestProgressSuccess value)  success,required TResult Function( QuestProgressFailure value)  failure,}){
final _that = this;
switch (_that) {
case QuestProgressInitial():
return initial(_that);case QuestProgressLoading():
return loading(_that);case QuestProgressSuccess():
return success(_that);case QuestProgressFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( QuestProgressInitial value)?  initial,TResult? Function( QuestProgressLoading value)?  loading,TResult? Function( QuestProgressSuccess value)?  success,TResult? Function( QuestProgressFailure value)?  failure,}){
final _that = this;
switch (_that) {
case QuestProgressInitial() when initial != null:
return initial(_that);case QuestProgressLoading() when loading != null:
return loading(_that);case QuestProgressSuccess() when success != null:
return success(_that);case QuestProgressFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( WeeklyQuest quest,  bool isClaiming,  AppException? actionError)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case QuestProgressInitial() when initial != null:
return initial();case QuestProgressLoading() when loading != null:
return loading();case QuestProgressSuccess() when success != null:
return success(_that.quest,_that.isClaiming,_that.actionError);case QuestProgressFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( WeeklyQuest quest,  bool isClaiming,  AppException? actionError)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case QuestProgressInitial():
return initial();case QuestProgressLoading():
return loading();case QuestProgressSuccess():
return success(_that.quest,_that.isClaiming,_that.actionError);case QuestProgressFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( WeeklyQuest quest,  bool isClaiming,  AppException? actionError)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case QuestProgressInitial() when initial != null:
return initial();case QuestProgressLoading() when loading != null:
return loading();case QuestProgressSuccess() when success != null:
return success(_that.quest,_that.isClaiming,_that.actionError);case QuestProgressFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class QuestProgressInitial implements QuestProgressState {
  const QuestProgressInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is QuestProgressInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'QuestProgressState.initial()';
}


}




/// @nodoc


class QuestProgressLoading implements QuestProgressState {
  const QuestProgressLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is QuestProgressLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'QuestProgressState.loading()';
}


}




/// @nodoc


class QuestProgressSuccess implements QuestProgressState {
  const QuestProgressSuccess(this.quest, {this.isClaiming = false, this.actionError});
  

 final  WeeklyQuest quest;
@JsonKey() final  bool isClaiming;
 final  AppException? actionError;

/// Create a copy of QuestProgressState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuestProgressSuccessCopyWith<QuestProgressSuccess> get copyWith => _$QuestProgressSuccessCopyWithImpl<QuestProgressSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is QuestProgressSuccess&&(identical(other.quest, quest) || other.quest == quest)&&(identical(other.isClaiming, isClaiming) || other.isClaiming == isClaiming)&&(identical(other.actionError, actionError) || other.actionError == actionError));
}


@override
int get hashCode {
    return Object.hash(runtimeType,quest,isClaiming,actionError);
}

@override
String toString() {
    return 'QuestProgressState.success(quest: $quest, isClaiming: $isClaiming, actionError: $actionError)';
}


}

/// @nodoc
abstract mixin class $QuestProgressSuccessCopyWith<$Res> implements $QuestProgressStateCopyWith<$Res> {
  factory $QuestProgressSuccessCopyWith(QuestProgressSuccess value, $Res Function(QuestProgressSuccess) _then) = _$QuestProgressSuccessCopyWithImpl;
@useResult
$Res call({
 WeeklyQuest quest, bool isClaiming, AppException? actionError
});


$WeeklyQuestCopyWith<$Res> get quest;

}
/// @nodoc
class _$QuestProgressSuccessCopyWithImpl<$Res>
    implements $QuestProgressSuccessCopyWith<$Res> {
  _$QuestProgressSuccessCopyWithImpl(this._self, this._then);

  final QuestProgressSuccess _self;
  final $Res Function(QuestProgressSuccess) _then;

/// Create a copy of QuestProgressState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? quest = null,Object? isClaiming = null,Object? actionError = freezed,}) {
  return _then(QuestProgressSuccess(
null == quest ? _self.quest : quest // ignore: cast_nullable_to_non_nullable
as WeeklyQuest,isClaiming: null == isClaiming ? _self.isClaiming : isClaiming // ignore: cast_nullable_to_non_nullable
as bool,actionError: freezed == actionError ? _self.actionError : actionError // ignore: cast_nullable_to_non_nullable
as AppException?,
  ));
}

/// Create a copy of QuestProgressState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$WeeklyQuestCopyWith<$Res> get quest {
  
  return $WeeklyQuestCopyWith<$Res>(_self.quest, (value) {
    return _then(_self.copyWith(quest: value));
  });
}
}

/// @nodoc


class QuestProgressFailure implements QuestProgressState {
  const QuestProgressFailure(this.error);
  

 final  AppException error;

/// Create a copy of QuestProgressState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuestProgressFailureCopyWith<QuestProgressFailure> get copyWith => _$QuestProgressFailureCopyWithImpl<QuestProgressFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is QuestProgressFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'QuestProgressState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $QuestProgressFailureCopyWith<$Res> implements $QuestProgressStateCopyWith<$Res> {
  factory $QuestProgressFailureCopyWith(QuestProgressFailure value, $Res Function(QuestProgressFailure) _then) = _$QuestProgressFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$QuestProgressFailureCopyWithImpl<$Res>
    implements $QuestProgressFailureCopyWith<$Res> {
  _$QuestProgressFailureCopyWithImpl(this._self, this._then);

  final QuestProgressFailure _self;
  final $Res Function(QuestProgressFailure) _then;

/// Create a copy of QuestProgressState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(QuestProgressFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
