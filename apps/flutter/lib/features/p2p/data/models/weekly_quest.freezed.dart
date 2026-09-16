// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'weekly_quest.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$WeeklyQuest {

 String get id; String get title; String get description; String get imageAsset; int get points; String get badgeName; QuestStatus get status; Duration get timeLeft; List<QuestAction> get actions;/// How long the user took, shown once the reward is claimed.
 int? get completedInDays;
/// Create a copy of WeeklyQuest
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$WeeklyQuestCopyWith<WeeklyQuest> get copyWith => _$WeeklyQuestCopyWithImpl<WeeklyQuest>(this as WeeklyQuest, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as WeeklyQuest;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is WeeklyQuest&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.description, _this.description) || other.description == _this.description)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset)&&(identical(other.points, _this.points) || other.points == _this.points)&&(identical(other.badgeName, _this.badgeName) || other.badgeName == _this.badgeName)&&(identical(other.status, _this.status) || other.status == _this.status)&&(identical(other.timeLeft, _this.timeLeft) || other.timeLeft == _this.timeLeft)&&const DeepCollectionEquality().equals(other.actions, _this.actions)&&(identical(other.completedInDays, _this.completedInDays) || other.completedInDays == _this.completedInDays));
}


@override
int get hashCode {
  final _this = this as WeeklyQuest;
  return Object.hash(runtimeType,_this.id,_this.title,_this.description,_this.imageAsset,_this.points,_this.badgeName,_this.status,_this.timeLeft,const DeepCollectionEquality().hash(_this.actions),_this.completedInDays);
}

@override
String toString() {
  final _this = this as WeeklyQuest;
  return 'WeeklyQuest(id: ${_this.id}, title: ${_this.title}, description: ${_this.description}, imageAsset: ${_this.imageAsset}, points: ${_this.points}, badgeName: ${_this.badgeName}, status: ${_this.status}, timeLeft: ${_this.timeLeft}, actions: ${_this.actions}, completedInDays: ${_this.completedInDays})';
}


}

/// @nodoc
abstract mixin class $WeeklyQuestCopyWith<$Res>  {
  factory $WeeklyQuestCopyWith(WeeklyQuest value, $Res Function(WeeklyQuest) _then) = _$WeeklyQuestCopyWithImpl;
@useResult
$Res call({
 String id, String title, String description, String imageAsset, int points, String badgeName, QuestStatus status, Duration timeLeft, List<QuestAction> actions, int? completedInDays
});




}
/// @nodoc
class _$WeeklyQuestCopyWithImpl<$Res>
    implements $WeeklyQuestCopyWith<$Res> {
  _$WeeklyQuestCopyWithImpl(this._self, this._then);

  final WeeklyQuest _self;
  final $Res Function(WeeklyQuest) _then;

/// Create a copy of WeeklyQuest
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? description = null,Object? imageAsset = null,Object? points = null,Object? badgeName = null,Object? status = null,Object? timeLeft = null,Object? actions = null,Object? completedInDays = freezed,}) {
  return _then(WeeklyQuest(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,badgeName: null == badgeName ? _self.badgeName : badgeName // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as QuestStatus,timeLeft: null == timeLeft ? _self.timeLeft : timeLeft // ignore: cast_nullable_to_non_nullable
as Duration,actions: null == actions ? _self.actions : actions // ignore: cast_nullable_to_non_nullable
as List<QuestAction>,completedInDays: freezed == completedInDays ? _self.completedInDays : completedInDays // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}

}


/// Adds pattern-matching-related methods to [WeeklyQuest].
extension WeeklyQuestPatterns on WeeklyQuest {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _WeeklyQuest value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _WeeklyQuest() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _WeeklyQuest value)  $default,){
final _that = this;
switch (_that) {
case _WeeklyQuest():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _WeeklyQuest value)?  $default,){
final _that = this;
switch (_that) {
case _WeeklyQuest() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String description,  String imageAsset,  int points,  String badgeName,  QuestStatus status,  Duration timeLeft,  List<QuestAction> actions,  int? completedInDays)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _WeeklyQuest() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.points,_that.badgeName,_that.status,_that.timeLeft,_that.actions,_that.completedInDays);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String description,  String imageAsset,  int points,  String badgeName,  QuestStatus status,  Duration timeLeft,  List<QuestAction> actions,  int? completedInDays)  $default,) {final _that = this;
switch (_that) {
case _WeeklyQuest():
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.points,_that.badgeName,_that.status,_that.timeLeft,_that.actions,_that.completedInDays);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String description,  String imageAsset,  int points,  String badgeName,  QuestStatus status,  Duration timeLeft,  List<QuestAction> actions,  int? completedInDays)?  $default,) {final _that = this;
switch (_that) {
case _WeeklyQuest() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.points,_that.badgeName,_that.status,_that.timeLeft,_that.actions,_that.completedInDays);case _:
  return null;

}
}

}

