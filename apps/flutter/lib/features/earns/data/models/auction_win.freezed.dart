// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auction_win.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$AuctionWin {

 String get id; AuctionLotKind get kind; String get title; String get imageAsset; DateTime get wonOn; int get winningBid; int get pointsAwarded;/// The badge the win unlocked, which the design shows as a gold chip.
 String? get badgeAwarded;
/// Create a copy of AuctionWin
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuctionWinCopyWith<AuctionWin> get copyWith => _$AuctionWinCopyWithImpl<AuctionWin>(this as AuctionWin, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as AuctionWin;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionWin&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.kind, _this.kind) || other.kind == _this.kind)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset)&&(identical(other.wonOn, _this.wonOn) || other.wonOn == _this.wonOn)&&(identical(other.winningBid, _this.winningBid) || other.winningBid == _this.winningBid)&&(identical(other.pointsAwarded, _this.pointsAwarded) || other.pointsAwarded == _this.pointsAwarded)&&(identical(other.badgeAwarded, _this.badgeAwarded) || other.badgeAwarded == _this.badgeAwarded));
}


@override
int get hashCode {
  final _this = this as AuctionWin;
  return Object.hash(runtimeType,_this.id,_this.kind,_this.title,_this.imageAsset,_this.wonOn,_this.winningBid,_this.pointsAwarded,_this.badgeAwarded);
}

@override
String toString() {
  final _this = this as AuctionWin;
  return 'AuctionWin(id: ${_this.id}, kind: ${_this.kind}, title: ${_this.title}, imageAsset: ${_this.imageAsset}, wonOn: ${_this.wonOn}, winningBid: ${_this.winningBid}, pointsAwarded: ${_this.pointsAwarded}, badgeAwarded: ${_this.badgeAwarded})';
}


}

/// @nodoc
abstract mixin class $AuctionWinCopyWith<$Res>  {
  factory $AuctionWinCopyWith(AuctionWin value, $Res Function(AuctionWin) _then) = _$AuctionWinCopyWithImpl;
@useResult
$Res call({
 String id, AuctionLotKind kind, String title, String imageAsset, DateTime wonOn, int winningBid, int pointsAwarded, String? badgeAwarded
});




}
/// @nodoc
class _$AuctionWinCopyWithImpl<$Res>
    implements $AuctionWinCopyWith<$Res> {
  _$AuctionWinCopyWithImpl(this._self, this._then);

  final AuctionWin _self;
  final $Res Function(AuctionWin) _then;

/// Create a copy of AuctionWin
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? kind = null,Object? title = null,Object? imageAsset = null,Object? wonOn = null,Object? winningBid = null,Object? pointsAwarded = null,Object? badgeAwarded = freezed,}) {
  return _then(AuctionWin(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as AuctionLotKind,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,wonOn: null == wonOn ? _self.wonOn : wonOn // ignore: cast_nullable_to_non_nullable
as DateTime,winningBid: null == winningBid ? _self.winningBid : winningBid // ignore: cast_nullable_to_non_nullable
as int,pointsAwarded: null == pointsAwarded ? _self.pointsAwarded : pointsAwarded // ignore: cast_nullable_to_non_nullable
as int,badgeAwarded: freezed == badgeAwarded ? _self.badgeAwarded : badgeAwarded // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [AuctionWin].
extension AuctionWinPatterns on AuctionWin {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuctionWin value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuctionWin() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuctionWin value)  $default,){
final _that = this;
switch (_that) {
case _AuctionWin():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuctionWin value)?  $default,){
final _that = this;
switch (_that) {
case _AuctionWin() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  AuctionLotKind kind,  String title,  String imageAsset,  DateTime wonOn,  int winningBid,  int pointsAwarded,  String? badgeAwarded)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuctionWin() when $default != null:
return $default(_that.id,_that.kind,_that.title,_that.imageAsset,_that.wonOn,_that.winningBid,_that.pointsAwarded,_that.badgeAwarded);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  AuctionLotKind kind,  String title,  String imageAsset,  DateTime wonOn,  int winningBid,  int pointsAwarded,  String? badgeAwarded)  $default,) {final _that = this;
switch (_that) {
case _AuctionWin():
return $default(_that.id,_that.kind,_that.title,_that.imageAsset,_that.wonOn,_that.winningBid,_that.pointsAwarded,_that.badgeAwarded);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  AuctionLotKind kind,  String title,  String imageAsset,  DateTime wonOn,  int winningBid,  int pointsAwarded,  String? badgeAwarded)?  $default,) {final _that = this;
switch (_that) {
case _AuctionWin() when $default != null:
return $default(_that.id,_that.kind,_that.title,_that.imageAsset,_that.wonOn,_that.winningBid,_that.pointsAwarded,_that.badgeAwarded);case _:
  return null;

}
}

}

