// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'p2p_overview.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$P2pOverview {

 int get rank; int get rankGainThisWeek; int get streakPoints; int get bestStreakDays; PointsStanding get standing; List<P2pGame> get games;
/// Create a copy of P2pOverview
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$P2pOverviewCopyWith<P2pOverview> get copyWith => _$P2pOverviewCopyWithImpl<P2pOverview>(this as P2pOverview, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as P2pOverview;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is P2pOverview&&(identical(other.rank, _this.rank) || other.rank == _this.rank)&&(identical(other.rankGainThisWeek, _this.rankGainThisWeek) || other.rankGainThisWeek == _this.rankGainThisWeek)&&(identical(other.streakPoints, _this.streakPoints) || other.streakPoints == _this.streakPoints)&&(identical(other.bestStreakDays, _this.bestStreakDays) || other.bestStreakDays == _this.bestStreakDays)&&(identical(other.standing, _this.standing) || other.standing == _this.standing)&&const DeepCollectionEquality().equals(other.games, _this.games));
}


@override
int get hashCode {
  final _this = this as P2pOverview;
  return Object.hash(runtimeType,_this.rank,_this.rankGainThisWeek,_this.streakPoints,_this.bestStreakDays,_this.standing,const DeepCollectionEquality().hash(_this.games));
}

@override
String toString() {
  final _this = this as P2pOverview;
  return 'P2pOverview(rank: ${_this.rank}, rankGainThisWeek: ${_this.rankGainThisWeek}, streakPoints: ${_this.streakPoints}, bestStreakDays: ${_this.bestStreakDays}, standing: ${_this.standing}, games: ${_this.games})';
}


}

/// @nodoc
abstract mixin class $P2pOverviewCopyWith<$Res>  {
  factory $P2pOverviewCopyWith(P2pOverview value, $Res Function(P2pOverview) _then) = _$P2pOverviewCopyWithImpl;
@useResult
$Res call({
 int rank, int rankGainThisWeek, int streakPoints, int bestStreakDays, PointsStanding standing, List<P2pGame> games
});


$PointsStandingCopyWith<$Res> get standing;

}
/// @nodoc
class _$P2pOverviewCopyWithImpl<$Res>
    implements $P2pOverviewCopyWith<$Res> {
  _$P2pOverviewCopyWithImpl(this._self, this._then);

  final P2pOverview _self;
  final $Res Function(P2pOverview) _then;

/// Create a copy of P2pOverview
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? rank = null,Object? rankGainThisWeek = null,Object? streakPoints = null,Object? bestStreakDays = null,Object? standing = null,Object? games = null,}) {
  return _then(P2pOverview(
rank: null == rank ? _self.rank : rank // ignore: cast_nullable_to_non_nullable
as int,rankGainThisWeek: null == rankGainThisWeek ? _self.rankGainThisWeek : rankGainThisWeek // ignore: cast_nullable_to_non_nullable
as int,streakPoints: null == streakPoints ? _self.streakPoints : streakPoints // ignore: cast_nullable_to_non_nullable
as int,bestStreakDays: null == bestStreakDays ? _self.bestStreakDays : bestStreakDays // ignore: cast_nullable_to_non_nullable
as int,standing: null == standing ? _self.standing : standing // ignore: cast_nullable_to_non_nullable
as PointsStanding,games: null == games ? _self.games : games // ignore: cast_nullable_to_non_nullable
as List<P2pGame>,
  ));
}
/// Create a copy of P2pOverview
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PointsStandingCopyWith<$Res> get standing {
  
  return $PointsStandingCopyWith<$Res>(_self.standing, (value) {
    return _then(_self.copyWith(standing: value));
  });
}
}


