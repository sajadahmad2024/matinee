// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auth_event.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$AuthEvent {





@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthEvent);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'AuthEvent()';
}


}

/// @nodoc
class $AuthEventCopyWith<$Res>  {
$AuthEventCopyWith(AuthEvent _, $Res Function(AuthEvent) __);
}


/// Adds pattern-matching-related methods to [AuthEvent].
extension AuthEventPatterns on AuthEvent {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( AuthInitialized value)?  initialized,TResult Function( AuthLoginRequested value)?  loginRequested,TResult Function( AuthRegisterRequested value)?  registerRequested,TResult Function( AuthLogoutRequested value)?  logoutRequested,TResult Function( AuthTokenRefreshRequested value)?  tokenRefreshRequested,required TResult orElse(),}){
final _that = this;
switch (_that) {
case AuthInitialized() when initialized != null:
return initialized(_that);case AuthLoginRequested() when loginRequested != null:
return loginRequested(_that);case AuthRegisterRequested() when registerRequested != null:
return registerRequested(_that);case AuthLogoutRequested() when logoutRequested != null:
return logoutRequested(_that);case AuthTokenRefreshRequested() when tokenRefreshRequested != null:
return tokenRefreshRequested(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( AuthInitialized value)  initialized,required TResult Function( AuthLoginRequested value)  loginRequested,required TResult Function( AuthRegisterRequested value)  registerRequested,required TResult Function( AuthLogoutRequested value)  logoutRequested,required TResult Function( AuthTokenRefreshRequested value)  tokenRefreshRequested,}){
final _that = this;
switch (_that) {
case AuthInitialized():
return initialized(_that);case AuthLoginRequested():
return loginRequested(_that);case AuthRegisterRequested():
return registerRequested(_that);case AuthLogoutRequested():
return logoutRequested(_that);case AuthTokenRefreshRequested():
return tokenRefreshRequested(_that);case _:
  throw StateError('Unexpected subclass');

}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( AuthInitialized value)?  initialized,TResult? Function( AuthLoginRequested value)?  loginRequested,TResult? Function( AuthRegisterRequested value)?  registerRequested,TResult? Function( AuthLogoutRequested value)?  logoutRequested,TResult? Function( AuthTokenRefreshRequested value)?  tokenRefreshRequested,}){
final _that = this;
switch (_that) {
case AuthInitialized() when initialized != null:
return initialized(_that);case AuthLoginRequested() when loginRequested != null:
return loginRequested(_that);case AuthRegisterRequested() when registerRequested != null:
return registerRequested(_that);case AuthLogoutRequested() when logoutRequested != null:
return logoutRequested(_that);case AuthTokenRefreshRequested() when tokenRefreshRequested != null:
return tokenRefreshRequested(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initialized,TResult Function( String email,  String password)?  loginRequested,TResult Function( String email,  String password,  String name)?  registerRequested,TResult Function()?  logoutRequested,TResult Function()?  tokenRefreshRequested,required TResult orElse(),}) {final _that = this;
switch (_that) {
case AuthInitialized() when initialized != null:
return initialized();case AuthLoginRequested() when loginRequested != null:
return loginRequested(_that.email,_that.password);case AuthRegisterRequested() when registerRequested != null:
return registerRequested(_that.email,_that.password,_that.name);case AuthLogoutRequested() when logoutRequested != null:
return logoutRequested();case AuthTokenRefreshRequested() when tokenRefreshRequested != null:
return tokenRefreshRequested();case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initialized,required TResult Function( String email,  String password)  loginRequested,required TResult Function( String email,  String password,  String name)  registerRequested,required TResult Function()  logoutRequested,required TResult Function()  tokenRefreshRequested,}) {final _that = this;
switch (_that) {
case AuthInitialized():
return initialized();case AuthLoginRequested():
return loginRequested(_that.email,_that.password);case AuthRegisterRequested():
return registerRequested(_that.email,_that.password,_that.name);case AuthLogoutRequested():
return logoutRequested();case AuthTokenRefreshRequested():
return tokenRefreshRequested();case _:
  throw StateError('Unexpected subclass');

}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initialized,TResult? Function( String email,  String password)?  loginRequested,TResult? Function( String email,  String password,  String name)?  registerRequested,TResult? Function()?  logoutRequested,TResult? Function()?  tokenRefreshRequested,}) {final _that = this;
switch (_that) {
case AuthInitialized() when initialized != null:
return initialized();case AuthLoginRequested() when loginRequested != null:
return loginRequested(_that.email,_that.password);case AuthRegisterRequested() when registerRequested != null:
return registerRequested(_that.email,_that.password,_that.name);case AuthLogoutRequested() when logoutRequested != null:
return logoutRequested();case AuthTokenRefreshRequested() when tokenRefreshRequested != null:
return tokenRefreshRequested();case _:
  return null;

}
}

}

