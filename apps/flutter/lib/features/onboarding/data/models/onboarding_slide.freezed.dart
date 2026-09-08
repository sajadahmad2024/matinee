// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'onboarding_slide.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$OnboardingSlide {

 String get imageAsset; String get eyebrow; String get heading; String get body; String get statValue; String get statCaption; List<OnboardingHighlight> get highlights;
/// Create a copy of OnboardingSlide
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OnboardingSlideCopyWith<OnboardingSlide> get copyWith => _$OnboardingSlideCopyWithImpl<OnboardingSlide>(this as OnboardingSlide, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as OnboardingSlide;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OnboardingSlide&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset)&&(identical(other.eyebrow, _this.eyebrow) || other.eyebrow == _this.eyebrow)&&(identical(other.heading, _this.heading) || other.heading == _this.heading)&&(identical(other.body, _this.body) || other.body == _this.body)&&(identical(other.statValue, _this.statValue) || other.statValue == _this.statValue)&&(identical(other.statCaption, _this.statCaption) || other.statCaption == _this.statCaption)&&const DeepCollectionEquality().equals(other.highlights, _this.highlights));
}


@override
int get hashCode {
  final _this = this as OnboardingSlide;
  return Object.hash(runtimeType,_this.imageAsset,_this.eyebrow,_this.heading,_this.body,_this.statValue,_this.statCaption,const DeepCollectionEquality().hash(_this.highlights));
}

@override
String toString() {
  final _this = this as OnboardingSlide;
  return 'OnboardingSlide(imageAsset: ${_this.imageAsset}, eyebrow: ${_this.eyebrow}, heading: ${_this.heading}, body: ${_this.body}, statValue: ${_this.statValue}, statCaption: ${_this.statCaption}, highlights: ${_this.highlights})';
}


}

/// @nodoc
abstract mixin class $OnboardingSlideCopyWith<$Res>  {
  factory $OnboardingSlideCopyWith(OnboardingSlide value, $Res Function(OnboardingSlide) _then) = _$OnboardingSlideCopyWithImpl;
@useResult
$Res call({
 String imageAsset, String eyebrow, String heading, String body, String statValue, String statCaption, List<OnboardingHighlight> highlights
});




}
/// @nodoc
class _$OnboardingSlideCopyWithImpl<$Res>
    implements $OnboardingSlideCopyWith<$Res> {
  _$OnboardingSlideCopyWithImpl(this._self, this._then);

  final OnboardingSlide _self;
  final $Res Function(OnboardingSlide) _then;

/// Create a copy of OnboardingSlide
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? imageAsset = null,Object? eyebrow = null,Object? heading = null,Object? body = null,Object? statValue = null,Object? statCaption = null,Object? highlights = null,}) {
  return _then(OnboardingSlide(
imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,eyebrow: null == eyebrow ? _self.eyebrow : eyebrow // ignore: cast_nullable_to_non_nullable
as String,heading: null == heading ? _self.heading : heading // ignore: cast_nullable_to_non_nullable
as String,body: null == body ? _self.body : body // ignore: cast_nullable_to_non_nullable
as String,statValue: null == statValue ? _self.statValue : statValue // ignore: cast_nullable_to_non_nullable
as String,statCaption: null == statCaption ? _self.statCaption : statCaption // ignore: cast_nullable_to_non_nullable
as String,highlights: null == highlights ? _self.highlights : highlights // ignore: cast_nullable_to_non_nullable
as List<OnboardingHighlight>,
  ));
}

}


/// Adds pattern-matching-related methods to [OnboardingSlide].
extension OnboardingSlidePatterns on OnboardingSlide {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OnboardingSlide value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OnboardingSlide() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OnboardingSlide value)  $default,){
final _that = this;
switch (_that) {
case _OnboardingSlide():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OnboardingSlide value)?  $default,){
final _that = this;
switch (_that) {
case _OnboardingSlide() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String imageAsset,  String eyebrow,  String heading,  String body,  String statValue,  String statCaption,  List<OnboardingHighlight> highlights)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OnboardingSlide() when $default != null:
return $default(_that.imageAsset,_that.eyebrow,_that.heading,_that.body,_that.statValue,_that.statCaption,_that.highlights);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String imageAsset,  String eyebrow,  String heading,  String body,  String statValue,  String statCaption,  List<OnboardingHighlight> highlights)  $default,) {final _that = this;
switch (_that) {
case _OnboardingSlide():
return $default(_that.imageAsset,_that.eyebrow,_that.heading,_that.body,_that.statValue,_that.statCaption,_that.highlights);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String imageAsset,  String eyebrow,  String heading,  String body,  String statValue,  String statCaption,  List<OnboardingHighlight> highlights)?  $default,) {final _that = this;
switch (_that) {
case _OnboardingSlide() when $default != null:
return $default(_that.imageAsset,_that.eyebrow,_that.heading,_that.body,_that.statValue,_that.statCaption,_that.highlights);case _:
  return null;

}
}

}

