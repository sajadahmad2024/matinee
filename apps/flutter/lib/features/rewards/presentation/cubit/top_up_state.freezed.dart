// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'top_up_state.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$TopUpState {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is TopUpState);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'TopUpState()';
}


}

/// @nodoc
class $TopUpStateCopyWith<$Res>  {
$TopUpStateCopyWith(TopUpState _, $Res Function(TopUpState) __);
}


/// Adds pattern-matching-related methods to [TopUpState].
extension TopUpStatePatterns on TopUpState {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( TopUpInitial value)?  initial,TResult Function( TopUpLoading value)?  loading,TResult Function( TopUpSuccess value)?  success,TResult Function( TopUpFailure value)?  failure,required TResult orElse(),}){
final _that = this;
switch (_that) {
case TopUpInitial() when initial != null:
return initial(_that);case TopUpLoading() when loading != null:
return loading(_that);case TopUpSuccess() when success != null:
return success(_that);case TopUpFailure() when failure != null:
return failure(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( TopUpInitial value)  initial,required TResult Function( TopUpLoading value)  loading,required TResult Function( TopUpSuccess value)  success,required TResult Function( TopUpFailure value)  failure,}){
final _that = this;
switch (_that) {
case TopUpInitial():
return initial(_that);case TopUpLoading():
return loading(_that);case TopUpSuccess():
return success(_that);case TopUpFailure():
return failure(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( TopUpInitial value)?  initial,TResult? Function( TopUpLoading value)?  loading,TResult? Function( TopUpSuccess value)?  success,TResult? Function( TopUpFailure value)?  failure,}){
final _that = this;
switch (_that) {
case TopUpInitial() when initial != null:
return initial(_that);case TopUpLoading() when loading != null:
return loading(_that);case TopUpSuccess() when success != null:
return success(_that);case TopUpFailure() when failure != null:
return failure(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function()?  initial,TResult Function()?  loading,TResult Function( TopUpData data)?  success,TResult Function( AppException error)?  failure,required TResult orElse(),}) {final _that = this;
switch (_that) {
case TopUpInitial() when initial != null:
return initial();case TopUpLoading() when loading != null:
return loading();case TopUpSuccess() when success != null:
return success(_that.data);case TopUpFailure() when failure != null:
return failure(_that.error);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function()  initial,required TResult Function()  loading,required TResult Function( TopUpData data)  success,required TResult Function( AppException error)  failure,}) {final _that = this;
switch (_that) {
case TopUpInitial():
return initial();case TopUpLoading():
return loading();case TopUpSuccess():
return success(_that.data);case TopUpFailure():
return failure(_that.error);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function()?  initial,TResult? Function()?  loading,TResult? Function( TopUpData data)?  success,TResult? Function( AppException error)?  failure,}) {final _that = this;
switch (_that) {
case TopUpInitial() when initial != null:
return initial();case TopUpLoading() when loading != null:
return loading();case TopUpSuccess() when success != null:
return success(_that.data);case TopUpFailure() when failure != null:
return failure(_that.error);case _:
  return null;

}
}

}

/// @nodoc


class TopUpInitial implements TopUpState {
  const TopUpInitial();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is TopUpInitial);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'TopUpState.initial()';
}


}




/// @nodoc


class TopUpLoading implements TopUpState {
  const TopUpLoading();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is TopUpLoading);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'TopUpState.loading()';
}


}




/// @nodoc


class TopUpSuccess implements TopUpState {
  const TopUpSuccess(this.data);
  

 final  TopUpData data;

/// Create a copy of TopUpState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TopUpSuccessCopyWith<TopUpSuccess> get copyWith => _$TopUpSuccessCopyWithImpl<TopUpSuccess>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is TopUpSuccess&&(identical(other.data, data) || other.data == data));
}


@override
int get hashCode {
    return Object.hash(runtimeType,data);
}

@override
String toString() {
    return 'TopUpState.success(data: $data)';
}


}

