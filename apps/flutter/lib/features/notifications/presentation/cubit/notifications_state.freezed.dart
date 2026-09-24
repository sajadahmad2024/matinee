// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'notifications_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$NotificationsState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationsState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'NotificationsState()';
}


}

/// @nodoc
class $NotificationsStateCopyWith<$Res>  {
$NotificationsStateCopyWith(NotificationsState _, $Res Function(NotificationsState) __);
}


/// Adds pattern-matching-related methods to [NotificationsState].
extension NotificationsStatePatterns on NotificationsState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( NotificationsInitial value)?  initial,TResult Function( NotificationsLoading value)?  loading,TResult Function( NotificationsSuccess value)?  success,TResult Function( NotificationsFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case NotificationsInitial() when initial != null:
return initial(_that);case NotificationsLoading() when loading != null:
return loading(_that);case NotificationsSuccess() when success != null:
return success(_that);case NotificationsFailure() when failure != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( NotificationsInitial value)  initial,required TResult Function( NotificationsLoading value)  loading,required TResult Function( NotificationsSuccess value)  success,required TResult Function( NotificationsFailure value)  failure,}){
final _that = this;
switch (_that) {
case NotificationsInitial():
return initial(_that);case NotificationsLoading():
return loading(_that);case NotificationsSuccess():
return success(_that);case NotificationsFailure():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( NotificationsInitial value)?  initial,TResult? Function( NotificationsLoading value)?  loading,TResult? Function( NotificationsSuccess value)?  success,TResult? Function( NotificationsFailure value)?  failure,}){
final _that = this;
switch (_that) {
case NotificationsInitial() when initial != null:
return initial(_that);case NotificationsLoading() when loading != null:
return loading(_that);case NotificationsSuccess() when success != null:
return success(_that);case NotificationsFailure() when failure != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( List<AppNotification> notifications,  NotificationCategory? filter)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case NotificationsInitial() when initial != null:
return initial();case NotificationsLoading() when loading != null:
return loading();case NotificationsSuccess() when success != null:
return success(_that.notifications,_that.filter);case NotificationsFailure() when failure != null:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( List<AppNotification> notifications,  NotificationCategory? filter)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case NotificationsInitial():
return initial();case NotificationsLoading():
return loading();case NotificationsSuccess():
return success(_that.notifications,_that.filter);case NotificationsFailure():
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( List<AppNotification> notifications,  NotificationCategory? filter)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case NotificationsInitial() when initial != null:
return initial();case NotificationsLoading() when loading != null:
return loading();case NotificationsSuccess() when success != null:
return success(_that.notifications,_that.filter);case NotificationsFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class NotificationsInitial implements NotificationsState {
  const NotificationsInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationsInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'NotificationsState.initial()';
}


}




/// @nodoc


class NotificationsLoading implements NotificationsState {
  const NotificationsLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationsLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'NotificationsState.loading()';
}


}




/// @nodoc


class NotificationsSuccess implements NotificationsState {
  const NotificationsSuccess({required  List<AppNotification> notifications, this.filter}): _notifications = notifications;
  

 final  List<AppNotification> _notifications;
 List<AppNotification> get notifications {
  if (_notifications is EqualUnmodifiableListView) return _notifications;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_notifications);
}

 final  NotificationCategory? filter;

/// Create a copy of NotificationsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$NotificationsSuccessCopyWith<NotificationsSuccess> get copyWith => _$NotificationsSuccessCopyWithImpl<NotificationsSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationsSuccess&&const DeepCollectionEquality().equals(other.notifications, _notifications)&&(identical(other.filter, filter) || other.filter == filter));
}


@override
int get hashCode {
    return Object.hash(runtimeType,const DeepCollectionEquality().hash(_notifications),filter);
}

@override
String toString() {
    return 'NotificationsState.success(notifications: $notifications, filter: $filter)';
}


}

/// @nodoc
abstract mixin class $NotificationsSuccessCopyWith<$Res> implements $NotificationsStateCopyWith<$Res> {
  factory $NotificationsSuccessCopyWith(NotificationsSuccess value, $Res Function(NotificationsSuccess) _then) = _$NotificationsSuccessCopyWithImpl;
@useResult
$Res call({
 List<AppNotification> notifications, NotificationCategory? filter
});




}
/// @nodoc
class _$NotificationsSuccessCopyWithImpl<$Res>
    implements $NotificationsSuccessCopyWith<$Res> {
  _$NotificationsSuccessCopyWithImpl(this._self, this._then);

  final NotificationsSuccess _self;
  final $Res Function(NotificationsSuccess) _then;

/// Create a copy of NotificationsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? notifications = null,Object? filter = freezed,}) {
  return _then(NotificationsSuccess(
notifications: null == notifications ? _self._notifications : notifications // ignore: cast_nullable_to_non_nullable
as List<AppNotification>,filter: freezed == filter ? _self.filter : filter // ignore: cast_nullable_to_non_nullable
as NotificationCategory?,
  ));
}


}

/// @nodoc


class NotificationsFailure implements NotificationsState {
  const NotificationsFailure(this.error);
  

 final  AppException error;

/// Create a copy of NotificationsState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$NotificationsFailureCopyWith<NotificationsFailure> get copyWith => _$NotificationsFailureCopyWithImpl<NotificationsFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationsFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'NotificationsState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $NotificationsFailureCopyWith<$Res> implements $NotificationsStateCopyWith<$Res> {
  factory $NotificationsFailureCopyWith(NotificationsFailure value, $Res Function(NotificationsFailure) _then) = _$NotificationsFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$NotificationsFailureCopyWithImpl<$Res>
    implements $NotificationsFailureCopyWith<$Res> {
  _$NotificationsFailureCopyWithImpl(this._self, this._then);

  final NotificationsFailure _self;
  final $Res Function(NotificationsFailure) _then;

/// Create a copy of NotificationsState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(NotificationsFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

// dart format on