/// @nodoc


class _WeeklyQuest implements WeeklyQuest {
  const _WeeklyQuest({required this.id, required this.title, required this.description, required this.imageAsset, required this.points, required this.badgeName, required this.status, required this.timeLeft, required  List<QuestAction> actions, this.completedInDays}): _actions = actions;
  

@override final  String id;
@override final  String title;
@override final  String description;
@override final  String imageAsset;
@override final  int points;
@override final  String badgeName;
@override final  QuestStatus status;
@override final  Duration timeLeft;
 final  List<QuestAction> _actions;
@override List<QuestAction> get actions {
  if (_actions is EqualUnmodifiableListView) return _actions;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_actions);
}

/// How long the user took, shown once the reward is claimed.
@override final  int? completedInDays;

/// Create a copy of WeeklyQuest
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$WeeklyQuestCopyWith<_WeeklyQuest> get copyWith => __$WeeklyQuestCopyWithImpl<_WeeklyQuest>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _WeeklyQuest&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset)&&(identical(other.points, points) || other.points == points)&&(identical(other.badgeName, badgeName) || other.badgeName == badgeName)&&(identical(other.status, status) || other.status == status)&&(identical(other.timeLeft, timeLeft) || other.timeLeft == timeLeft)&&const DeepCollectionEquality().equals(other.actions, _actions)&&(identical(other.completedInDays, completedInDays) || other.completedInDays == completedInDays));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,title,description,imageAsset,points,badgeName,status,timeLeft,const DeepCollectionEquality().hash(_actions),completedInDays);
}

@override
String toString() {
    return 'WeeklyQuest(id: $id, title: $title, description: $description, imageAsset: $imageAsset, points: $points, badgeName: $badgeName, status: $status, timeLeft: $timeLeft, actions: $actions, completedInDays: $completedInDays)';
}


}

/// @nodoc
abstract mixin class _$WeeklyQuestCopyWith<$Res> implements $WeeklyQuestCopyWith<$Res> {
  factory _$WeeklyQuestCopyWith(_WeeklyQuest value, $Res Function(_WeeklyQuest) _then) = __$WeeklyQuestCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String description, String imageAsset, int points, String badgeName, QuestStatus status, Duration timeLeft, List<QuestAction> actions, int? completedInDays
});




}
/// @nodoc
class __$WeeklyQuestCopyWithImpl<$Res>
    implements _$WeeklyQuestCopyWith<$Res> {
  __$WeeklyQuestCopyWithImpl(this._self, this._then);

  final _WeeklyQuest _self;
  final $Res Function(_WeeklyQuest) _then;

/// Create a copy of WeeklyQuest
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? description = null,Object? imageAsset = null,Object? points = null,Object? badgeName = null,Object? status = null,Object? timeLeft = null,Object? actions = null,Object? completedInDays = freezed,}) {
  return _then(_WeeklyQuest(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,badgeName: null == badgeName ? _self.badgeName : badgeName // ignore: cast_nullable_to_non_nullable
as String,status: null == status ? _self.status : status // ignore: cast_nullable_to_non_nullable
as QuestStatus,timeLeft: null == timeLeft ? _self.timeLeft : timeLeft // ignore: cast_nullable_to_non_nullable
as Duration,actions: null == actions ? _self._actions : actions // ignore: cast_nullable_to_non_nullable
as List<QuestAction>,completedInDays: freezed == completedInDays ? _self.completedInDays : completedInDays // ignore: cast_nullable_to_non_nullable
as int?,
  ));
}


}

/// @nodoc
mixin _$QuestAction {

 String get id; String get title; String get description; String get imageAsset; int get done; int get target; List<CuratedItem> get curated;
/// Create a copy of QuestAction
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$QuestActionCopyWith<QuestAction> get copyWith => _$QuestActionCopyWithImpl<QuestAction>(this as QuestAction, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as QuestAction;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is QuestAction&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.description, _this.description) || other.description == _this.description)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset)&&(identical(other.done, _this.done) || other.done == _this.done)&&(identical(other.target, _this.target) || other.target == _this.target)&&const DeepCollectionEquality().equals(other.curated, _this.curated));
}


