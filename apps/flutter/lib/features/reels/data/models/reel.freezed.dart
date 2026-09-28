// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'reel.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$ReelAuthor {

 String get id; String get handle; String get displayName;
/// Create a copy of ReelAuthor
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelAuthorCopyWith<ReelAuthor> get copyWith => _$ReelAuthorCopyWithImpl<ReelAuthor>(this as ReelAuthor, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as ReelAuthor;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelAuthor&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.handle, _this.handle) || other.handle == _this.handle)&&(identical(other.displayName, _this.displayName) || other.displayName == _this.displayName));
}


@override
int get hashCode {
  final _this = this as ReelAuthor;
  return Object.hash(runtimeType,_this.id,_this.handle,_this.displayName);
}

@override
String toString() {
  final _this = this as ReelAuthor;
  return 'ReelAuthor(id: ${_this.id}, handle: ${_this.handle}, displayName: ${_this.displayName})';
}


}

/// @nodoc
abstract mixin class $ReelAuthorCopyWith<$Res>  {
  factory $ReelAuthorCopyWith(ReelAuthor value, $Res Function(ReelAuthor) _then) = _$ReelAuthorCopyWithImpl;
@useResult
$Res call({
 String id, String handle, String displayName
});




}
/// @nodoc
class _$ReelAuthorCopyWithImpl<$Res>
    implements $ReelAuthorCopyWith<$Res> {
  _$ReelAuthorCopyWithImpl(this._self, this._then);

  final ReelAuthor _self;
  final $Res Function(ReelAuthor) _then;

/// Create a copy of ReelAuthor
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? handle = null,Object? displayName = null,}) {
  return _then(ReelAuthor(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,handle: null == handle ? _self.handle : handle // ignore: cast_nullable_to_non_nullable
as String,displayName: null == displayName ? _self.displayName : displayName // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [ReelAuthor].
extension ReelAuthorPatterns on ReelAuthor {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReelAuthor value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReelAuthor() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReelAuthor value)  $default,){
final _that = this;
switch (_that) {
case _ReelAuthor():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReelAuthor value)?  $default,){
final _that = this;
switch (_that) {
case _ReelAuthor() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String handle,  String displayName)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReelAuthor() when $default != null:
return $default(_that.id,_that.handle,_that.displayName);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String handle,  String displayName)  $default,) {final _that = this;
switch (_that) {
case _ReelAuthor():
return $default(_that.id,_that.handle,_that.displayName);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String handle,  String displayName)?  $default,) {final _that = this;
switch (_that) {
case _ReelAuthor() when $default != null:
return $default(_that.id,_that.handle,_that.displayName);case _:
  return null;

}
}

}

/// @nodoc


class _ReelAuthor implements ReelAuthor {
  const _ReelAuthor({required this.id, required this.handle, required this.displayName});
  

@override final  String id;
@override final  String handle;
@override final  String displayName;

/// Create a copy of ReelAuthor
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReelAuthorCopyWith<_ReelAuthor> get copyWith => __$ReelAuthorCopyWithImpl<_ReelAuthor>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReelAuthor&&(identical(other.id, id) || other.id == id)&&(identical(other.handle, handle) || other.handle == handle)&&(identical(other.displayName, displayName) || other.displayName == displayName));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,handle,displayName);
}

@override
String toString() {
    return 'ReelAuthor(id: $id, handle: $handle, displayName: $displayName)';
}


}