/// Adds pattern-matching-related methods to [P2pOverview].
extension P2pOverviewPatterns on P2pOverview {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _P2pOverview value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _P2pOverview() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _P2pOverview value)  $default,){
final _that = this;
switch (_that) {
case _P2pOverview():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _P2pOverview value)?  $default,){
final _that = this;
switch (_that) {
case _P2pOverview() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( int rank,  int rankGainThisWeek,  int streakPoints,  int bestStreakDays,  PointsStanding standing,  List<P2pGame> games)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _P2pOverview() when $default != null:
return $default(_that.rank,_that.rankGainThisWeek,_that.streakPoints,_that.bestStreakDays,_that.standing,_that.games);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( int rank,  int rankGainThisWeek,  int streakPoints,  int bestStreakDays,  PointsStanding standing,  List<P2pGame> games)  $default,) {final _that = this;
switch (_that) {
case _P2pOverview():
return $default(_that.rank,_that.rankGainThisWeek,_that.streakPoints,_that.bestStreakDays,_that.standing,_that.games);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( int rank,  int rankGainThisWeek,  int streakPoints,  int bestStreakDays,  PointsStanding standing,  List<P2pGame> games)?  $default,) {final _that = this;
switch (_that) {
case _P2pOverview() when $default != null:
return $default(_that.rank,_that.rankGainThisWeek,_that.streakPoints,_that.bestStreakDays,_that.standing,_that.games);case _:
  return null;

}
}

}

/// @nodoc


class _P2pOverview implements P2pOverview {
  const _P2pOverview({required this.rank, required this.rankGainThisWeek, required this.streakPoints, required this.bestStreakDays, required this.standing, required  List<P2pGame> games}): _games = games;
  

@override final  int rank;
@override final  int rankGainThisWeek;
@override final  int streakPoints;
@override final  int bestStreakDays;
@override final  PointsStanding standing;
 final  List<P2pGame> _games;
@override List<P2pGame> get games {
  if (_games is EqualUnmodifiableListView) return _games;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_games);
}


/// Create a copy of P2pOverview
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$P2pOverviewCopyWith<_P2pOverview> get copyWith => __$P2pOverviewCopyWithImpl<_P2pOverview>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _P2pOverview&&(identical(other.rank, rank) || other.rank == rank)&&(identical(other.rankGainThisWeek, rankGainThisWeek) || other.rankGainThisWeek == rankGainThisWeek)&&(identical(other.streakPoints, streakPoints) || other.streakPoints == streakPoints)&&(identical(other.bestStreakDays, bestStreakDays) || other.bestStreakDays == bestStreakDays)&&(identical(other.standing, standing) || other.standing == standing)&&const DeepCollectionEquality().equals(other.games, _games));
}


@override
int get hashCode {
    return Object.hash(runtimeType,rank,rankGainThisWeek,streakPoints,bestStreakDays,standing,const DeepCollectionEquality().hash(_games));
}

@override
String toString() {
    return 'P2pOverview(rank: $rank, rankGainThisWeek: $rankGainThisWeek, streakPoints: $streakPoints, bestStreakDays: $bestStreakDays, standing: $standing, games: $games)';
}


}

/// @nodoc
abstract mixin class _$P2pOverviewCopyWith<$Res> implements $P2pOverviewCopyWith<$Res> {
  factory _$P2pOverviewCopyWith(_P2pOverview value, $Res Function(_P2pOverview) _then) = __$P2pOverviewCopyWithImpl;
@override @useResult
$Res call({
 int rank, int rankGainThisWeek, int streakPoints, int bestStreakDays, PointsStanding standing, List<P2pGame> games
});


@override $PointsStandingCopyWith<$Res> get standing;

}
/// @nodoc
class __$P2pOverviewCopyWithImpl<$Res>
    implements _$P2pOverviewCopyWith<$Res> {
  __$P2pOverviewCopyWithImpl(this._self, this._then);

  final _P2pOverview _self;
  final $Res Function(_P2pOverview) _then;

/// Create a copy of P2pOverview
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? rank = null,Object? rankGainThisWeek = null,Object? streakPoints = null,Object? bestStreakDays = null,Object? standing = null,Object? games = null,}) {
  return _then(_P2pOverview(
rank: null == rank ? _self.rank : rank // ignore: cast_nullable_to_non_nullable
as int,rankGainThisWeek: null == rankGainThisWeek ? _self.rankGainThisWeek : rankGainThisWeek // ignore: cast_nullable_to_non_nullable
as int,streakPoints: null == streakPoints ? _self.streakPoints : streakPoints // ignore: cast_nullable_to_non_nullable
as int,bestStreakDays: null == bestStreakDays ? _self.bestStreakDays : bestStreakDays // ignore: cast_nullable_to_non_nullable
as int,standing: null == standing ? _self.standing : standing // ignore: cast_nullable_to_non_nullable
as PointsStanding,games: null == games ? _self._games : games // ignore: cast_nullable_to_non_nullable
as List<P2pGame>,
  ));
}

/// Create a copy of P2pOverview
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PointsStandingCopyWith<$Res> get standing {
  
  return $PointsStandingCopyWith<$Res>(_self.standing, (value) {
    return _then(_self.copyWith(standing: value));
  });
}
}

/// @nodoc
mixin _$P2pGame {

 P2pGameKind get kind; String get category; String get title; String get subtitle; String get imageAsset;
/// Create a copy of P2pGame
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$P2pGameCopyWith<P2pGame> get copyWith => _$P2pGameCopyWithImpl<P2pGame>(this as P2pGame, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as P2pGame;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is P2pGame&&(identical(other.kind, _this.kind) || other.kind == _this.kind)&&(identical(other.category, _this.category) || other.category == _this.category)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.subtitle, _this.subtitle) || other.subtitle == _this.subtitle)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset));
}


