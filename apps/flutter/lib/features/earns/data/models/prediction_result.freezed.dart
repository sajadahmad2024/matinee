// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'prediction_result.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$PredictionResult {

 String get id; String get title; String get question; DateTime get settledOn; PredictionVote get vote; PredictionVote get outcome; int get pointsAwarded;/// The stake the game ran at; the design shows it only where there was one.
 int? get multiplier; String? get badgeAwarded;
/// Create a copy of PredictionResult
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PredictionResultCopyWith<PredictionResult> get copyWith => _$PredictionResultCopyWithImpl<PredictionResult>(this as PredictionResult, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as PredictionResult;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PredictionResult&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.question, _this.question) || other.question == _this.question)&&(identical(other.settledOn, _this.settledOn) || other.settledOn == _this.settledOn)&&(identical(other.vote, _this.vote) || other.vote == _this.vote)&&(identical(other.outcome, _this.outcome) || other.outcome == _this.outcome)&&(identical(other.pointsAwarded, _this.pointsAwarded) || other.pointsAwarded == _this.pointsAwarded)&&(identical(other.multiplier, _this.multiplier) || other.multiplier == _this.multiplier)&&(identical(other.badgeAwarded, _this.badgeAwarded) || other.badgeAwarded == _this.badgeAwarded));
}


@override
int get hashCode {
  final _this = this as PredictionResult;
  return Object.hash(runtimeType,_this.id,_this.title,_this.question,_this.settledOn,_this.vote,_this.outcome,_this.pointsAwarded,_this.multiplier,_this.badgeAwarded);
}

@override
String toString() {
  final _this = this as PredictionResult;
  return 'PredictionResult(id: ${_this.id}, title: ${_this.title}, question: ${_this.question}, settledOn: ${_this.settledOn}, vote: ${_this.vote}, outcome: ${_this.outcome}, pointsAwarded: ${_this.pointsAwarded}, multiplier: ${_this.multiplier}, badgeAwarded: ${_this.badgeAwarded})';
}


}

/// @nodoc
abstract mixin class $PredictionResultCopyWith<$Res>  {
  factory $PredictionResultCopyWith(PredictionResult value, $Res Function(PredictionResult) _then) = _$PredictionResultCopyWithImpl;
@useResult
$Res call({
 String id, String title, String question, DateTime settledOn, PredictionVote vote, PredictionVote outcome, int pointsAwarded, int? multiplier, String? badgeAwarded
});




}
/// @nodoc
class _$PredictionResultCopyWithImpl<$Res>
    implements $PredictionResultCopyWith<$Res> {
  _$PredictionResultCopyWithImpl(this._self, this._then);

  final PredictionResult _self;
  final $Res Function(PredictionResult) _then;

/// Create a copy of PredictionResult
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? question = null,Object? settledOn = null,Object? vote = null,Object? outcome = null,Object? pointsAwarded = null,Object? multiplier = freezed,Object? badgeAwarded = freezed,}) {
  return _then(PredictionResult(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,question: null == question ? _self.question : question // ignore: cast_nullable_to_non_nullable
as String,settledOn: null == settledOn ? _self.settledOn : settledOn // ignore: cast_nullable_to_non_nullable
as DateTime,vote: null == vote ? _self.vote : vote // ignore: cast_nullable_to_non_nullable
as PredictionVote,outcome: null == outcome ? _self.outcome : outcome // ignore: cast_nullable_to_non_nullable
as PredictionVote,pointsAwarded: null == pointsAwarded ? _self.pointsAwarded : pointsAwarded // ignore: cast_nullable_to_non_nullable
as int,multiplier: freezed == multiplier ? _self.multiplier : multiplier // ignore: cast_nullable_to_non_nullable
as int?,badgeAwarded: freezed == badgeAwarded ? _self.badgeAwarded : badgeAwarded // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}

}


/// Adds pattern-matching-related methods to [PredictionResult].
extension PredictionResultPatterns on PredictionResult {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PredictionResult value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PredictionResult() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PredictionResult value)  $default,){
final _that = this;
switch (_that) {
case _PredictionResult():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PredictionResult value)?  $default,){
final _that = this;
switch (_that) {
case _PredictionResult() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String question,  DateTime settledOn,  PredictionVote vote,  PredictionVote outcome,  int pointsAwarded,  int? multiplier,  String? badgeAwarded)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PredictionResult() when $default != null:
return $default(_that.id,_that.title,_that.question,_that.settledOn,_that.vote,_that.outcome,_that.pointsAwarded,_that.multiplier,_that.badgeAwarded);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String question,  DateTime settledOn,  PredictionVote vote,  PredictionVote outcome,  int pointsAwarded,  int? multiplier,  String? badgeAwarded)  $default,) {final _that = this;
switch (_that) {
case _PredictionResult():
return $default(_that.id,_that.title,_that.question,_that.settledOn,_that.vote,_that.outcome,_that.pointsAwarded,_that.multiplier,_that.badgeAwarded);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String question,  DateTime settledOn,  PredictionVote vote,  PredictionVote outcome,  int pointsAwarded,  int? multiplier,  String? badgeAwarded)?  $default,) {final _that = this;
switch (_that) {
case _PredictionResult() when $default != null:
return $default(_that.id,_that.title,_that.question,_that.settledOn,_that.vote,_that.outcome,_that.pointsAwarded,_that.multiplier,_that.badgeAwarded);case _:
  return null;

}
}

}

