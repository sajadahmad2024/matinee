// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'earn_detail.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$EarnDetail {

 int get pointsEarned;
/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EarnDetailCopyWith<EarnDetail> get copyWith => _$EarnDetailCopyWithImpl<EarnDetail>(this as EarnDetail, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as EarnDetail;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnDetail&&(identical(other.pointsEarned, _this.pointsEarned) || other.pointsEarned == _this.pointsEarned));
}


@override
int get hashCode {
  final _this = this as EarnDetail;
  return Object.hash(runtimeType,_this.pointsEarned);
}

@override
String toString() {
  final _this = this as EarnDetail;
  return 'EarnDetail(pointsEarned: ${_this.pointsEarned})';
}


}

/// @nodoc
abstract mixin class $EarnDetailCopyWith<$Res>  {
  factory $EarnDetailCopyWith(EarnDetail value, $Res Function(EarnDetail) _then) = _$EarnDetailCopyWithImpl;
@useResult
$Res call({
 int pointsEarned
});




}
/// @nodoc
class _$EarnDetailCopyWithImpl<$Res>
    implements $EarnDetailCopyWith<$Res> {
  _$EarnDetailCopyWithImpl(this._self, this._then);

  final EarnDetail _self;
  final $Res Function(EarnDetail) _then;

/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? pointsEarned = null,}) {
  return _then(_self.copyWith(
pointsEarned: null == pointsEarned ? _self.pointsEarned : pointsEarned // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

}


/// Adds pattern-matching-related methods to [EarnDetail].
extension EarnDetailPatterns on EarnDetail {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( StreakDetail value)?  streaks,TResult Function( AuctionDetail value)?  auction,TResult Function( PredictionDetail value)?  predictions,TResult Function( QuestDetail value)?  quests,required TResult orElse(),}){
final _that = this;
switch (_that) {
case StreakDetail() when streaks != null:
return streaks(_that);case AuctionDetail() when auction != null:
return auction(_that);case PredictionDetail() when predictions != null:
return predictions(_that);case QuestDetail() when quests != null:
return quests(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( StreakDetail value)  streaks,required TResult Function( AuctionDetail value)  auction,required TResult Function( PredictionDetail value)  predictions,required TResult Function( QuestDetail value)  quests,}){
final _that = this;
switch (_that) {
case StreakDetail():
return streaks(_that);case AuctionDetail():
return auction(_that);case PredictionDetail():
return predictions(_that);case QuestDetail():
return quests(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( StreakDetail value)?  streaks,TResult? Function( AuctionDetail value)?  auction,TResult? Function( PredictionDetail value)?  predictions,TResult? Function( QuestDetail value)?  quests,}){
final _that = this;
switch (_that) {
case StreakDetail() when streaks != null:
return streaks(_that);case AuctionDetail() when auction != null:
return auction(_that);case PredictionDetail() when predictions != null:
return predictions(_that);case QuestDetail() when quests != null:
return quests(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function( int pointsEarned,  List<StreakLevel> levels,  List<StreakDay> days)?  streaks,TResult Function( int pointsEarned,  List<AuctionWin> wins)?  auction,TResult Function( int pointsEarned,  List<PredictionResult> results)?  predictions,TResult Function( int pointsEarned,  List<QuestWeek> weeks)?  quests,required TResult orElse(),}) {final _that = this;
switch (_that) {
case StreakDetail() when streaks != null:
return streaks(_that.pointsEarned,_that.levels,_that.days);case AuctionDetail() when auction != null:
return auction(_that.pointsEarned,_that.wins);case PredictionDetail() when predictions != null:
return predictions(_that.pointsEarned,_that.results);case QuestDetail() when quests != null:
return quests(_that.pointsEarned,_that.weeks);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function( int pointsEarned,  List<StreakLevel> levels,  List<StreakDay> days)  streaks,required TResult Function( int pointsEarned,  List<AuctionWin> wins)  auction,required TResult Function( int pointsEarned,  List<PredictionResult> results)  predictions,required TResult Function( int pointsEarned,  List<QuestWeek> weeks)  quests,}) {final _that = this;
switch (_that) {
case StreakDetail():
return streaks(_that.pointsEarned,_that.levels,_that.days);case AuctionDetail():
return auction(_that.pointsEarned,_that.wins);case PredictionDetail():
return predictions(_that.pointsEarned,_that.results);case QuestDetail():
return quests(_that.pointsEarned,_that.weeks);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function( int pointsEarned,  List<StreakLevel> levels,  List<StreakDay> days)?  streaks,TResult? Function( int pointsEarned,  List<AuctionWin> wins)?  auction,TResult? Function( int pointsEarned,  List<PredictionResult> results)?  predictions,TResult? Function( int pointsEarned,  List<QuestWeek> weeks)?  quests,}) {final _that = this;
switch (_that) {
case StreakDetail() when streaks != null:
return streaks(_that.pointsEarned,_that.levels,_that.days);case AuctionDetail() when auction != null:
return auction(_that.pointsEarned,_that.wins);case PredictionDetail() when predictions != null:
return predictions(_that.pointsEarned,_that.results);case QuestDetail() when quests != null:
return quests(_that.pointsEarned,_that.weeks);case _:
  return null;

}
}

}

/// @nodoc


class StreakDetail implements EarnDetail {
  const StreakDetail({required this.pointsEarned, required  List<StreakLevel> levels, required  List<StreakDay> days}): _levels = levels,_days = days;
  

@override final  int pointsEarned;
 final  List<StreakLevel> _levels;
 List<StreakLevel> get levels {
  if (_levels is EqualUnmodifiableListView) return _levels;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_levels);
}

 final  List<StreakDay> _days;
 List<StreakDay> get days {
  if (_days is EqualUnmodifiableListView) return _days;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_days);
}


/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$StreakDetailCopyWith<StreakDetail> get copyWith => _$StreakDetailCopyWithImpl<StreakDetail>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is StreakDetail&&(identical(other.pointsEarned, pointsEarned) || other.pointsEarned == pointsEarned)&&const DeepCollectionEquality().equals(other.levels, _levels)&&const DeepCollectionEquality().equals(other.days, _days));
}