@override
int get hashCode {
  final _this = this as P2pGame;
  return Object.hash(runtimeType,_this.kind,_this.category,_this.title,_this.subtitle,_this.imageAsset);
}

@override
String toString() {
  final _this = this as P2pGame;
  return 'P2pGame(kind: ${_this.kind}, category: ${_this.category}, title: ${_this.title}, subtitle: ${_this.subtitle}, imageAsset: ${_this.imageAsset})';
}


}

/// @nodoc
abstract mixin class $P2pGameCopyWith<$Res>  {
  factory $P2pGameCopyWith(P2pGame value, $Res Function(P2pGame) _then) = _$P2pGameCopyWithImpl;
@useResult
$Res call({
 P2pGameKind kind, String category, String title, String subtitle, String imageAsset
});




}
/// @nodoc
class _$P2pGameCopyWithImpl<$Res>
    implements $P2pGameCopyWith<$Res> {
  _$P2pGameCopyWithImpl(this._self, this._then);

  final P2pGame _self;
  final $Res Function(P2pGame) _then;

/// Create a copy of P2pGame
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? kind = null,Object? category = null,Object? title = null,Object? subtitle = null,Object? imageAsset = null,}) {
  return _then(P2pGame(
kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as P2pGameKind,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,subtitle: null == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [P2pGame].
extension P2pGamePatterns on P2pGame {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _P2pGame value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _P2pGame() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _P2pGame value)  $default,){
final _that = this;
switch (_that) {
case _P2pGame():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _P2pGame value)?  $default,){
final _that = this;
switch (_that) {
case _P2pGame() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( P2pGameKind kind,  String category,  String title,  String subtitle,  String imageAsset)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _P2pGame() when $default != null:
return $default(_that.kind,_that.category,_that.title,_that.subtitle,_that.imageAsset);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( P2pGameKind kind,  String category,  String title,  String subtitle,  String imageAsset)  $default,) {final _that = this;
switch (_that) {
case _P2pGame():
return $default(_that.kind,_that.category,_that.title,_that.subtitle,_that.imageAsset);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( P2pGameKind kind,  String category,  String title,  String subtitle,  String imageAsset)?  $default,) {final _that = this;
switch (_that) {
case _P2pGame() when $default != null:
return $default(_that.kind,_that.category,_that.title,_that.subtitle,_that.imageAsset);case _:
  return null;

}
}

}

/// @nodoc


class _P2pGame implements P2pGame {
  const _P2pGame({required this.kind, required this.category, required this.title, required this.subtitle, required this.imageAsset});
  

@override final  P2pGameKind kind;
@override final  String category;
@override final  String title;
@override final  String subtitle;
@override final  String imageAsset;

/// Create a copy of P2pGame
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$P2pGameCopyWith<_P2pGame> get copyWith => __$P2pGameCopyWithImpl<_P2pGame>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _P2pGame&&(identical(other.kind, kind) || other.kind == kind)&&(identical(other.category, category) || other.category == category)&&(identical(other.title, title) || other.title == title)&&(identical(other.subtitle, subtitle) || other.subtitle == subtitle)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset));
}


@override
int get hashCode {
    return Object.hash(runtimeType,kind,category,title,subtitle,imageAsset);
}

@override
String toString() {
    return 'P2pGame(kind: $kind, category: $category, title: $title, subtitle: $subtitle, imageAsset: $imageAsset)';
}


}

/// @nodoc
abstract mixin class _$P2pGameCopyWith<$Res> implements $P2pGameCopyWith<$Res> {
  factory _$P2pGameCopyWith(_P2pGame value, $Res Function(_P2pGame) _then) = __$P2pGameCopyWithImpl;
@override @useResult
$Res call({
 P2pGameKind kind, String category, String title, String subtitle, String imageAsset
});




}
/// @nodoc
class __$P2pGameCopyWithImpl<$Res>
    implements _$P2pGameCopyWith<$Res> {
  __$P2pGameCopyWithImpl(this._self, this._then);

  final _P2pGame _self;
  final $Res Function(_P2pGame) _then;

/// Create a copy of P2pGame
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? kind = null,Object? category = null,Object? title = null,Object? subtitle = null,Object? imageAsset = null,}) {
  return _then(_P2pGame(
kind: null == kind ? _self.kind : kind // ignore: cast_nullable_to_non_nullable
as P2pGameKind,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,subtitle: null == subtitle ? _self.subtitle : subtitle // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