/// @nodoc
abstract mixin class $TopUpSuccessCopyWith<$Res> implements $TopUpStateCopyWith<$Res> {
  factory $TopUpSuccessCopyWith(TopUpSuccess value, $Res Function(TopUpSuccess) _then) = _$TopUpSuccessCopyWithImpl;
@useResult
$Res call({
 TopUpData data
});


$TopUpDataCopyWith<$Res> get data;

}
/// @nodoc
class _$TopUpSuccessCopyWithImpl<$Res>
    implements $TopUpSuccessCopyWith<$Res> {
  _$TopUpSuccessCopyWithImpl(this._self, this._then);

  final TopUpSuccess _self;
  final $Res Function(TopUpSuccess) _then;

/// Create a copy of TopUpState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? data = null,}) {
  return _then(TopUpSuccess(
null == data ? _self.data : data // ignore: cast_nullable_to_non_nullable
as TopUpData,
  ));
}

/// Create a copy of TopUpState
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$TopUpDataCopyWith<$Res> get data {
  
  return $TopUpDataCopyWith<$Res>(_self.data, (value) {
    return _then(_self.copyWith(data: value));
  });
}
}

/// @nodoc


class TopUpFailure implements TopUpState {
  const TopUpFailure(this.error);
  

 final  AppException error;

/// Create a copy of TopUpState
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TopUpFailureCopyWith<TopUpFailure> get copyWith => _$TopUpFailureCopyWithImpl<TopUpFailure>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is TopUpFailure&&(identical(other.error, error) || other.error == error));
}


@override
int get hashCode {
    return Object.hash(runtimeType,error);
}

@override
String toString() {
    return 'TopUpState.failure(error: $error)';
}


}

/// @nodoc
abstract mixin class $TopUpFailureCopyWith<$Res> implements $TopUpStateCopyWith<$Res> {
  factory $TopUpFailureCopyWith(TopUpFailure value, $Res Function(TopUpFailure) _then) = _$TopUpFailureCopyWithImpl;
@useResult
$Res call({
 AppException error
});




}
/// @nodoc
class _$TopUpFailureCopyWithImpl<$Res>
    implements $TopUpFailureCopyWith<$Res> {
  _$TopUpFailureCopyWithImpl(this._self, this._then);

  final TopUpFailure _self;
  final $Res Function(TopUpFailure) _then;

/// Create a copy of TopUpState
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? error = null,}) {
  return _then(TopUpFailure(
null == error ? _self.error : error // ignore: cast_nullable_to_non_nullable
as AppException,
  ));
}


}

/// @nodoc
mixin _$TopUpData {

 List<PointsPack> get packs; PointsPack get selected; bool get purchased;
/// Create a copy of TopUpData
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$TopUpDataCopyWith<TopUpData> get copyWith => _$TopUpDataCopyWithImpl<TopUpData>(this as TopUpData, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as TopUpData;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is TopUpData&&const DeepCollectionEquality().equals(other.packs, _this.packs)&&(identical(other.selected, _this.selected) || other.selected == _this.selected)&&(identical(other.purchased, _this.purchased) || other.purchased == _this.purchased));
}


@override
int get hashCode {
  final _this = this as TopUpData;
  return Object.hash(runtimeType,const DeepCollectionEquality().hash(_this.packs),_this.selected,_this.purchased);
}

@override
String toString() {
  final _this = this as TopUpData;
  return 'TopUpData(packs: ${_this.packs}, selected: ${_this.selected}, purchased: ${_this.purchased})';
}


}