/// @nodoc


class _OnboardingSlide implements OnboardingSlide {
  const _OnboardingSlide({required this.imageAsset, required this.eyebrow, required this.heading, required this.body, required this.statValue, required this.statCaption, required  List<OnboardingHighlight> highlights}): _highlights = highlights;
  

@override final  String imageAsset;
@override final  String eyebrow;
@override final  String heading;
@override final  String body;
@override final  String statValue;
@override final  String statCaption;
 final  List<OnboardingHighlight> _highlights;
@override List<OnboardingHighlight> get highlights {
  if (_highlights is EqualUnmodifiableListView) return _highlights;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_highlights);
}


/// Create a copy of OnboardingSlide
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OnboardingSlideCopyWith<_OnboardingSlide> get copyWith => __$OnboardingSlideCopyWithImpl<_OnboardingSlide>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _OnboardingSlide&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset)&&(identical(other.eyebrow, eyebrow) || other.eyebrow == eyebrow)&&(identical(other.heading, heading) || other.heading == heading)&&(identical(other.body, body) || other.body == body)&&(identical(other.statValue, statValue) || other.statValue == statValue)&&(identical(other.statCaption, statCaption) || other.statCaption == statCaption)&&const DeepCollectionEquality().equals(other.highlights, _highlights));
}


@override
int get hashCode {
    return Object.hash(runtimeType,imageAsset,eyebrow,heading,body,statValue,statCaption,const DeepCollectionEquality().hash(_highlights));
}

@override
String toString() {
    return 'OnboardingSlide(imageAsset: $imageAsset, eyebrow: $eyebrow, heading: $heading, body: $body, statValue: $statValue, statCaption: $statCaption, highlights: $highlights)';
}


}

/// @nodoc
abstract mixin class _$OnboardingSlideCopyWith<$Res> implements $OnboardingSlideCopyWith<$Res> {
  factory _$OnboardingSlideCopyWith(_OnboardingSlide value, $Res Function(_OnboardingSlide) _then) = __$OnboardingSlideCopyWithImpl;
@override @useResult
$Res call({
 String imageAsset, String eyebrow, String heading, String body, String statValue, String statCaption, List<OnboardingHighlight> highlights
});




}
/// @nodoc
class __$OnboardingSlideCopyWithImpl<$Res>
    implements _$OnboardingSlideCopyWith<$Res> {
  __$OnboardingSlideCopyWithImpl(this._self, this._then);

  final _OnboardingSlide _self;
  final $Res Function(_OnboardingSlide) _then;

/// Create a copy of OnboardingSlide
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? imageAsset = null,Object? eyebrow = null,Object? heading = null,Object? body = null,Object? statValue = null,Object? statCaption = null,Object? highlights = null,}) {
  return _then(_OnboardingSlide(
imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,eyebrow: null == eyebrow ? _self.eyebrow : eyebrow // ignore: cast_nullable_to_non_nullable
as String,heading: null == heading ? _self.heading : heading // ignore: cast_nullable_to_non_nullable
as String,body: null == body ? _self.body : body // ignore: cast_nullable_to_non_nullable
as String,statValue: null == statValue ? _self.statValue : statValue // ignore: cast_nullable_to_non_nullable
as String,statCaption: null == statCaption ? _self.statCaption : statCaption // ignore: cast_nullable_to_non_nullable
as String,highlights: null == highlights ? _self._highlights : highlights // ignore: cast_nullable_to_non_nullable
as List<OnboardingHighlight>,
  ));
}


}