@override
int get hashCode {
  final _this = this as QuestAction;
  return Object.hash(runtimeType,_this.id,_this.title,_this.description,_this.imageAsset,_this.done,_this.target,const DeepCollectionEquality().hash(_this.curated));
}

@override
String toString() {
  final _this = this as QuestAction;
  return 'QuestAction(id: ${_this.id}, title: ${_this.title}, description: ${_this.description}, imageAsset: ${_this.imageAsset}, done: ${_this.done}, target: ${_this.target}, curated: ${_this.curated})';
}


}

/// @nodoc
abstract mixin class $QuestActionCopyWith<$Res>  {
  factory $QuestActionCopyWith(QuestAction value, $Res Function(QuestAction) _then) = _$QuestActionCopyWithImpl;
@useResult
$Res call({
 String id, String title, String description, String imageAsset, int done, int target, List<CuratedItem> curated
});




}
/// @nodoc
class _$QuestActionCopyWithImpl<$Res>
    implements $QuestActionCopyWith<$Res> {
  _$QuestActionCopyWithImpl(this._self, this._then);

  final QuestAction _self;
  final $Res Function(QuestAction) _then;

/// Create a copy of QuestAction
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? description = null,Object? imageAsset = null,Object? done = null,Object? target = null,Object? curated = null,}) {
  return _then(QuestAction(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,done: null == done ? _self.done : done // ignore: cast_nullable_to_non_nullable
as int,target: null == target ? _self.target : target // ignore: cast_nullable_to_non_nullable
as int,curated: null == curated ? _self.curated : curated // ignore: cast_nullable_to_non_nullable
as List<CuratedItem>,
  ));
}

}


/// Adds pattern-matching-related methods to [QuestAction].
extension QuestActionPatterns on QuestAction {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _QuestAction value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _QuestAction() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _QuestAction value)  $default,){
final _that = this;
switch (_that) {
case _QuestAction():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _QuestAction value)?  $default,){
final _that = this;
switch (_that) {
case _QuestAction() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String description,  String imageAsset,  int done,  int target,  List<CuratedItem> curated)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _QuestAction() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.done,_that.target,_that.curated);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String description,  String imageAsset,  int done,  int target,  List<CuratedItem> curated)  $default,) {final _that = this;
switch (_that) {
case _QuestAction():
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.done,_that.target,_that.curated);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String description,  String imageAsset,  int done,  int target,  List<CuratedItem> curated)?  $default,) {final _that = this;
switch (_that) {
case _QuestAction() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.done,_that.target,_that.curated);case _:
  return null;

}
}

}

/// @nodoc


class _QuestAction implements QuestAction {
  const _QuestAction({required this.id, required this.title, required this.description, required this.imageAsset, required this.done, required this.target, required  List<CuratedItem> curated}): _curated = curated;
  

@override final  String id;
@override final  String title;
@override final  String description;
@override final  String imageAsset;
@override final  int done;
@override final  int target;
 final  List<CuratedItem> _curated;
@override List<CuratedItem> get curated {
  if (_curated is EqualUnmodifiableListView) return _curated;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_curated);
}


/// Create a copy of QuestAction
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$QuestActionCopyWith<_QuestAction> get copyWith => __$QuestActionCopyWithImpl<_QuestAction>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _QuestAction&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset)&&(identical(other.done, done) || other.done == done)&&(identical(other.target, target) || other.target == target)&&const DeepCollectionEquality().equals(other.curated, _curated));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,title,description,imageAsset,done,target,const DeepCollectionEquality().hash(_curated));
}

@override
String toString() {
    return 'QuestAction(id: $id, title: $title, description: $description, imageAsset: $imageAsset, done: $done, target: $target, curated: $curated)';
}


}

/// @nodoc
abstract mixin class _$QuestActionCopyWith<$Res> implements $QuestActionCopyWith<$Res> {
  factory _$QuestActionCopyWith(_QuestAction value, $Res Function(_QuestAction) _then) = __$QuestActionCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String description, String imageAsset, int done, int target, List<CuratedItem> curated
});




}
/// @nodoc
class __$QuestActionCopyWithImpl<$Res>
    implements _$QuestActionCopyWith<$Res> {
  __$QuestActionCopyWithImpl(this._self, this._then);

  final _QuestAction _self;
  final $Res Function(_QuestAction) _then;

/// Create a copy of QuestAction
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? description = null,Object? imageAsset = null,Object? done = null,Object? target = null,Object? curated = null,}) {
  return _then(_QuestAction(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,done: null == done ? _self.done : done // ignore: cast_nullable_to_non_nullable
as int,target: null == target ? _self.target : target // ignore: cast_nullable_to_non_nullable
as int,curated: null == curated ? _self._curated : curated // ignore: cast_nullable_to_non_nullable
as List<CuratedItem>,
  ));
}


}