/// @nodoc


class AuthInitialized implements AuthEvent {
  const AuthInitialized();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthInitialized);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'AuthEvent.initialized()';
}


}




/// @nodoc


class AuthLoginRequested implements AuthEvent {
  const AuthLoginRequested({required this.email, required this.password});
  

 final  String email;
 final  String password;

/// Create a copy of AuthEvent
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthLoginRequestedCopyWith<AuthLoginRequested> get copyWith => _$AuthLoginRequestedCopyWithImpl<AuthLoginRequested>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthLoginRequested&&(identical(other.email, email) || other.email == email)&&(identical(other.password, password) || other.password == password));
}


@override
int get hashCode => Object.hash(runtimeType,email,password);

@override
String toString() {
  return 'AuthEvent.loginRequested(email: $email, password: $password)';
}


}

/// @nodoc
abstract mixin class $AuthLoginRequestedCopyWith<$Res> implements $AuthEventCopyWith<$Res> {
  factory $AuthLoginRequestedCopyWith(AuthLoginRequested value, $Res Function(AuthLoginRequested) _then) = _$AuthLoginRequestedCopyWithImpl;
@useResult
$Res call({
 String email, String password
});




}
/// @nodoc
class _$AuthLoginRequestedCopyWithImpl<$Res>
    implements $AuthLoginRequestedCopyWith<$Res> {
  _$AuthLoginRequestedCopyWithImpl(this._self, this._then);

  final AuthLoginRequested _self;
  final $Res Function(AuthLoginRequested) _then;

/// Create a copy of AuthEvent
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? email = null,Object? password = null,}) {
  return _then(AuthLoginRequested(
email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,password: null == password ? _self.password : password // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class AuthRegisterRequested implements AuthEvent {
  const AuthRegisterRequested({required this.email, required this.password, required this.name});
  

 final  String email;
 final  String password;
 final  String name;

/// Create a copy of AuthEvent
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuthRegisterRequestedCopyWith<AuthRegisterRequested> get copyWith => _$AuthRegisterRequestedCopyWithImpl<AuthRegisterRequested>(this, _$identity);



@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthRegisterRequested&&(identical(other.email, email) || other.email == email)&&(identical(other.password, password) || other.password == password)&&(identical(other.name, name) || other.name == name));
}


@override
int get hashCode => Object.hash(runtimeType,email,password,name);

@override
String toString() {
  return 'AuthEvent.registerRequested(email: $email, password: $password, name: $name)';
}


}

/// @nodoc
abstract mixin class $AuthRegisterRequestedCopyWith<$Res> implements $AuthEventCopyWith<$Res> {
  factory $AuthRegisterRequestedCopyWith(AuthRegisterRequested value, $Res Function(AuthRegisterRequested) _then) = _$AuthRegisterRequestedCopyWithImpl;
@useResult
$Res call({
 String email, String password, String name
});




}
/// @nodoc
class _$AuthRegisterRequestedCopyWithImpl<$Res>
    implements $AuthRegisterRequestedCopyWith<$Res> {
  _$AuthRegisterRequestedCopyWithImpl(this._self, this._then);

  final AuthRegisterRequested _self;
  final $Res Function(AuthRegisterRequested) _then;

/// Create a copy of AuthEvent
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? email = null,Object? password = null,Object? name = null,}) {
  return _then(AuthRegisterRequested(
email: null == email ? _self.email : email // ignore: cast_nullable_to_non_nullable
as String,password: null == password ? _self.password : password // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc


class AuthLogoutRequested implements AuthEvent {
  const AuthLogoutRequested();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthLogoutRequested);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'AuthEvent.logoutRequested()';
}


}




/// @nodoc


class AuthTokenRefreshRequested implements AuthEvent {
  const AuthTokenRefreshRequested();
  






@override
bool operator ==(Object other) {
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuthTokenRefreshRequested);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
  return 'AuthEvent.tokenRefreshRequested()';
}


}




// dart format on