/// @nodoc


class _AuctionWin implements AuctionWin {
  const _AuctionWin({required this.id, required this.kind, required this.title, required this.imageAsset, required this.wonOn, required this.winningBid, required this.pointsAwarded, this.badgeAwarded});
  

@override final  String id;
@override final  AuctionLotKind kind;
@override final  String title;
@override final  String imageAsset;
@override final  DateTime wonOn;
@override final  int winningBid;
@override final  int pointsAwarded;
/// The badge the win unlocked, which the design shows as a gold chip.
@override final  String? badgeAwarded;

/// Create a copy of AuctionWin
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuctionWinCopyWith<_AuctionWin> get copyWith => __$AuctionWinCopyWithImpl<_AuctionWin>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuctionWin&&(identical(other.id, id) || other.id == id)&&(identical(other.kind, kind) || other.kind == kind)&&(identical(other.title, title) || other.title == title)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset)&&(identical(other.wonOn, wonOn) || other.wonOn == wonOn)&&(identical(other.winningBid, winningBid) || other.winningBid == winningBid)&&(identical(other.pointsAwarded, pointsAwarded) || other.pointsAwarded == pointsAwarded)&&(identical(other.badgeAwarded, badgeAwarded) || other.badgeAwarded == badgeAwarded));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,kind,title,imageAsset,wonOn,winningBid,pointsAwarded,badgeAwarded);
}

@override
String toString() {
    return 'AuctionWin(id: $id, kind: $kind, title: $title, imageAsset: $imageAsset, wonOn: $wonOn, winningBid: $winningBid, pointsAwarded: $pointsAwarded, badgeAwarded: $badgeAwarded)';
}


}

/// @nodoc
abstract mixin class _$AuctionWinCopyWith<$Res> implements $AuctionWinCopyWith<$Res> {
  factory _$AuctionWinCopyWith(_AuctionWin value, $Res Function(_AuctionWin) _then) = __$AuctionWinCopyWithImpl;
@override @useResult
$Res call({
 String id, AuctionLotKind kind, String title, String imageAsset, DateTime wonOn, int winningBid, int pointsAwarded, String? badgeAwarded
});




}
/// @nodoc
class __$AuctionWinCopyWithImpl<$Res>
    implements _$AuctionWinCopyWith<$Res> {
  __$AuctionWinCopyWithImpl(this._self, this._then);

  final _AuctionWin _self;
  final $Res Function(_AuctionWin) _then;

/// Create a copy of AuctionWin
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? kind = null,Object? title = null,Object? imageAsset = null,Object? wonOn = null,Object? winningBid = null,Object? pointsAwarded = null,Object? badgeAwarded = freezed,}) {
  return _then(_AuctionWin(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as AuctionLotKind,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,wonOn: null == wonOn ? _self.wonOn : wonOn // ignore: cast_nullable_to_non_nullable
as DateTime,winningBid: null == winningBid ? _self.winningBid : winningBid // ignore: cast_nullable_to_non_nullable
as int,pointsAwarded: null == pointsAwarded ? _self.pointsAwarded : pointsAwarded // ignore: cast_nullable_to_non_nullable
as int,badgeAwarded: freezed == badgeAwarded ? _self.badgeAwarded : badgeAwarded // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