/// @nodoc
mixin _$CuratedItem {

 String get id; String get title; String get imageAsset; bool get isWatched;
/// Create a copy of CuratedItem
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$CuratedItemCopyWith<CuratedItem> get copyWith => _$CuratedItemCopyWithImpl<CuratedItem>(this as CuratedItem, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as CuratedItem;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is CuratedItem&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset)&&(identical(other.isWatched, _this.isWatched) || other.isWatched == _this.isWatched));
}


@override
int get hashCode {
  final _this = this as CuratedItem;
  return Object.hash(runtimeType,_this.id,_this.title,_this.imageAsset,_this.isWatched);
}

@override
String toString() {
  final _this = this as CuratedItem;
  return 'CuratedItem(id: ${_this.id}, title: ${_this.title}, imageAsset: ${_this.imageAsset}, isWatched: ${_this.isWatched})';
}


}

/// @nodoc
abstract mixin class $CuratedItemCopyWith<$Res>  {
  factory $CuratedItemCopyWith(CuratedItem value, $Res Function(CuratedItem) _then) = _$CuratedItemCopyWithImpl;
@useResult
$Res call({
 String id, String title, String imageAsset, bool isWatched
});




}
/// @nodoc
class _$CuratedItemCopyWithImpl<$Res>
    implements $CuratedItemCopyWith<$Res> {
  _$CuratedItemCopyWithImpl(this._self, this._then);

  final CuratedItem _self;
  final $Res Function(CuratedItem) _then;

/// Create a copy of CuratedItem
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? imageAsset = null,Object? isWatched = null,}) {
  return _then(CuratedItem(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,isWatched: null == isWatched ? _self.isWatched : isWatched // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [CuratedItem].
extension CuratedItemPatterns on CuratedItem {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _CuratedItem value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _CuratedItem() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _CuratedItem value)  $default,){
final _that = this;
switch (_that) {
case _CuratedItem():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _CuratedItem value)?  $default,){
final _that = this;
switch (_that) {
case _CuratedItem() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String imageAsset,  bool isWatched)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _CuratedItem() when $default != null:
return $default(_that.id,_that.title,_that.imageAsset,_that.isWatched);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String imageAsset,  bool isWatched)  $default,) {final _that = this;
switch (_that) {
case _CuratedItem():
return $default(_that.id,_that.title,_that.imageAsset,_that.isWatched);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String imageAsset,  bool isWatched)?  $default,) {final _that = this;
switch (_that) {
case _CuratedItem() when $default != null:
return $default(_that.id,_that.title,_that.imageAsset,_that.isWatched);case _:
  return null;

}
}

}

/// @nodoc


class _CuratedItem implements CuratedItem {
  const _CuratedItem({required this.id, required this.title, required this.imageAsset, required this.isWatched});
  

@override final  String id;
@override final  String title;
@override final  String imageAsset;
@override final  bool isWatched;

/// Create a copy of CuratedItem
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$CuratedItemCopyWith<_CuratedItem> get copyWith => __$CuratedItemCopyWithImpl<_CuratedItem>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _CuratedItem&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset)&&(identical(other.isWatched, isWatched) || other.isWatched == isWatched));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,title,imageAsset,isWatched);
}

@override
String toString() {
    return 'CuratedItem(id: $id, title: $title, imageAsset: $imageAsset, isWatched: $isWatched)';
}


}

/// @nodoc
abstract mixin class _$CuratedItemCopyWith<$Res> implements $CuratedItemCopyWith<$Res> {
  factory _$CuratedItemCopyWith(_CuratedItem value, $Res Function(_CuratedItem) _then) = __$CuratedItemCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String imageAsset, bool isWatched
});




}
/// @nodoc
class __$CuratedItemCopyWithImpl<$Res>
    implements _$CuratedItemCopyWith<$Res> {
  __$CuratedItemCopyWithImpl(this._self, this._then);

  final _CuratedItem _self;
  final $Res Function(_CuratedItem) _then;

/// Create a copy of CuratedItem
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? imageAsset = null,Object? isWatched = null,}) {
  return _then(_CuratedItem(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,isWatched: null == isWatched ? _self.isWatched : isWatched // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

// dart format on