/// @nodoc
abstract mixin class _$ReelAuthorCopyWith<$Res> implements $ReelAuthorCopyWith<$Res> {
  factory _$ReelAuthorCopyWith(_ReelAuthor value, $Res Function(_ReelAuthor) _then) = __$ReelAuthorCopyWithImpl;
@override @useResult
$Res call({
 String id, String handle, String displayName
});




}
/// @nodoc
class __$ReelAuthorCopyWithImpl<$Res>
    implements _$ReelAuthorCopyWith<$Res> {
  __$ReelAuthorCopyWithImpl(this._self, this._then);

  final _ReelAuthor _self;
  final $Res Function(_ReelAuthor) _then;

/// Create a copy of ReelAuthor
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? handle = null,Object? displayName = null,}) {
  return _then(_ReelAuthor(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,handle: null == handle ? _self.handle : handle // ignore: cast_nullable_to_non_nullable
as String,displayName: null == displayName ? _self.displayName : displayName // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc
mixin _$ReelCastMember {

 String get name; String? get imageUrl;
/// Create a copy of ReelCastMember
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelCastMemberCopyWith<ReelCastMember> get copyWith => _$ReelCastMemberCopyWithImpl<ReelCastMember>(this as ReelCastMember, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as ReelCastMember;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelCastMember&&(identical(other.name, _this.name) || other.name == _this.name)&&(identical(other.imageUrl, _this.imageUrl) || other.imageUrl == _this.imageUrl));
}


@override
int get hashCode {
  final _this = this as ReelCastMember;
  return Object.hash(runtimeType,_this.name,_this.imageUrl);
}

@override
String toString() {
  final _this = this as ReelCastMember;
  return 'ReelCastMember(name: ${_this.name}, imageUrl: ${_this.imageUrl})';
}


}

/// @nodoc
abstract mixin class $ReelCastMemberCopyWith<$Res>  {
  factory $ReelCastMemberCopyWith(ReelCastMember value, $Res Function(ReelCastMember) _then) = _$ReelCastMemberCopyWithImpl;
@useResult
$Res call({
 String name, String? imageUrl
});




}
/// @nodoc
class _$ReelCastMemberCopyWithImpl<$Res>
    implements $ReelCastMemberCopyWith<$Res> {
  _$ReelCastMemberCopyWithImpl(this._self, this._then);

  final ReelCastMember _self;
  final $Res Function(ReelCastMember) _then;

/// Create a copy of ReelCastMember
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? name = null,Object? imageUrl = freezed,}) {
  return _then(ReelCastMember(
name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [ReelCastMember].
extension ReelCastMemberPatterns on ReelCastMember {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReelCastMember value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReelCastMember() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReelCastMember value)  $default,){
final _that = this;
switch (_that) {
case _ReelCastMember():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReelCastMember value)?  $default,){
final _that = this;
switch (_that) {
case _ReelCastMember() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String name,  String? imageUrl)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReelCastMember() when $default != null:
return $default(_that.name,_that.imageUrl);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String name,  String? imageUrl)  $default,) {final _that = this;
switch (_that) {
case _ReelCastMember():
return $default(_that.name,_that.imageUrl);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String name,  String? imageUrl)?  $default,) {final _that = this;
switch (_that) {
case _ReelCastMember() when $default != null:
return $default(_that.name,_that.imageUrl);case _:
  return null;

}
}

}

/// @nodoc


class _ReelCastMember implements ReelCastMember {
  const _ReelCastMember({required this.name, this.imageUrl});
  

@override final  String name;
@override final  String? imageUrl;

/// Create a copy of ReelCastMember
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReelCastMemberCopyWith<_ReelCastMember> get copyWith => __$ReelCastMemberCopyWithImpl<_ReelCastMember>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReelCastMember&&(identical(other.name, name) || other.name == name)&&(identical(other.imageUrl, imageUrl) || other.imageUrl == imageUrl));
}


@override
int get hashCode {
    return Object.hash(runtimeType,name,imageUrl);
}

@override
String toString() {
    return 'ReelCastMember(name: $name, imageUrl: $imageUrl)';
}


}

