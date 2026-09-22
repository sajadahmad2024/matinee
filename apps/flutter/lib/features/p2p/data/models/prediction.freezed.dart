// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'prediction.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$Prediction {

 String get id; String get title; String get question; String get imageAsset; int get points; int get multiplier;/// The yes share of votes cast. The no share is derived, so the two always
/// add to a hundred.
 int get yesPercent; int get turnoutPercent; Duration get closesIn; PredictionStatus get status;/// Null until the user votes, which is what turns the CTA into a receipt.
 PredictionSide? get vote;
/// Create a copy of Prediction
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PredictionCopyWith<Prediction> get copyWith => _$PredictionCopyWithImpl<Prediction>(this as Prediction, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as Prediction;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Prediction&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.question, _this.question) || other.question == _this.question)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset)&&(identical(other.points, _this.points) || other.points == _this.points)&&(identical(other.multiplier, _this.multiplier) || other.multiplier == _this.multiplier)&&(identical(other.yesPercent, _this.yesPercent) || other.yesPercent == _this.yesPercent)&&(identical(other.turnoutPercent, _this.turnoutPercent) || other.turnoutPercent == _this.turnoutPercent)&&(identical(other.closesIn, _this.closesIn) || other.closesIn == _this.closesIn)&&(identical(other.status, _this.status) || other.status == _this.status)&&(identical(other.vote, _this.vote) || other.vote == _this.vote));
}


@override
int get hashCode {
  final _this = this as Prediction;
  return Object.hash(runtimeType,_this.id,_this.title,_this.question,_this.imageAsset,_this.points,_this.multiplier,_this.yesPercent,_this.turnoutPercent,_this.closesIn,_this.status,_this.vote);
}

@override
String toString() {
  final _this = this as Prediction;
  return 'Prediction(id: ${_this.id}, title: ${_this.title}, question: ${_this.question}, imageAsset: ${_this.imageAsset}, points: ${_this.points}, multiplier: ${_this.multiplier}, yesPercent: ${_this.yesPercent}, turnoutPercent: ${_this.turnoutPercent}, closesIn: ${_this.closesIn}, status: ${_this.status}, vote: ${_this.vote})';
}


}

/// @nodoc
abstract mixin class $PredictionCopyWith<$Res>  {
  factory $PredictionCopyWith(Prediction value, $Res Function(Prediction) _then) = _$PredictionCopyWithImpl;
@useResult
$Res call({
 String id, String title, String question, String imageAsset, int points, int multiplier, int yesPercent, int turnoutPercent, Duration closesIn, PredictionStatus status, PredictionSide? vote
});




}
/// @nodoc
class _$PredictionCopyWithImpl<$Res>
    implements $PredictionCopyWith<$Res> {
  _$PredictionCopyWithImpl(this._self, this._then);

  final Prediction _self;
  final $Res Function(Prediction) _then;

/// Create a copy of Prediction
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? question = null,Object? imageAsset = null,Object? points = null,Object? multiplier = null,Object? yesPercent = null,Object? turnoutPercent = null,Object? closesIn = null,Object? status = null,Object? vote = freezed,}) {
  return _then(Prediction(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,question: null == question ? _self.question : question // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,multiplier: null == multiplier ? _self.multiplier : multiplier // ignore: cast_nullable_to_non_nullable
as int,yesPercent: null == yesPercent ? _self.yesPercent : yesPercent // ignore: cast_nullable_to_non_nullable
as int,turnoutPercent: null == turnoutPercent ? _self.turnoutPercent : turnoutPercent // ignore: cast_nullable_to_non_nullable
as int,closesIn: null == closesIn ? _self.closesIn : closesIn // ignore: cast_nullable_to_non_nullable
as Duration,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as PredictionStatus,vote: freezed == vote ? _self.vote : vote // ignore: cast_nullable_to_non_nullable
as PredictionSide?,
  ));
}

}


