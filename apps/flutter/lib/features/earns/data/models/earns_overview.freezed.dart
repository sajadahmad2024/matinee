// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'earns_overview.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$EarnsOverview {

 PointsStanding get standing; List<EarnSource> get sources; List<EarnedBadge> get badges;
/// Create a copy of EarnsOverview
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$EarnsOverviewCopyWith<EarnsOverview> get copyWith => _$EarnsOverviewCopyWithImpl<EarnsOverview>(this as EarnsOverview, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as EarnsOverview;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is EarnsOverview&&(identical(other.standing, _this.standing) || other.standing == _this.standing)&&const DeepCollectionEquality().equals(other.sources, _this.sources)&&const DeepCollectionEquality().equals(other.badges, _this.badges));
}


@override
int get hashCode {
  final _this = this as EarnsOverview;
  return Object.hash(runtimeType,_this.standing,const DeepCollectionEquality().hash(_this.sources),const DeepCollectionEquality().hash(_this.badges));
}

@override
String toString() {
  final _this = this as EarnsOverview;
  return 'EarnsOverview(standing: ${_this.standing}, sources: ${_this.sources}, badges: ${_this.badges})';
}


}

/// @nodoc
abstract mixin class $EarnsOverviewCopyWith<$Res>  {
  factory $EarnsOverviewCopyWith(EarnsOverview value, $Res Function(EarnsOverview) _then) = _$EarnsOverviewCopyWithImpl;
@useResult
$Res call({
 PointsStanding standing, List<EarnSource> sources, List<EarnedBadge> badges
});


$PointsStandingCopyWith<$Res> get standing;

}
/// @nodoc
class _$EarnsOverviewCopyWithImpl<$Res>
    implements $EarnsOverviewCopyWith<$Res> {
  _$EarnsOverviewCopyWithImpl(this._self, this._then);

  final EarnsOverview _self;
  final $Res Function(EarnsOverview) _then;

/// Create a copy of EarnsOverview
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? standing = null,Object? sources = null,Object? badges = null,}) {
  return _then(EarnsOverview(
standing: null == standing ? _self.standing : standing // ignore: cast_nullable_to_non_nullable
as PointsStanding,sources: null == sources ? _self.sources : sources // ignore: cast_nullable_to_non_nullable
as List<EarnSource>,badges: null == badges ? _self.badges : badges // ignore: cast_nullable_to_non_nullable
as List<EarnedBadge>,
  ));
}
/// Create a copy of EarnsOverview
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PointsStandingCopyWith<$Res> get standing {
  
  return $PointsStandingCopyWith<$Res>(_self.standing, (value) {
    return _then(_self.copyWith(standing: value));
  });
}
}


/// Adds pattern-matching-related methods to [EarnsOverview].
extension EarnsOverviewPatterns on EarnsOverview {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _EarnsOverview value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _EarnsOverview() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _EarnsOverview value)  $default,){
final _that = this;
switch (_that) {
case _EarnsOverview():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _EarnsOverview value)?  $default,){
final _that = this;
switch (_that) {
case _EarnsOverview() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( PointsStanding standing,  List<EarnSource> sources,  List<EarnedBadge> badges)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _EarnsOverview() when $default != null:
return $default(_that.standing,_that.sources,_that.badges);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( PointsStanding standing,  List<EarnSource> sources,  List<EarnedBadge> badges)  $default,) {final _that = this;
switch (_that) {
case _EarnsOverview():
return $default(_that.standing,_that.sources,_that.badges);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( PointsStanding standing,  List<EarnSource> sources,  List<EarnedBadge> badges)?  $default,) {final _that = this;
switch (_that) {
case _EarnsOverview() when $default != null:
return $default(_that.standing,_that.sources,_that.badges);case _:
  return null;

}
}

}

/// @nodoc


class _EarnsOverview implements EarnsOverview {
  const _EarnsOverview({required this.standing, required  List<EarnSource> sources, required  List<EarnedBadge> badges}): _sources = sources,_badges = badges;
  

@override final  PointsStanding standing;
 final  List<EarnSource> _sources;
@override List<EarnSource> get sources {
  if (_sources is EqualUnmodifiableListView) return _sources;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_sources);
}

 final  List<EarnedBadge> _badges;
@override List<EarnedBadge> get badges {
  if (_badges is EqualUnmodifiableListView) return _badges;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_badges);
}


/// Create a copy of EarnsOverview
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$EarnsOverviewCopyWith<_EarnsOverview> get copyWith => __$EarnsOverviewCopyWithImpl<_EarnsOverview>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _EarnsOverview&&(identical(other.standing, standing) || other.standing == standing)&&const DeepCollectionEquality().equals(other.sources, _sources)&&const DeepCollectionEquality().equals(other.badges, _badges));
}


@override
int get hashCode {
    return Object.hash(runtimeType,standing,const DeepCollectionEquality().hash(_sources),const DeepCollectionEquality().hash(_badges));
}

@override
String toString() {
    return 'EarnsOverview(standing: $standing, sources: $sources, badges: $badges)';
}


}

/// @nodoc
abstract mixin class _$EarnsOverviewCopyWith<$Res> implements $EarnsOverviewCopyWith<$Res> {
  factory _$EarnsOverviewCopyWith(_EarnsOverview value, $Res Function(_EarnsOverview) _then) = __$EarnsOverviewCopyWithImpl;
@override @useResult
$Res call({
 PointsStanding standing, List<EarnSource> sources, List<EarnedBadge> badges
});


@override $PointsStandingCopyWith<$Res> get standing;

}
/// @nodoc
class __$EarnsOverviewCopyWithImpl<$Res>
    implements _$EarnsOverviewCopyWith<$Res> {
  __$EarnsOverviewCopyWithImpl(this._self, this._then);

  final _EarnsOverview _self;
  final $Res Function(_EarnsOverview) _then;

/// Create a copy of EarnsOverview
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? standing = null,Object? sources = null,Object? badges = null,}) {
  return _then(_EarnsOverview(
standing: null == standing ? _self.standing : standing // ignore: cast_nullable_to_non_nullable
as PointsStanding,sources: null == sources ? _self._sources : sources // ignore: cast_nullable_to_non_nullable
as List<EarnSource>,badges: null == badges ? _self._badges : badges // ignore: cast_nullable_to_non_nullable
as List<EarnedBadge>,
  ));
}

/// Create a copy of EarnsOverview
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PointsStandingCopyWith<$Res> get standing {
  
  return $PointsStandingCopyWith<$Res>(_self.standing, (value) {
    return _then(_self.copyWith(standing: value));
  });
}
}

// dart format on