/// @nodoc
abstract mixin class _$ReelCastMemberCopyWith<$Res> implements $ReelCastMemberCopyWith<$Res> {
  factory _$ReelCastMemberCopyWith(_ReelCastMember value, $Res Function(_ReelCastMember) _then) = __$ReelCastMemberCopyWithImpl;
@override @useResult
$Res call({
 String name, String? imageUrl
});




}
/// @nodoc
class __$ReelCastMemberCopyWithImpl<$Res>
    implements _$ReelCastMemberCopyWith<$Res> {
  __$ReelCastMemberCopyWithImpl(this._self, this._then);

  final _ReelCastMember _self;
  final $Res Function(_ReelCastMember) _then;

/// Create a copy of ReelCastMember
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? name = null,Object? imageUrl = freezed,}) {
  return _then(_ReelCastMember(
name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,imageUrl: freezed == imageUrl ? _self.imageUrl : imageUrl // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

/// @nodoc
mixin _$ReelStreamingService {

 String get id; String get name; String get logoUrl;
/// Create a copy of ReelStreamingService
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelStreamingServiceCopyWith<ReelStreamingService> get copyWith => _$ReelStreamingServiceCopyWithImpl<ReelStreamingService>(this as ReelStreamingService, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as ReelStreamingService;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is ReelStreamingService&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.name, _this.name) || other.name == _this.name)&&(identical(other.logoUrl, _this.logoUrl) || other.logoUrl == _this.logoUrl));
}


@override
int get hashCode {
  final _this = this as ReelStreamingService;
  return Object.hash(runtimeType,_this.id,_this.name,_this.logoUrl);
}

@override
String toString() {
  final _this = this as ReelStreamingService;
  return 'ReelStreamingService(id: ${_this.id}, name: ${_this.name}, logoUrl: ${_this.logoUrl})';
}


}

/// @nodoc
abstract mixin class $ReelStreamingServiceCopyWith<$Res>  {
  factory $ReelStreamingServiceCopyWith(ReelStreamingService value, $Res Function(ReelStreamingService) _then) = _$ReelStreamingServiceCopyWithImpl;
@useResult
$Res call({
 String id, String name, String logoUrl
});




}
/// @nodoc
class _$ReelStreamingServiceCopyWithImpl<$Res>
    implements $ReelStreamingServiceCopyWith<$Res> {
  _$ReelStreamingServiceCopyWithImpl(this._self, this._then);

  final ReelStreamingService _self;
  final $Res Function(ReelStreamingService) _then;

/// Create a copy of ReelStreamingService
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? name = null,Object? logoUrl = null,}) {
  return _then(ReelStreamingService(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,logoUrl: null == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [ReelStreamingService].
extension ReelStreamingServicePatterns on ReelStreamingService {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _ReelStreamingService value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _ReelStreamingService() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _ReelStreamingService value)  $default,){
final _that = this;
switch (_that) {
case _ReelStreamingService():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _ReelStreamingService value)?  $default,){
final _that = this;
switch (_that) {
case _ReelStreamingService() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String name,  String logoUrl)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _ReelStreamingService() when $default != null:
return $default(_that.id,_that.name,_that.logoUrl);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String name,  String logoUrl)  $default,) {final _that = this;
switch (_that) {
case _ReelStreamingService():
return $default(_that.id,_that.name,_that.logoUrl);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String name,  String logoUrl)?  $default,) {final _that = this;
switch (_that) {
case _ReelStreamingService() when $default != null:
return $default(_that.id,_that.name,_that.logoUrl);case _:
  return null;

}
}

}

/// @nodoc


class _ReelStreamingService implements ReelStreamingService {
  const _ReelStreamingService({required this.id, required this.name, required this.logoUrl});
  

@override final  String id;
@override final  String name;
@override final  String logoUrl;

/// Create a copy of ReelStreamingService
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReelStreamingServiceCopyWith<_ReelStreamingService> get copyWith => __$ReelStreamingServiceCopyWithImpl<_ReelStreamingService>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _ReelStreamingService&&(identical(other.id, id) || other.id == id)&&(identical(other.name, name) || other.name == name)&&(identical(other.logoUrl, logoUrl) || other.logoUrl == logoUrl));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,name,logoUrl);
}

@override
String toString() {
    return 'ReelStreamingService(id: $id, name: $name, logoUrl: $logoUrl)';
}


}