@override
int get hashCode {
    return Object.hash(runtimeType,pointsEarned,const DeepCollectionEquality().hash(_levels),const DeepCollectionEquality().hash(_days));
}

@override
String toString() {
    return 'EarnDetail.streaks(pointsEarned: $pointsEarned, levels: $levels, days: $days)';
}


}

/// @nodoc
abstract mixin class $StreakDetailCopyWith<$Res> implements $EarnDetailCopyWith<$Res> {
  factory $StreakDetailCopyWith(StreakDetail value, $Res Function(StreakDetail) _then) = _$StreakDetailCopyWithImpl;
@override @useResult
$Res call({
 int pointsEarned, List<StreakLevel> levels, List<StreakDay> days
});




}
/// @nodoc
class _$StreakDetailCopyWithImpl<$Res>
    implements $StreakDetailCopyWith<$Res> {
  _$StreakDetailCopyWithImpl(this._self, this._then);

  final StreakDetail _self;
  final $Res Function(StreakDetail) _then;

/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? pointsEarned = null,Object? levels = null,Object? days = null,}) {
  return _then(StreakDetail(
pointsEarned: null == pointsEarned ? _self.pointsEarned : pointsEarned // ignore: cast_nullable_to_non_nullable
as int,levels: null == levels ? _self._levels : levels // ignore: cast_nullable_to_non_nullable
as List<StreakLevel>,days: null == days ? _self._days : days // ignore: cast_nullable_to_non_nullable
as List<StreakDay>,
  ));
}


}

/// @nodoc


class AuctionDetail implements EarnDetail {
  const AuctionDetail({required this.pointsEarned, required  List<AuctionWin> wins}): _wins = wins;
  

@override final  int pointsEarned;
 final  List<AuctionWin> _wins;
 List<AuctionWin> get wins {
  if (_wins is EqualUnmodifiableListView) return _wins;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_wins);
}


/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuctionDetailCopyWith<AuctionDetail> get copyWith => _$AuctionDetailCopyWithImpl<AuctionDetail>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionDetail&&(identical(other.pointsEarned, pointsEarned) || other.pointsEarned == pointsEarned)&&const DeepCollectionEquality().equals(other.wins, _wins));
}


@override
int get hashCode {
    return Object.hash(runtimeType,pointsEarned,const DeepCollectionEquality().hash(_wins));
}

@override
String toString() {
    return 'EarnDetail.auction(pointsEarned: $pointsEarned, wins: $wins)';
}


}