/// @nodoc


class _PredictionResult implements PredictionResult {
  const _PredictionResult({required this.id, required this.title, required this.question, required this.settledOn, required this.vote, required this.outcome, required this.pointsAwarded, this.multiplier, this.badgeAwarded});
  

@override final  String id;
@override final  String title;
@override final  String question;
@override final  DateTime settledOn;
@override final  PredictionVote vote;
@override final  PredictionVote outcome;
@override final  int pointsAwarded;
/// The stake the game ran at; the design shows it only where there was one.
@override final  int? multiplier;
@override final  String? badgeAwarded;

/// Create a copy of PredictionResult
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PredictionResultCopyWith<_PredictionResult> get copyWith => __$PredictionResultCopyWithImpl<_PredictionResult>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _PredictionResult&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.question, question) || other.question == question)&&(identical(other.settledOn, settledOn) || other.settledOn == settledOn)&&(identical(other.vote, vote) || other.vote == vote)&&(identical(other.outcome, outcome) || other.outcome == outcome)&&(identical(other.pointsAwarded, pointsAwarded) || other.pointsAwarded == pointsAwarded)&&(identical(other.multiplier, multiplier) || other.multiplier == multiplier)&&(identical(other.badgeAwarded, badgeAwarded) || other.badgeAwarded == badgeAwarded));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,title,question,settledOn,vote,outcome,pointsAwarded,multiplier,badgeAwarded);
}

@override
String toString() {
    return 'PredictionResult(id: $id, title: $title, question: $question, settledOn: $settledOn, vote: $vote, outcome: $outcome, pointsAwarded: $pointsAwarded, multiplier: $multiplier, badgeAwarded: $badgeAwarded)';
}


}

/// @nodoc
abstract mixin class _$PredictionResultCopyWith<$Res> implements $PredictionResultCopyWith<$Res> {
  factory _$PredictionResultCopyWith(_PredictionResult value, $Res Function(_PredictionResult) _then) = __$PredictionResultCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String question, DateTime settledOn, PredictionVote vote, PredictionVote outcome, int pointsAwarded, int? multiplier, String? badgeAwarded
});




}
/// @nodoc
class __$PredictionResultCopyWithImpl<$Res>
    implements _$PredictionResultCopyWith<$Res> {
  __$PredictionResultCopyWithImpl(this._self, this._then);

  final _PredictionResult _self;
  final $Res Function(_PredictionResult) _then;

/// Create a copy of PredictionResult
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? question = null,Object? settledOn = null,Object? vote = null,Object? outcome = null,Object? pointsAwarded = null,Object? multiplier = freezed,Object? badgeAwarded = freezed,}) {
  return _then(_PredictionResult(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,question: null == question ? _self.question : question // ignore: cast_nullable_to_non_nullable
as String,settledOn: null == settledOn ? _self.settledOn : settledOn // ignore: cast_nullable_to_non_nullable
as DateTime,vote: null == vote ? _self.vote : vote // ignore: cast_nullable_to_non_nullable
as PredictionVote,outcome: null == outcome ? _self.outcome : outcome // ignore: cast_nullable_to_non_nullable
as PredictionVote,pointsAwarded: null == pointsAwarded ? _self.pointsAwarded : pointsAwarded // ignore: cast_nullable_to_non_nullable
as int,multiplier: freezed == multiplier ? _self.multiplier : multiplier // ignore: cast_nullable_to_non_nullable
as int?,badgeAwarded: freezed == badgeAwarded ? _self.badgeAwarded : badgeAwarded // ignore: cast_nullable_to_non_nullable
as String?,
  ));
}


}

// dart format on