/// @nodoc
abstract mixin class _$ReelStreamingServiceCopyWith<$Res> implements $ReelStreamingServiceCopyWith<$Res> {
  factory _$ReelStreamingServiceCopyWith(_ReelStreamingService value, $Res Function(_ReelStreamingService) _then) = __$ReelStreamingServiceCopyWithImpl;
@override @useResult
$Res call({
 String id, String name, String logoUrl
});




}
/// @nodoc
class __$ReelStreamingServiceCopyWithImpl<$Res>
    implements _$ReelStreamingServiceCopyWith<$Res> {
  __$ReelStreamingServiceCopyWithImpl(this._self, this._then);

  final _ReelStreamingService _self;
  final $Res Function(_ReelStreamingService) _then;

/// Create a copy of ReelStreamingService
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? name = null,Object? logoUrl = null,}) {
  return _then(_ReelStreamingService(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,name: null == name ? _self.name : name // ignore: cast_nullable_to_non_nullable
as String,logoUrl: null == logoUrl ? _self.logoUrl : logoUrl // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

/// @nodoc
mixin _$Reel {

 String get id; String get masterUri; String get title; String get caption; ReelAuthor get author; int get likeCount; int get commentCount; int get shareCount; int get durationMs; ReelPlayback get playback; List<String> get genres; String? get thumbnailUrl; bool get isExclusive; int? get unlockCost; String? get preview; String? get castAndCrew;/// The details sheet's paragraph, longer than [caption].
 String? get synopsis; List<ReelCastMember> get cast; List<ReelStreamingService> get streamingOn;
/// Create a copy of Reel
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$ReelCopyWith<Reel> get copyWith => _$ReelCopyWithImpl<Reel>(this as Reel, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as Reel;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Reel&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.masterUri, _this.masterUri) || other.masterUri == _this.masterUri)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.caption, _this.caption) || other.caption == _this.caption)&&(identical(other.author, _this.author) || other.author == _this.author)&&(identical(other.likeCount, _this.likeCount) || other.likeCount == _this.likeCount)&&(identical(other.commentCount, _this.commentCount) || other.commentCount == _this.commentCount)&&(identical(other.shareCount, _this.shareCount) || other.shareCount == _this.shareCount)&&(identical(other.durationMs, _this.durationMs) || other.durationMs == _this.durationMs)&&(identical(other.playback, _this.playback) || other.playback == _this.playback)&&const DeepCollectionEquality().equals(other.genres, _this.genres)&&(identical(other.thumbnailUrl, _this.thumbnailUrl) || other.thumbnailUrl == _this.thumbnailUrl)&&(identical(other.isExclusive, _this.isExclusive) || other.isExclusive == _this.isExclusive)&&(identical(other.unlockCost, _this.unlockCost) || other.unlockCost == _this.unlockCost)&&(identical(other.preview, _this.preview) || other.preview == _this.preview)&&(identical(other.castAndCrew, _this.castAndCrew) || other.castAndCrew == _this.castAndCrew)&&(identical(other.synopsis, _this.synopsis) || other.synopsis == _this.synopsis)&&const DeepCollectionEquality().equals(other.cast, _this.cast)&&const DeepCollectionEquality().equals(other.streamingOn, _this.streamingOn));
}


@override
int get hashCode {
  final _this = this as Reel;
  return Object.hashAll([runtimeType,_this.id,_this.masterUri,_this.title,_this.caption,_this.author,_this.likeCount,_this.commentCount,_this.shareCount,_this.durationMs,_this.playback,const DeepCollectionEquality().hash(_this.genres),_this.thumbnailUrl,_this.isExclusive,_this.unlockCost,_this.preview,_this.castAndCrew,_this.synopsis,const DeepCollectionEquality().hash(_this.cast),const DeepCollectionEquality().hash(_this.streamingOn)]);
}