/// Adds pattern-matching-related methods to [Prediction].
extension PredictionPatterns on Prediction {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Prediction value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Prediction() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Prediction value)  $default,){
final _that = this;
switch (_that) {
case _Prediction():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Prediction value)?  $default,){
final _that = this;
switch (_that) {
case _Prediction() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String question,  String imageAsset,  int points,  int multiplier,  int yesPercent,  int turnoutPercent,  Duration closesIn,  PredictionStatus status,  PredictionSide? vote)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Prediction() when $default != null:
return $default(_that.id,_that.title,_that.question,_that.imageAsset,_that.points,_that.multiplier,_that.yesPercent,_that.turnoutPercent,_that.closesIn,_that.status,_that.vote);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String question,  String imageAsset,  int points,  int multiplier,  int yesPercent,  int turnoutPercent,  Duration closesIn,  PredictionStatus status,  PredictionSide? vote)  $default,) {final _that = this;
switch (_that) {
case _Prediction():
return $default(_that.id,_that.title,_that.question,_that.imageAsset,_that.points,_that.multiplier,_that.yesPercent,_that.turnoutPercent,_that.closesIn,_that.status,_that.vote);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String question,  String imageAsset,  int points,  int multiplier,  int yesPercent,  int turnoutPercent,  Duration closesIn,  PredictionStatus status,  PredictionSide? vote)?  $default,) {final _that = this;
switch (_that) {
case _Prediction() when $default != null:
return $default(_that.id,_that.title,_that.question,_that.imageAsset,_that.points,_that.multiplier,_that.yesPercent,_that.turnoutPercent,_that.closesIn,_that.status,_that.vote);case _:
  return null;

}
}

}

/// @nodoc


class _Prediction implements Prediction {
  const _Prediction({required this.id, required this.title, required this.question, required this.imageAsset, required this.points, required this.multiplier, required this.yesPercent, required this.turnoutPercent, required this.closesIn, required this.status, this.vote});
  

@override final  String id;
@override final  String title;
@override final  String question;
@override final  String imageAsset;
@override final  int points;
@override final  int multiplier;
/// The yes share of votes cast. The no share is derived, so the two always
/// add to a hundred.
@override final  int yesPercent;
@override final  int turnoutPercent;
@override final  Duration closesIn;
@override final  PredictionStatus status;
/// Null until the user votes, which is what turns the CTA into a receipt.
@override final  PredictionSide? vote;

/// Create a copy of Prediction
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PredictionCopyWith<_Prediction> get copyWith => __$PredictionCopyWithImpl<_Prediction>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _Prediction&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.question, question) || other.question == question)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset)&&(identical(other.points, points) || other.points == points)&&(identical(other.multiplier, multiplier) || other.multiplier == multiplier)&&(identical(other.yesPercent, yesPercent) || other.yesPercent == yesPercent)&&(identical(other.turnoutPercent, turnoutPercent) || other.turnoutPercent == turnoutPercent)&&(identical(other.closesIn, closesIn) || other.closesIn == closesIn)&&(identical(other.status, status) || other.status == status)&&(identical(other.vote, vote) || other.vote == vote));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,title,question,imageAsset,points,multiplier,yesPercent,turnoutPercent,closesIn,status,vote);
}

@override
String toString() {
    return 'Prediction(id: $id, title: $title, question: $question, imageAsset: $imageAsset, points: $points, multiplier: $multiplier, yesPercent: $yesPercent, turnoutPercent: $turnoutPercent, closesIn: $closesIn, status: $status, vote: $vote)';
}


}

/// @nodoc
abstract mixin class _$PredictionCopyWith<$Res> implements $PredictionCopyWith<$Res> {
  factory _$PredictionCopyWith(_Prediction value, $Res Function(_Prediction) _then) = __$PredictionCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String question, String imageAsset, int points, int multiplier, int yesPercent, int turnoutPercent, Duration closesIn, PredictionStatus status, PredictionSide? vote
});




}
/// @nodoc
class __$PredictionCopyWithImpl<$Res>
    implements _$PredictionCopyWith<$Res> {
  __$PredictionCopyWithImpl(this._self, this._then);

  final _Prediction _self;
  final $Res Function(_Prediction) _then;

/// Create a copy of Prediction
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? question = null,Object? imageAsset = null,Object? points = null,Object? multiplier = null,Object? yesPercent = null,Object? turnoutPercent = null,Object? closesIn = null,Object? status = null,Object? vote = freezed,}) {
  return _then(_Prediction(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,question: null == question ? _self.question : question // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,multiplier: null == multiplier ? _self.multiplier : multiplier // ignore: cast_nullable_to_non_nullable
as int,yesPercent: null == yesPercent ? _self.yesPercent : yesPercent // ignore: cast_nullable_to_non_nullable
as int,turnoutPercent: null == turnoutPercent ? _self.turnoutPercent : turnoutPercent // ignore: cast_nullable_to_non_nullable
as int,closesIn: null == closesIn ? _self.closesIn : closesIn // ignore: cast_nullable_to_non_nullable
as Duration,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as PredictionStatus,vote: freezed == vote ? _self.vote : vote // ignore: cast_nullable_to_non_nullable
as PredictionSide?,
  ));
}


}

// dart format on
