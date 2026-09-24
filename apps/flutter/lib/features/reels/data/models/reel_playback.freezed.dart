// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'reel_playback.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$ReelAuthConfig {

 String? get headerName; String? get headerValue; String? get tokenRefreshId;
/// Create a copy of ReelAuthConfig
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelAuthConfigCopyWith<ReelAuthConfig> get copyWith => _$ReelAuthConfigCopyWithImpl<ReelAuthConfig>(this as ReelAuthConfig, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as ReelAuthConfig;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelAuthConfig&&(identical(other.headerName, _this.headerName) || other.headerName == _this.headerName)&&(identical(other.headerValue, _this.headerValue) || other.headerValue == _this.headerValue)&&(identical(other.tokenRefreshId, _this.tokenRefreshId) || other.tokenRefreshId == _this.tokenRefreshId));
}


@override
int get hashCode {
  final _this = this as ReelAuthConfig;
  return Object.hash(runtimeType,_this.headerName,_this.headerValue,_this.tokenRefreshId);
}

@override
String toString() {
  final _this = this as ReelAuthConfig;
  return 'ReelAuthConfig(headerName: ${_this.headerName}, headerValue: ${_this.headerValue}, tokenRefreshId: ${_this.tokenRefreshId})';
}


}

/// @nodoc
abstract mixin class $ReelAuthConfigCopyWith<$Res>  {
  factory $ReelAuthConfigCopyWith(ReelAuthConfig value, $Res Function(ReelAuthConfig) _then) = _$ReelAuthConfigCopyWithImpl;
@useResult
$Res call({
 String? headerName, String? headerValue, String? tokenRefreshId
});




}
/// @nodoc
class _$ReelAuthConfigCopyWithImpl<$Res>
    implements $ReelAuthConfigCopyWith<$Res> {
  _$ReelAuthConfigCopyWithImpl(this._self, this._then);

  final ReelAuthConfig _self;
  final $Res Function(ReelAuthConfig) _then;

/// Create a copy of ReelAuthConfig
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? headerName = freezed,Object? headerValue = freezed,Object? tokenRefreshId = freezed,}) {
  return _then(ReelAuthConfig(
headerName: freezed == headerName ? _self.headerName : headerName // ignore: cast_nullable_to_non_nullable
as String?,headerValue: freezed == headerValue ? _self.headerValue : headerValue // ignore: cast_nullable_to_non_nullable
as String?,tokenRefreshId: freezed == tokenRefreshId ? _self.tokenRefreshId : tokenRefreshId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [ReelAuthConfig].
extension ReelAuthConfigPatterns on ReelAuthConfig {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReelAuthConfig value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReelAuthConfig() when $default != null:
return $default(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReelAuthConfig value)  $default,){
final _that = this;
switch (_that) {
case _ReelAuthConfig():
return $default(_that);case _:
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReelAuthConfig value)?  $default,){
final _that = this;
switch (_that) {
case _ReelAuthConfig() when $default != null:
return $default(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? headerName,  String? headerValue,  String? tokenRefreshId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReelAuthConfig() when $default != null:
return $default(_that.headerName,_that.headerValue,_that.tokenRefreshId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? headerName,  String? headerValue,  String? tokenRefreshId)  $default,) {final _that = this;
switch (_that) {
case _ReelAuthConfig():
return $default(_that.headerName,_that.headerValue,_that.tokenRefreshId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? headerName,  String? headerValue,  String? tokenRefreshId)?  $default,) {final _that = this;
switch (_that) {
case _ReelAuthConfig() when $default != null:
return $default(_that.headerName,_that.headerValue,_that.tokenRefreshId);case _:
  return null;

}
}

}

/// @nodoc


class _ReelAuthConfig implements ReelAuthConfig {
  const _ReelAuthConfig({this.headerName, this.headerValue, this.tokenRefreshId});
  

@override final  String? headerName;
@override final  String? headerValue;
@override final  String? tokenRefreshId;

/// Create a copy of ReelAuthConfig
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReelAuthConfigCopyWith<_ReelAuthConfig> get copyWith => __$ReelAuthConfigCopyWithImpl<_ReelAuthConfig>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReelAuthConfig&&(identical(other.headerName, headerName) || other.headerName == headerName)&&(identical(other.headerValue, headerValue) || other.headerValue == headerValue)&&(identical(other.tokenRefreshId, tokenRefreshId) || other.tokenRefreshId == tokenRefreshId));
}


@override
int get hashCode {
    return Object.hash(runtimeType,headerName,headerValue,tokenRefreshId);
}

@override
String toString() {
    return 'ReelAuthConfig(headerName: $headerName, headerValue: $headerValue, tokenRefreshId: $tokenRefreshId)';
}


}

/// @nodoc
abstract mixin class _$ReelAuthConfigCopyWith<$Res> implements $ReelAuthConfigCopyWith<$Res> {
  factory _$ReelAuthConfigCopyWith(_ReelAuthConfig value, $Res Function(_ReelAuthConfig) _then) = __$ReelAuthConfigCopyWithImpl;
@override @useResult
$Res call({
 String? headerName, String? headerValue, String? tokenRefreshId
});




}
/// @nodoc
class __$ReelAuthConfigCopyWithImpl<$Res>
    implements _$ReelAuthConfigCopyWith<$Res> {
  __$ReelAuthConfigCopyWithImpl(this._self, this._then);

  final _ReelAuthConfig _self;
  final $Res Function(_ReelAuthConfig) _then;

/// Create a copy of ReelAuthConfig
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? headerName = freezed,Object? headerValue = freezed,Object? tokenRefreshId = freezed,}) {
  return _then(_ReelAuthConfig(
headerName: freezed == headerName ? _self.headerName : headerName // ignore: cast_nullable_to_non_nullable
as String?,headerValue: freezed == headerValue ? _self.headerValue : headerValue // ignore: cast_nullable_to_non_nullable
as String?,tokenRefreshId: freezed == tokenRefreshId ? _self.tokenRefreshId : tokenRefreshId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

/// @nodoc
mixin _$ReelDrmConfig {

 String? get certificateUrl; String? get licenseServerUrl; String? get contentId;
/// Create a copy of ReelDrmConfig
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelDrmConfigCopyWith<ReelDrmConfig> get copyWith => _$ReelDrmConfigCopyWithImpl<ReelDrmConfig>(this as ReelDrmConfig, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as ReelDrmConfig;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelDrmConfig&&(identical(other.certificateUrl, _this.certificateUrl) || other.certificateUrl == _this.certificateUrl)&&(identical(other.licenseServerUrl, _this.licenseServerUrl) || other.licenseServerUrl == _this.licenseServerUrl)&&(identical(other.contentId, _this.contentId) || other.contentId == _this.contentId));
}


@override
int get hashCode {
  final _this = this as ReelDrmConfig;
  return Object.hash(runtimeType,_this.certificateUrl,_this.licenseServerUrl,_this.contentId);
}

@override
String toString() {
  final _this = this as ReelDrmConfig;
  return 'ReelDrmConfig(certificateUrl: ${_this.certificateUrl}, licenseServerUrl: ${_this.licenseServerUrl}, contentId: ${_this.contentId})';
}


}

/// @nodoc
abstract mixin class $ReelDrmConfigCopyWith<$Res>  {
  factory $ReelDrmConfigCopyWith(ReelDrmConfig value, $Res Function(ReelDrmConfig) _then) = _$ReelDrmConfigCopyWithImpl;
@useResult
$Res call({
 String? certificateUrl, String? licenseServerUrl, String? contentId
});




}
/// @nodoc
class _$ReelDrmConfigCopyWithImpl<$Res>
    implements $ReelDrmConfigCopyWith<$Res> {
  _$ReelDrmConfigCopyWithImpl(this._self, this._then);

  final ReelDrmConfig _self;
  final $Res Function(ReelDrmConfig) _then;

/// Create a copy of ReelDrmConfig
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? certificateUrl = freezed,Object? licenseServerUrl = freezed,Object? contentId = freezed,}) {
  return _then(ReelDrmConfig(
certificateUrl: freezed == certificateUrl ? _self.certificateUrl : certificateUrl // ignore: cast_nullable_to_non_nullable
as String?,licenseServerUrl: freezed == licenseServerUrl ? _self.licenseServerUrl : licenseServerUrl // ignore: cast_nullable_to_non_nullable
as String?,contentId: freezed == contentId ? _self.contentId : contentId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [ReelDrmConfig].
extension ReelDrmConfigPatterns on ReelDrmConfig {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReelDrmConfig value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReelDrmConfig() when $default != null:
return $default(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReelDrmConfig value)  $default,){
final _that = this;
switch (_that) {
case _ReelDrmConfig():
return $default(_that);case _:
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReelDrmConfig value)?  $default,){
final _that = this;
switch (_that) {
case _ReelDrmConfig() when $default != null:
return $default(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String? certificateUrl,  String? licenseServerUrl,  String? contentId)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReelDrmConfig() when $default != null:
return $default(_that.certificateUrl,_that.licenseServerUrl,_that.contentId);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String? certificateUrl,  String? licenseServerUrl,  String? contentId)  $default,) {final _that = this;
switch (_that) {
case _ReelDrmConfig():
return $default(_that.certificateUrl,_that.licenseServerUrl,_that.contentId);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String? certificateUrl,  String? licenseServerUrl,  String? contentId)?  $default,) {final _that = this;
switch (_that) {
case _ReelDrmConfig() when $default != null:
return $default(_that.certificateUrl,_that.licenseServerUrl,_that.contentId);case _:
  return null;

}
}

}

/// @nodoc


class _ReelDrmConfig implements ReelDrmConfig {
  const _ReelDrmConfig({this.certificateUrl, this.licenseServerUrl, this.contentId});
  

@override final  String? certificateUrl;
@override final  String? licenseServerUrl;
@override final  String? contentId;

/// Create a copy of ReelDrmConfig
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReelDrmConfigCopyWith<_ReelDrmConfig> get copyWith => __$ReelDrmConfigCopyWithImpl<_ReelDrmConfig>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReelDrmConfig&&(identical(other.certificateUrl, certificateUrl) || other.certificateUrl == certificateUrl)&&(identical(other.licenseServerUrl, licenseServerUrl) || other.licenseServerUrl == licenseServerUrl)&&(identical(other.contentId, contentId) || other.contentId == contentId));
}


@override
int get hashCode {
    return Object.hash(runtimeType,certificateUrl,licenseServerUrl,contentId);
}

@override
String toString() {
    return 'ReelDrmConfig(certificateUrl: $certificateUrl, licenseServerUrl: $licenseServerUrl, contentId: $contentId)';
}


}

/// @nodoc
abstract mixin class _$ReelDrmConfigCopyWith<$Res> implements $ReelDrmConfigCopyWith<$Res> {
  factory _$ReelDrmConfigCopyWith(_ReelDrmConfig value, $Res Function(_ReelDrmConfig) _then) = __$ReelDrmConfigCopyWithImpl;
@override @useResult
$Res call({
 String? certificateUrl, String? licenseServerUrl, String? contentId
});




}
/// @nodoc
class __$ReelDrmConfigCopyWithImpl<$Res>
    implements _$ReelDrmConfigCopyWith<$Res> {
  __$ReelDrmConfigCopyWithImpl(this._self, this._then);

  final _ReelDrmConfig _self;
  final $Res Function(_ReelDrmConfig) _then;

/// Create a copy of ReelDrmConfig
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? certificateUrl = freezed,Object? licenseServerUrl = freezed,Object? contentId = freezed,}) {
  return _then(_ReelDrmConfig(
certificateUrl: freezed == certificateUrl ? _self.certificateUrl : certificateUrl // ignore: cast_nullable_to_non_nullable
as String?,licenseServerUrl: freezed == licenseServerUrl ? _self.licenseServerUrl : licenseServerUrl // ignore: cast_nullable_to_non_nullable
as String?,contentId: freezed == contentId ? _self.contentId : contentId // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

/// @nodoc
mixin _$ReelPlayback {

 ReelPlaybackKind get kind; ReelDrmKind get drm; ReelAuthMode get authMode; ReelCachePolicy get cachePolicy; bool get prefetchEnabled; bool get substitutionEnabled; int get maxPrefetchSegments; int get maxPrefetchHeight; ReelAuthConfig? get authConfig; ReelDrmConfig? get drmConfig;
/// Create a copy of ReelPlayback
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelPlaybackCopyWith<ReelPlayback> get copyWith => _$ReelPlaybackCopyWithImpl<ReelPlayback>(this as ReelPlayback, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as ReelPlayback;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelPlayback&&(identical(other.kind, _this.kind) || other.kind == _this.kind)&&(identical(other.drm, _this.drm) || other.drm == _this.drm)&&(identical(other.authMode, _this.authMode) || other.authMode == _this.authMode)&&(identical(other.cachePolicy, _this.cachePolicy) || other.cachePolicy == _this.cachePolicy)&&(identical(other.prefetchEnabled, _this.prefetchEnabled) || other.prefetchEnabled == _this.prefetchEnabled)&&(identical(other.substitutionEnabled, _this.substitutionEnabled) || other.substitutionEnabled == _this.substitutionEnabled)&&(identical(other.maxPrefetchSegments, _this.maxPrefetchSegments) || other.maxPrefetchSegments == _this.maxPrefetchSegments)&&(identical(other.maxPrefetchHeight, _this.maxPrefetchHeight) || other.maxPrefetchHeight == _this.maxPrefetchHeight)&&(identical(other.authConfig, _this.authConfig) || other.authConfig == _this.authConfig)&&(identical(other.drmConfig, _this.drmConfig) || other.drmConfig == _this.drmConfig));
}


@override
int get hashCode {
  final _this = this as ReelPlayback;
  return Object.hash(runtimeType,_this.kind,_this.drm,_this.authMode,_this.cachePolicy,_this.prefetchEnabled,_this.substitutionEnabled,_this.maxPrefetchSegments,_this.maxPrefetchHeight,_this.authConfig,_this.drmConfig);
}

@override
String toString() {
  final _this = this as ReelPlayback;
  return 'ReelPlayback(kind: ${_this.kind}, drm: ${_this.drm}, authMode: ${_this.authMode}, cachePolicy: ${_this.cachePolicy}, prefetchEnabled: ${_this.prefetchEnabled}, substitutionEnabled: ${_this.substitutionEnabled}, maxPrefetchSegments: ${_this.maxPrefetchSegments}, maxPrefetchHeight: ${_this.maxPrefetchHeight}, authConfig: ${_this.authConfig}, drmConfig: ${_this.drmConfig})';
}


}

/// @nodoc
abstract mixin class $ReelPlaybackCopyWith<$Res>  {
  factory $ReelPlaybackCopyWith(ReelPlayback value, $Res Function(ReelPlayback) _then) = _$ReelPlaybackCopyWithImpl;
@useResult
$Res call({
 ReelPlaybackKind kind, ReelDrmKind drm, ReelAuthMode authMode, ReelCachePolicy cachePolicy, bool prefetchEnabled, bool substitutionEnabled, int maxPrefetchSegments, int maxPrefetchHeight, ReelAuthConfig? authConfig, ReelDrmConfig? drmConfig
});


$ReelAuthConfigCopyWith<$Res>? get authConfig;$ReelDrmConfigCopyWith<$Res>? get drmConfig;

}
/// @nodoc
class _$ReelPlaybackCopyWithImpl<$Res>
    implements $ReelPlaybackCopyWith<$Res> {
  _$ReelPlaybackCopyWithImpl(this._self, this._then);

  final ReelPlayback _self;
  final $Res Function(ReelPlayback) _then;

/// Create a copy of ReelPlayback
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? kind = null,Object? drm = null,Object? authMode = null,Object? cachePolicy = null,Object? prefetchEnabled = null,Object? substitutionEnabled = null,Object? maxPrefetchSegments = null,Object? maxPrefetchHeight = null,Object? authConfig = freezed,Object? drmConfig = freezed,}) {
  return _then(ReelPlayback(
kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as ReelPlaybackKind,drm: null == drm ? _self.drm : drm // ignore: cast_nullable_to_non_nullable
as ReelDrmKind,authMode: null == authMode ? _self.authMode : authMode // ignore: cast_nullable_to_non_nullable
as ReelAuthMode,cachePolicy: null == cachePolicy ? _self.cachePolicy : cachePolicy // ignore: cast_nullable_to_non_nullable
as ReelCachePolicy,prefetchEnabled: null == prefetchEnabled ? _self.prefetchEnabled : prefetchEnabled // ignore: cast_nullable_to_non_nullable
as bool,substitutionEnabled: null == substitutionEnabled ? _self.substitutionEnabled : substitutionEnabled // ignore: cast_nullable_to_non_nullable
as bool,maxPrefetchSegments: null == maxPrefetchSegments ? _self.maxPrefetchSegments : maxPrefetchSegments // ignore: cast_nullable_to_non_nullable
as int,maxPrefetchHeight: null == maxPrefetchHeight ? _self.maxPrefetchHeight : maxPrefetchHeight // ignore: cast_nullable_to_non_nullable
as int,authConfig: freezed == authConfig ? _self.authConfig : authConfig // ignore: cast_nullable_to_non_nullable
as ReelAuthConfig?,drmConfig: freezed == drmConfig ? _self.drmConfig : drmConfig // ignore: cast_nullable_to_non_nullable
as ReelDrmConfig?,
  ));
}
/// Create a copy of ReelPlayback
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelAuthConfigCopyWith<$Res>? get authConfig {
    if (_self.authConfig == null) {
    return null;
  }

  return $ReelAuthConfigCopyWith<$Res>(_self.authConfig!, (value) {
    return _then(_self.copyWith(authConfig: value));
  });
}/// Create a copy of ReelPlayback
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelDrmConfigCopyWith<$Res>? get drmConfig {
    if (_self.drmConfig == null) {
    return null;
  }

  return $ReelDrmConfigCopyWith<$Res>(_self.drmConfig!, (value) {
    return _then(_self.copyWith(drmConfig: value));
  });
}
}


/// Adds pattern-matching-related methods to [ReelPlayback].
extension ReelPlaybackPatterns on ReelPlayback {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReelPlayback value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReelPlayback() when $default != null:
return $default(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReelPlayback value)  $default,){
final _that = this;
switch (_that) {
case _ReelPlayback():
return $default(_that);case _:
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReelPlayback value)?  $default,){
final _that = this;
switch (_that) {
case _ReelPlayback() when $default != null:
return $default(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( ReelPlaybackKind kind,  ReelDrmKind drm,  ReelAuthMode authMode,  ReelCachePolicy cachePolicy,  bool prefetchEnabled,  bool substitutionEnabled,  int maxPrefetchSegments,  int maxPrefetchHeight,  ReelAuthConfig? authConfig,  ReelDrmConfig? drmConfig)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReelPlayback() when $default != null:
return $default(_that.kind,_that.drm,_that.authMode,_that.cachePolicy,_that.prefetchEnabled,_that.substitutionEnabled,_that.maxPrefetchSegments,_that.maxPrefetchHeight,_that.authConfig,_that.drmConfig);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( ReelPlaybackKind kind,  ReelDrmKind drm,  ReelAuthMode authMode,  ReelCachePolicy cachePolicy,  bool prefetchEnabled,  bool substitutionEnabled,  int maxPrefetchSegments,  int maxPrefetchHeight,  ReelAuthConfig? authConfig,  ReelDrmConfig? drmConfig)  $default,) {final _that = this;
switch (_that) {
case _ReelPlayback():
return $default(_that.kind,_that.drm,_that.authMode,_that.cachePolicy,_that.prefetchEnabled,_that.substitutionEnabled,_that.maxPrefetchSegments,_that.maxPrefetchHeight,_that.authConfig,_that.drmConfig);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( ReelPlaybackKind kind,  ReelDrmKind drm,  ReelAuthMode authMode,  ReelCachePolicy cachePolicy,  bool prefetchEnabled,  bool substitutionEnabled,  int maxPrefetchSegments,  int maxPrefetchHeight,  ReelAuthConfig? authConfig,  ReelDrmConfig? drmConfig)?  $default,) {final _that = this;
switch (_that) {
case _ReelPlayback() when $default != null:
return $default(_that.kind,_that.drm,_that.authMode,_that.cachePolicy,_that.prefetchEnabled,_that.substitutionEnabled,_that.maxPrefetchSegments,_that.maxPrefetchHeight,_that.authConfig,_that.drmConfig);case _:
  return null;

}
}

}

/// @nodoc


class _ReelPlayback implements ReelPlayback {
  const _ReelPlayback({required this.kind, required this.drm, required this.authMode, required this.cachePolicy, required this.prefetchEnabled, required this.substitutionEnabled, required this.maxPrefetchSegments, required this.maxPrefetchHeight, this.authConfig, this.drmConfig});
  

@override final  ReelPlaybackKind kind;
@override final  ReelDrmKind drm;
@override final  ReelAuthMode authMode;
@override final  ReelCachePolicy cachePolicy;
@override final  bool prefetchEnabled;
@override final  bool substitutionEnabled;
@override final  int maxPrefetchSegments;
@override final  int maxPrefetchHeight;
@override final  ReelAuthConfig? authConfig;
@override final  ReelDrmConfig? drmConfig;

/// Create a copy of ReelPlayback
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReelPlaybackCopyWith<_ReelPlayback> get copyWith => __$ReelPlaybackCopyWithImpl<_ReelPlayback>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReelPlayback&&(identical(other.kind, kind) || other.kind == kind)&&(identical(other.drm, drm) || other.drm == drm)&&(identical(other.authMode, authMode) || other.authMode == authMode)&&(identical(other.cachePolicy, cachePolicy) || other.cachePolicy == cachePolicy)&&(identical(other.prefetchEnabled, prefetchEnabled) || other.prefetchEnabled == prefetchEnabled)&&(identical(other.substitutionEnabled, substitutionEnabled) || other.substitutionEnabled == substitutionEnabled)&&(identical(other.maxPrefetchSegments, maxPrefetchSegments) || other.maxPrefetchSegments == maxPrefetchSegments)&&(identical(other.maxPrefetchHeight, maxPrefetchHeight) || other.maxPrefetchHeight == maxPrefetchHeight)&&(identical(other.authConfig, authConfig) || other.authConfig == authConfig)&&(identical(other.drmConfig, drmConfig) || other.drmConfig == drmConfig));
}


@override
int get hashCode {
    return Object.hash(runtimeType,kind,drm,authMode,cachePolicy,prefetchEnabled,substitutionEnabled,maxPrefetchSegments,maxPrefetchHeight,authConfig,drmConfig);
}

@override
String toString() {
    return 'ReelPlayback(kind: $kind, drm: $drm, authMode: $authMode, cachePolicy: $cachePolicy, prefetchEnabled: $prefetchEnabled, substitutionEnabled: $substitutionEnabled, maxPrefetchSegments: $maxPrefetchSegments, maxPrefetchHeight: $maxPrefetchHeight, authConfig: $authConfig, drmConfig: $drmConfig)';
}


}

/// @nodoc
abstract mixin class _$ReelPlaybackCopyWith<$Res> implements $ReelPlaybackCopyWith<$Res> {
  factory _$ReelPlaybackCopyWith(_ReelPlayback value, $Res Function(_ReelPlayback) _then) = __$ReelPlaybackCopyWithImpl;
@override @useResult
$Res call({
 ReelPlaybackKind kind, ReelDrmKind drm, ReelAuthMode authMode, ReelCachePolicy cachePolicy, bool prefetchEnabled, bool substitutionEnabled, int maxPrefetchSegments, int maxPrefetchHeight, ReelAuthConfig? authConfig, ReelDrmConfig? drmConfig
});


@override $ReelAuthConfigCopyWith<$Res>? get authConfig;@override $ReelDrmConfigCopyWith<$Res>? get drmConfig;

}
/// @nodoc
class __$ReelPlaybackCopyWithImpl<$Res>
    implements _$ReelPlaybackCopyWith<$Res> {
  __$ReelPlaybackCopyWithImpl(this._self, this._then);

  final _ReelPlayback _self;
  final $Res Function(_ReelPlayback) _then;

/// Create a copy of ReelPlayback
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? kind = null,Object? drm = null,Object? authMode = null,Object? cachePolicy = null,Object? prefetchEnabled = null,Object? substitutionEnabled = null,Object? maxPrefetchSegments = null,Object? maxPrefetchHeight = null,Object? authConfig = freezed,Object? drmConfig = freezed,}) {
  return _then(_ReelPlayback(
kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as ReelPlaybackKind,drm: null == drm ? _self.drm : drm // ignore: cast_nullable_to_non_nullable
as ReelDrmKind,authMode: null == authMode ? _self.authMode : authMode // ignore: cast_nullable_to_non_nullable
as ReelAuthMode,cachePolicy: null == cachePolicy ? _self.cachePolicy : cachePolicy // ignore: cast_nullable_to_non_nullable
as ReelCachePolicy,prefetchEnabled: null == prefetchEnabled ? _self.prefetchEnabled : prefetchEnabled // ignore: cast_nullable_to_non_nullable
as bool,substitutionEnabled: null == substitutionEnabled ? _self.substitutionEnabled : substitutionEnabled // ignore: cast_nullable_to_non_nullable
as bool,maxPrefetchSegments: null == maxPrefetchSegments ? _self.maxPrefetchSegments : maxPrefetchSegments // ignore: cast_nullable_to_non_nullable
as int,maxPrefetchHeight: null == maxPrefetchHeight ? _self.maxPrefetchHeight : maxPrefetchHeight // ignore: cast_nullable_to_non_nullable
as int,authConfig: freezed == authConfig ? _self.authConfig : authConfig // ignore: cast_nullable_to_non_nullable
as ReelAuthConfig?,drmConfig: freezed == drmConfig ? _self.drmConfig : drmConfig // ignore: cast_nullable_to_non_nullable
as ReelDrmConfig?,
  ));
}

/// Create a copy of ReelPlayback
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelAuthConfigCopyWith<$Res>? get authConfig {
    if (_self.authConfig == null) {
    return null;
  }

  return $ReelAuthConfigCopyWith<$Res>(_self.authConfig!, (value) {
    return _then(_self.copyWith(authConfig: value));
  });
}/// Create a copy of ReelPlayback
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelDrmConfigCopyWith<$Res>? get drmConfig {
    if (_self.drmConfig == null) {
    return null;
  }

  return $ReelDrmConfigCopyWith<$Res>(_self.drmConfig!, (value) {
    return _then(_self.copyWith(drmConfig: value));
  });
}
}

// dart format on