@override
String toString() {
  final _this = this as Reel;
  return 'Reel(id: ${_this.id}, masterUri: ${_this.masterUri}, title: ${_this.title}, caption: ${_this.caption}, author: ${_this.author}, likeCount: ${_this.likeCount}, commentCount: ${_this.commentCount}, shareCount: ${_this.shareCount}, durationMs: ${_this.durationMs}, playback: ${_this.playback}, genres: ${_this.genres}, thumbnailUrl: ${_this.thumbnailUrl}, isExclusive: ${_this.isExclusive}, unlockCost: ${_this.unlockCost}, preview: ${_this.preview}, castAndCrew: ${_this.castAndCrew}, synopsis: ${_this.synopsis}, cast: ${_this.cast}, streamingOn: ${_this.streamingOn})';
}


}

/// @nodoc
abstract mixin class $ReelCopyWith<$Res>  {
  factory $ReelCopyWith(Reel value, $Res Function(Reel) _then) = _$ReelCopyWithImpl;
@useResult
$Res call({
 String id, String masterUri, String title, String caption, ReelAuthor author, int likeCount, int commentCount, int shareCount, int durationMs, ReelPlayback playback, List<String> genres, String? thumbnailUrl, bool isExclusive, int? unlockCost, String? preview, String? castAndCrew, String? synopsis, List<ReelCastMember> cast, List<ReelStreamingService> streamingOn
});


$ReelAuthorCopyWith<$Res> get author;$ReelPlaybackCopyWith<$Res> get playback;

}
/// @nodoc
class _$ReelCopyWithImpl<$Res>
    implements $ReelCopyWith<$Res> {
  _$ReelCopyWithImpl(this._self, this._then);

  final Reel _self;
  final $Res Function(Reel) _then;

/// Create a copy of Reel
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? masterUri = null,Object? title = null,Object? caption = null,Object? author = null,Object? likeCount = null,Object? commentCount = null,Object? shareCount = null,Object? durationMs = null,Object? playback = null,Object? genres = null,Object? thumbnailUrl = freezed,Object? isExclusive = null,Object? unlockCost = freezed,Object? preview = freezed,Object? castAndCrew = freezed,Object? synopsis = freezed,Object? cast = null,Object? streamingOn = null,}) {
  return _then(Reel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,masterUri: null == masterUri ? _self.masterUri : masterUri // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,caption: null == caption ? _self.caption : caption // ignore: cast_nullable_to_non_nullable
as String,author: null == author ? _self.author : author // ignore: cast_nullable_to_non_nullable
as ReelAuthor,likeCount: null == likeCount ? _self.likeCount : likeCount // ignore: cast_nullable_to_non_nullable
as int,commentCount: null == commentCount ? _self.commentCount : commentCount // ignore: cast_nullable_to_non_nullable
as int,shareCount: null == shareCount ? _self.shareCount : shareCount // ignore: cast_nullable_to_non_nullable
as int,durationMs: null == durationMs ? _self.durationMs : durationMs // ignore: cast_nullable_to_non_nullable
as int,playback: null == playback ? _self.playback : playback // ignore: cast_nullable_to_non_nullable
as ReelPlayback,genres: null == genres ? _self.genres : genres // ignore: cast_nullable_to_non_nullable
as List<String>,thumbnailUrl: freezed == thumbnailUrl ? _self.thumbnailUrl : thumbnailUrl // ignore: cast_nullable_to_non_nullable
as String?,isExclusive: null == isExclusive ? _self.isExclusive : isExclusive // ignore: cast_nullable_to_non_nullable
as bool,unlockCost: freezed == unlockCost ? _self.unlockCost : unlockCost // ignore: cast_nullable_to_non_nullable
as int?,preview: freezed == preview ? _self.preview : preview // ignore: cast_nullable_to_non_nullable
as String?,castAndCrew: freezed == castAndCrew ? _self.castAndCrew : castAndCrew // ignore: cast_nullable_to_non_nullable
as String?,synopsis: freezed == synopsis ? _self.synopsis : synopsis // ignore: cast_nullable_to_non_nullable
as String?,cast: null == cast ? _self.cast : cast // ignore: cast_nullable_to_non_nullable
as List<ReelCastMember>,streamingOn: null == streamingOn ? _self.streamingOn : streamingOn // ignore: cast_nullable_to_non_nullable
as List<ReelStreamingService>,
  ));
}
/// Create a copy of Reel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelAuthorCopyWith<$Res> get author {
  
  return $ReelAuthorCopyWith<$Res>(_self.author, (value) {
    return _then(_self.copyWith(author: value));
  });
}/// Create a copy of Reel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelPlaybackCopyWith<$Res> get playback {
  
  return $ReelPlaybackCopyWith<$Res>(_self.playback, (value) {
    return _then(_self.copyWith(playback: value));
  });
}
}