/// @nodoc
abstract mixin class $TopUpDataCopyWith<$Res>  {
  factory $TopUpDataCopyWith(TopUpData value, $Res Function(TopUpData) _then) = _$TopUpDataCopyWithImpl;
@useResult
$Res call({
 List<PointsPack> packs, PointsPack selected, bool purchased
});


$PointsPackCopyWith<$Res> get selected;

}
/// @nodoc
class _$TopUpDataCopyWithImpl<$Res>
    implements $TopUpDataCopyWith<$Res> {
  _$TopUpDataCopyWithImpl(this._self, this._then);

  final TopUpData _self;
  final $Res Function(TopUpData) _then;

/// Create a copy of TopUpData
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? packs = null,Object? selected = null,Object? purchased = null,}) {
  return _then(TopUpData(
packs: null == packs ? _self.packs : packs // ignore: cast_nullable_to_non_nullable
as List<PointsPack>,selected: null == selected ? _self.selected : selected // ignore: cast_nullable_to_non_nullable
as PointsPack,purchased: null == purchased ? _self.purchased : purchased // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}
/// Create a copy of TopUpData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PointsPackCopyWith<$Res> get selected {
  
  return $PointsPackCopyWith<$Res>(_self.selected, (value) {
    return _then(_self.copyWith(selected: value));
  });
}
}


/// Adds pattern-matching-related methods to [TopUpData].
extension TopUpDataPatterns on TopUpData {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _TopUpData value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _TopUpData() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _TopUpData value)  $default,){
final _that = this;
switch (_that) {
case _TopUpData():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _TopUpData value)?  $default,){
final _that = this;
switch (_that) {
case _TopUpData() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( List<PointsPack> packs,  PointsPack selected,  bool purchased)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _TopUpData() when $default != null:
return $default(_that.packs,_that.selected,_that.purchased);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( List<PointsPack> packs,  PointsPack selected,  bool purchased)  $default,) {final _that = this;
switch (_that) {
case _TopUpData():
return $default(_that.packs,_that.selected,_that.purchased);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( List<PointsPack> packs,  PointsPack selected,  bool purchased)?  $default,) {final _that = this;
switch (_that) {
case _TopUpData() when $default != null:
return $default(_that.packs,_that.selected,_that.purchased);case _:
  return null;

}
}

}

/// @nodoc


class _TopUpData implements TopUpData {
  const _TopUpData({required  List<PointsPack> packs, required this.selected, this.purchased = false}): _packs = packs;
  

 final  List<PointsPack> _packs;
@override List<PointsPack> get packs {
  if (_packs is EqualUnmodifiableListView) return _packs;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_packs);
}

@override final  PointsPack selected;
@override@JsonKey() final  bool purchased;

/// Create a copy of TopUpData
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$TopUpDataCopyWith<_TopUpData> get copyWith => __$TopUpDataCopyWithImpl<_TopUpData>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _TopUpData&&const DeepCollectionEquality().equals(other.packs, _packs)&&(identical(other.selected, selected) || other.selected == selected)&&(identical(other.purchased, purchased) || other.purchased == purchased));
}


@override
int get hashCode {
    return Object.hash(runtimeType,const DeepCollectionEquality().hash(_packs),selected,purchased);
}

@override
String toString() {
    return 'TopUpData(packs: $packs, selected: $selected, purchased: $purchased)';
}


}

/// @nodoc
abstract mixin class _$TopUpDataCopyWith<$Res> implements $TopUpDataCopyWith<$Res> {
  factory _$TopUpDataCopyWith(_TopUpData value, $Res Function(_TopUpData) _then) = __$TopUpDataCopyWithImpl;
@override @useResult
$Res call({
 List<PointsPack> packs, PointsPack selected, bool purchased
});


@override $PointsPackCopyWith<$Res> get selected;

}
/// @nodoc
class __$TopUpDataCopyWithImpl<$Res>
    implements _$TopUpDataCopyWith<$Res> {
  __$TopUpDataCopyWithImpl(this._self, this._then);

  final _TopUpData _self;
  final $Res Function(_TopUpData) _then;

/// Create a copy of TopUpData
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? packs = null,Object? selected = null,Object? purchased = null,}) {
  return _then(_TopUpData(
packs: null == packs ? _self._packs : packs // ignore: cast_nullable_to_non_nullable
as List<PointsPack>,selected: null == selected ? _self.selected : selected // ignore: cast_nullable_to_non_nullable
as PointsPack,purchased: null == purchased ? _self.purchased : purchased // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

/// Create a copy of TopUpData
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$PointsPackCopyWith<$Res> get selected {
  
  return $PointsPackCopyWith<$Res>(_self.selected, (value) {
    return _then(_self.copyWith(selected: value));
  });
}
}

// dart format on