/// @nodoc
abstract mixin class $AuctionDetailCopyWith<$Res> implements $EarnDetailCopyWith<$Res> {
  factory $AuctionDetailCopyWith(AuctionDetail value, $Res Function(AuctionDetail) _then) = _$AuctionDetailCopyWithImpl;
@override @useResult
$Res call({
 int pointsEarned, List<AuctionWin> wins
});




}
/// @nodoc
class _$AuctionDetailCopyWithImpl<$Res>
    implements $AuctionDetailCopyWith<$Res> {
  _$AuctionDetailCopyWithImpl(this._self, this._then);

  final AuctionDetail _self;
  final $Res Function(AuctionDetail) _then;

/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? pointsEarned = null,Object? wins = null,}) {
  return _then(AuctionDetail(
pointsEarned: null == pointsEarned ? _self.pointsEarned : pointsEarned // ignore: cast_nullable_to_non_nullable
as int,wins: null == wins ? _self._wins : wins // ignore: cast_nullable_to_non_nullable
as List<AuctionWin>,
  ));
}


}

/// @nodoc


class PredictionDetail implements EarnDetail {
  const PredictionDetail({required this.pointsEarned, required  List<PredictionResult> results}): _results = results;
  

@override final  int pointsEarned;
 final  List<PredictionResult> _results;
 List<PredictionResult> get results {
  if (_results is EqualUnmodifiableListView) return _results;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_results);
}


/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PredictionDetailCopyWith<PredictionDetail> get copyWith => _$PredictionDetailCopyWithImpl<PredictionDetail>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionDetail&&(identical(other.pointsEarned, pointsEarned) || other.pointsEarned == pointsEarned)&&const DeepCollectionEquality().equals(other.results, _results));
}


@override
int get hashCode {
    return Object.hash(runtimeType,pointsEarned,const DeepCollectionEquality().hash(_results));
}

@override
String toString() {
    return 'EarnDetail.predictions(pointsEarned: $pointsEarned, results: $results)';
}


}

/// @nodoc
abstract mixin class $PredictionDetailCopyWith<$Res> implements $EarnDetailCopyWith<$Res> {
  factory $PredictionDetailCopyWith(PredictionDetail value, $Res Function(PredictionDetail) _then) = _$PredictionDetailCopyWithImpl;
@override @useResult
$Res call({
 int pointsEarned, List<PredictionResult> results
});




}
/// @nodoc
class _$PredictionDetailCopyWithImpl<$Res>
    implements $PredictionDetailCopyWith<$Res> {
  _$PredictionDetailCopyWithImpl(this._self, this._then);

  final PredictionDetail _self;
  final $Res Function(PredictionDetail) _then;

/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? pointsEarned = null,Object? results = null,}) {
  return _then(PredictionDetail(
pointsEarned: null == pointsEarned ? _self.pointsEarned : pointsEarned // ignore: cast_nullable_to_non_nullable
as int,results: null == results ? _self._results : results // ignore: cast_nullable_to_non_nullable
as List<PredictionResult>,
  ));
}


}

/// @nodoc


class QuestDetail implements EarnDetail {
  const QuestDetail({required this.pointsEarned, required  List<QuestWeek> weeks}): _weeks = weeks;
  

@override final  int pointsEarned;
 final  List<QuestWeek> _weeks;
 List<QuestWeek> get weeks {
  if (_weeks is EqualUnmodifiableListView) return _weeks;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_weeks);
}


/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuestDetailCopyWith<QuestDetail> get copyWith => _$QuestDetailCopyWithImpl<QuestDetail>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is QuestDetail&&(identical(other.pointsEarned, pointsEarned) || other.pointsEarned == pointsEarned)&&const DeepCollectionEquality().equals(other.weeks, _weeks));
}


@override
int get hashCode {
    return Object.hash(runtimeType,pointsEarned,const DeepCollectionEquality().hash(_weeks));
}

@override
String toString() {
    return 'EarnDetail.quests(pointsEarned: $pointsEarned, weeks: $weeks)';
}


}

/// @nodoc
abstract mixin class $QuestDetailCopyWith<$Res> implements $EarnDetailCopyWith<$Res> {
  factory $QuestDetailCopyWith(QuestDetail value, $Res Function(QuestDetail) _then) = _$QuestDetailCopyWithImpl;
@override @useResult
$Res call({
 int pointsEarned, List<QuestWeek> weeks
});




}
/// @nodoc
class _$QuestDetailCopyWithImpl<$Res>
    implements $QuestDetailCopyWith<$Res> {
  _$QuestDetailCopyWithImpl(this._self, this._then);

  final QuestDetail _self;
  final $Res Function(QuestDetail) _then;

/// Create a copy of EarnDetail
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? pointsEarned = null,Object? weeks = null,}) {
  return _then(QuestDetail(
pointsEarned: null == pointsEarned ? _self.pointsEarned : pointsEarned // ignore: cast_nullable_to_non_nullable
as int,weeks: null == weeks ? _self._weeks : weeks // ignore: cast_nullable_to_non_nullable
as List<QuestWeek>,
  ));
}


}

// dart format on