/// Adds pattern-matching-related methods to [Reel].
extension ReelPatterns on Reel {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Reel value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Reel() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Reel value)  $default,){
final _that = this;
switch (_that) {
case _Reel():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Reel value)?  $default,){
final _that = this;
switch (_that) {
case _Reel() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String masterUri,  String title,  String caption,  ReelAuthor author,  int likeCount,  int commentCount,  int shareCount,  int durationMs,  ReelPlayback playback,  List<String> genres,  String? thumbnailUrl,  bool isExclusive,  int? unlockCost,  String? preview,  String? castAndCrew,  String? synopsis,  List<ReelCastMember> cast,  List<ReelStreamingService> streamingOn)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Reel() when $default != null:
return $default(_that.id,_that.masterUri,_that.title,_that.caption,_that.author,_that.likeCount,_that.commentCount,_that.shareCount,_that.durationMs,_that.playback,_that.genres,_that.thumbnailUrl,_that.isExclusive,_that.unlockCost,_that.preview,_that.castAndCrew,_that.synopsis,_that.cast,_that.streamingOn);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String masterUri,  String title,  String caption,  ReelAuthor author,  int likeCount,  int commentCount,  int shareCount,  int durationMs,  ReelPlayback playback,  List<String> genres,  String? thumbnailUrl,  bool isExclusive,  int? unlockCost,  String? preview,  String? castAndCrew,  String? synopsis,  List<ReelCastMember> cast,  List<ReelStreamingService> streamingOn)  $default,) {final _that = this;
switch (_that) {
case _Reel():
return $default(_that.id,_that.masterUri,_that.title,_that.caption,_that.author,_that.likeCount,_that.commentCount,_that.shareCount,_that.durationMs,_that.playback,_that.genres,_that.thumbnailUrl,_that.isExclusive,_that.unlockCost,_that.preview,_that.castAndCrew,_that.synopsis,_that.cast,_that.streamingOn);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String masterUri,  String title,  String caption,  ReelAuthor author,  int likeCount,  int commentCount,  int shareCount,  int durationMs,  ReelPlayback playback,  List<String> genres,  String? thumbnailUrl,  bool isExclusive,  int? unlockCost,  String? preview,  String? castAndCrew,  String? synopsis,  List<ReelCastMember> cast,  List<ReelStreamingService> streamingOn)?  $default,) {final _that = this;
switch (_that) {
case _Reel() when $default != null:
return $default(_that.id,_that.masterUri,_that.title,_that.caption,_that.author,_that.likeCount,_that.commentCount,_that.shareCount,_that.durationMs,_that.playback,_that.genres,_that.thumbnailUrl,_that.isExclusive,_that.unlockCost,_that.preview,_that.castAndCrew,_that.synopsis,_that.cast,_that.streamingOn);case _:
  return null;

}
}

}

/// @nodoc