/// @nodoc
mixin _$OnboardingHighlight {

 String get emoji; String get label;
/// Create a copy of OnboardingHighlight
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$OnboardingHighlightCopyWith<OnboardingHighlight> get copyWith => _$OnboardingHighlightCopyWithImpl<OnboardingHighlight>(this as OnboardingHighlight, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as OnboardingHighlight;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is OnboardingHighlight&&(identical(other.emoji, _this.emoji) || other.emoji == _this.emoji)&&(identical(other.label, _this.label) || other.label == _this.label));
}


@override
int get hashCode {
  final _this = this as OnboardingHighlight;
  return Object.hash(runtimeType,_this.emoji,_this.label);
}

@override
String toString() {
  final _this = this as OnboardingHighlight;
  return 'OnboardingHighlight(emoji: ${_this.emoji}, label: ${_this.label})';
}


}

/// @nodoc
abstract mixin class $OnboardingHighlightCopyWith<$Res>  {
  factory $OnboardingHighlightCopyWith(OnboardingHighlight value, $Res Function(OnboardingHighlight) _then) = _$OnboardingHighlightCopyWithImpl;
@useResult
$Res call({
 String emoji, String label
});




}
/// @nodoc
class _$OnboardingHighlightCopyWithImpl<$Res>
    implements $OnboardingHighlightCopyWith<$Res> {
  _$OnboardingHighlightCopyWithImpl(this._self, this._then);

  final OnboardingHighlight _self;
  final $Res Function(OnboardingHighlight) _then;

/// Create a copy of OnboardingHighlight
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? emoji = null,Object? label = null,}) {
  return _then(OnboardingHighlight(
emoji: null == emoji ? _self.emoji : emoji // ignore: cast_nullable_to_non_nullable
as String,label: null == label ? _self.label : label // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [OnboardingHighlight].
extension OnboardingHighlightPatterns on OnboardingHighlight {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _OnboardingHighlight value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _OnboardingHighlight() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _OnboardingHighlight value)  $default,){
final _that = this;
switch (_that) {
case _OnboardingHighlight():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _OnboardingHighlight value)?  $default,){
final _that = this;
switch (_that) {
case _OnboardingHighlight() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String emoji,  String label)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _OnboardingHighlight() when $default != null:
return $default(_that.emoji,_that.label);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String emoji,  String label)  $default,) {final _that = this;
switch (_that) {
case _OnboardingHighlight():
return $default(_that.emoji,_that.label);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String emoji,  String label)?  $default,) {final _that = this;
switch (_that) {
case _OnboardingHighlight() when $default != null:
return $default(_that.emoji,_that.label);case _:
  return null;

}
}

}

/// @nodoc


class _OnboardingHighlight implements OnboardingHighlight {
  const _OnboardingHighlight({required this.emoji, required this.label});
  

@override final  String emoji;
@override final  String label;

/// Create a copy of OnboardingHighlight
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$OnboardingHighlightCopyWith<_OnboardingHighlight> get copyWith => __$OnboardingHighlightCopyWithImpl<_OnboardingHighlight>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _OnboardingHighlight&&(identical(other.emoji, emoji) || other.emoji == emoji)&&(identical(other.label, label) || other.label == label));
}


@override
int get hashCode {
    return Object.hash(runtimeType,emoji,label);
}

@override
String toString() {
    return 'OnboardingHighlight(emoji: $emoji, label: $label)';
}


}

/// @nodoc
abstract mixin class _$OnboardingHighlightCopyWith<$Res> implements $OnboardingHighlightCopyWith<$Res> {
  factory _$OnboardingHighlightCopyWith(_OnboardingHighlight value, $Res Function(_OnboardingHighlight) _then) = __$OnboardingHighlightCopyWithImpl;
@override @useResult
$Res call({
 String emoji, String label
});




}
/// @nodoc
class __$OnboardingHighlightCopyWithImpl<$Res>
    implements _$OnboardingHighlightCopyWith<$Res> {
  __$OnboardingHighlightCopyWithImpl(this._self, this._then);

  final _OnboardingHighlight _self;
  final $Res Function(_OnboardingHighlight) _then;

/// Create a copy of OnboardingHighlight
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? emoji = null,Object? label = null,}) {
  return _then(_OnboardingHighlight(
emoji: null == emoji ? _self.emoji : emoji // ignore: cast_nullable_to_non_nullable
as String,label: null == label ? _self.label : label // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