class _Reel implements Reel {
  const _Reel({required this.id, required this.masterUri, required this.title, required this.caption, required this.author, required this.likeCount, required this.commentCount, required this.shareCount, required this.durationMs, required this.playback, required  List<String> genres, this.thumbnailUrl, this.isExclusive = false, this.unlockCost, this.preview, this.castAndCrew, this.synopsis,  List<ReelCastMember> cast = const [],  List<ReelStreamingService> streamingOn = const []}): _genres = genres,_cast = cast,_streamingOn = streamingOn;
  

@override final  String id;
@override final  String masterUri;
@override final  String title;
@override final  String caption;
@override final  ReelAuthor author;
@override final  int likeCount;
@override final  int commentCount;
@override final  int shareCount;
@override final  int durationMs;
@override final  ReelPlayback playback;
 final  List<String> _genres;
@override List<String> get genres {
  if (_genres is EqualUnmodifiableListView) return _genres;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_genres);
}

@override final  String? thumbnailUrl;
@override@JsonKey() final  bool isExclusive;
@override final  int? unlockCost;
@override final  String? preview;
@override final  String? castAndCrew;
/// The details sheet's paragraph, longer than [caption].
@override final  String? synopsis;
 final  List<ReelCastMember> _cast;
@override@JsonKey() List<ReelCastMember> get cast {
  if (_cast is EqualUnmodifiableListView) return _cast;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_cast);
}

 final  List<ReelStreamingService> _streamingOn;
@override@JsonKey() List<ReelStreamingService> get streamingOn {
  if (_streamingOn is EqualUnmodifiableListView) return _streamingOn;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_streamingOn);
}


/// Create a copy of Reel
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$ReelCopyWith<_Reel> get copyWith => __$ReelCopyWithImpl<_Reel>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _Reel&&(identical(other.id, id) || other.id == id)&&(identical(other.masterUri, masterUri) || other.masterUri == masterUri)&&(identical(other.title, title) || other.title == title)&&(identical(other.caption, caption) || other.caption == caption)&&(identical(other.author, author) || other.author == author)&&(identical(other.likeCount, likeCount) || other.likeCount == likeCount)&&(identical(other.commentCount, commentCount) || other.commentCount == commentCount)&&(identical(other.shareCount, shareCount) || other.shareCount == shareCount)&&(identical(other.durationMs, durationMs) || other.durationMs == durationMs)&&(identical(other.playback, playback) || other.playback == playback)&&const DeepCollectionEquality().equals(other.genres, _genres)&&(identical(other.thumbnailUrl, thumbnailUrl) || other.thumbnailUrl == thumbnailUrl)&&(identical(other.isExclusive, isExclusive) || other.isExclusive == isExclusive)&&(identical(other.unlockCost, unlockCost) || other.unlockCost == unlockCost)&&(identical(other.preview, preview) || other.preview == preview)&&(identical(other.castAndCrew, castAndCrew) || other.castAndCrew == castAndCrew)&&(identical(other.synopsis, synopsis) || other.synopsis == synopsis)&&const DeepCollectionEquality().equals(other.cast, _cast)&&const DeepCollectionEquality().equals(other.streamingOn, _streamingOn));
}


@override
int get hashCode {
    return Object.hashAll([runtimeType,id,masterUri,title,caption,author,likeCount,commentCount,shareCount,durationMs,playback,const DeepCollectionEquality().hash(_genres),thumbnailUrl,isExclusive,unlockCost,preview,castAndCrew,synopsis,const DeepCollectionEquality().hash(_cast),const DeepCollectionEquality().hash(_streamingOn)]);
}

@override
String toString() {
    return 'Reel(id: $id, masterUri: $masterUri, title: $title, caption: $caption, author: $author, likeCount: $likeCount, commentCount: $commentCount, shareCount: $shareCount, durationMs: $durationMs, playback: $playback, genres: $genres, thumbnailUrl: $thumbnailUrl, isExclusive: $isExclusive, unlockCost: $unlockCost, preview: $preview, castAndCrew: $castAndCrew, synopsis: $synopsis, cast: $cast, streamingOn: $streamingOn)';
}


}

/// @nodoc
abstract mixin class _$ReelCopyWith<$Res> implements $ReelCopyWith<$Res> {
  factory _$ReelCopyWith(_Reel value, $Res Function(_Reel) _then) = __$ReelCopyWithImpl;
@override @useResult
$Res call({
 String id, String masterUri, String title, String caption, ReelAuthor author, int likeCount, int commentCount, int shareCount, int durationMs, ReelPlayback playback, List<String> genres, String? thumbnailUrl, bool isExclusive, int? unlockCost, String? preview, String? castAndCrew, String? synopsis, List<ReelCastMember> cast, List<ReelStreamingService> streamingOn
});


@override $ReelAuthorCopyWith<$Res> get author;@override $ReelPlaybackCopyWith<$Res> get playback;

}
/// @nodoc
class __$ReelCopyWithImpl<$Res>
    implements _$ReelCopyWith<$Res> {
  __$ReelCopyWithImpl(this._self, this._then);

  final _Reel _self;
  final $Res Function(_Reel) _then;

/// Create a copy of Reel
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? masterUri = null,Object? title = null,Object? caption = null,Object? author = null,Object? likeCount = null,Object? commentCount = null,Object? shareCount = null,Object? durationMs = null,Object? playback = null,Object? genres = null,Object? thumbnailUrl = freezed,Object? isExclusive = null,Object? unlockCost = freezed,Object? preview = freezed,Object? castAndCrew = freezed,Object? synopsis = freezed,Object? cast = null,Object? streamingOn = null,}) {
  return _then(_Reel(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,masterUri: null == masterUri ? _self.masterUri : masterUri // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,caption: null == caption ? _self.caption : caption // ignore: cast_nullable_to_non_nullable
as String,author: null == author ? _self.author : author // ignore: cast_nullable_to_non_nullable
as ReelAuthor,likeCount: null == likeCount ? _self.likeCount : likeCount // ignore: cast_nullable_to_non_nullable
as int,commentCount: null == commentCount ? _self.commentCount : commentCount // ignore: cast_nullable_to_non_nullable
as int,shareCount: null == shareCount ? _self.shareCount : shareCount // ignore: cast_nullable_to_non_nullable
as int,durationMs: null == durationMs ? _self.durationMs : durationMs // ignore: cast_nullable_to_non_nullable
as int,playback: null == playback ? _self.playback : playback // ignore: cast_nullable_to_non_nullable
as ReelPlayback,genres: null == genres ? _self._genres : genres // ignore: cast_nullable_to_non_nullable
as List<String>,thumbnailUrl: freezed == thumbnailUrl ? _self.thumbnailUrl : thumbnailUrl // ignore: cast_nullable_to_non_nullable
as String?,isExclusive: null == isExclusive ? _self.isExclusive : isExclusive // ignore: cast_nullable_to_non_nullable
as bool,unlockCost: freezed == unlockCost ? _self.unlockCost : unlockCost // ignore: cast_nullable_to_non_nullable
as int?,preview: freezed == preview ? _self.preview : preview // ignore: cast_nullable_to_non_nullable
as String?,castAndCrew: freezed == castAndCrew ? _self.castAndCrew : castAndCrew // ignore: cast_nullable_to_non_nullable
as String?,synopsis: freezed == synopsis ? _self.synopsis : synopsis // ignore: cast_nullable_to_non_nullable
as String?,cast: null == cast ? _self._cast : cast // ignore: cast_nullable_to_non_nullable
as List<ReelCastMember>,streamingOn: null == streamingOn ? _self._streamingOn : streamingOn // ignore: cast_nullable_to_non_nullable
as List<ReelStreamingService>,
  ));
}

/// Create a copy of Reel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelAuthorCopyWith<$Res> get author {
  
  return $ReelAuthorCopyWith<$Res>(_self.author, (value) {
    return _then(_self.copyWith(author: value));
  });
}/// Create a copy of Reel
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$ReelPlaybackCopyWith<$Res> get playback {
  
  return $ReelPlaybackCopyWith<$Res>(_self.playback, (value) {
    return _then(_self.copyWith(playback: value));
  });
}
}

// dart format on
