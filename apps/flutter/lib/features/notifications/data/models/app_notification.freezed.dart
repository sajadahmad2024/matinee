// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'app_notification.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$NotificationSpan {

 String get text; NotificationSpanTone get tone;
/// Create a copy of NotificationSpan
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$NotificationSpanCopyWith<NotificationSpan> get copyWith => _$NotificationSpanCopyWithImpl<NotificationSpan>(this as NotificationSpan, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as NotificationSpan;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationSpan&&(identical(other.text, _this.text) || other.text == _this.text)&&(identical(other.tone, _this.tone) || other.tone == _this.tone));
}


@override
int get hashCode {
  final _this = this as NotificationSpan;
  return Object.hash(runtimeType,_this.text,_this.tone);
}

@override
String toString() {
  final _this = this as NotificationSpan;
  return 'NotificationSpan(text: ${_this.text}, tone: ${_this.tone})';
}


}

/// @nodoc
abstract mixin class $NotificationSpanCopyWith<$Res>  {
  factory $NotificationSpanCopyWith(NotificationSpan value, $Res Function(NotificationSpan) _then) = _$NotificationSpanCopyWithImpl;
@useResult
$Res call({
 String text, NotificationSpanTone tone
});




}
/// @nodoc
class _$NotificationSpanCopyWithImpl<$Res>
    implements $NotificationSpanCopyWith<$Res> {
  _$NotificationSpanCopyWithImpl(this._self, this._then);

  final NotificationSpan _self;
  final $Res Function(NotificationSpan) _then;

/// Create a copy of NotificationSpan
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? text = null,Object? tone = null,}) {
  return _then(NotificationSpan(
null == text ? _self.text : text // ignore: cast_nullable_to_non_nullable
as String,tone: null == tone ? _self.tone : tone // ignore: cast_nullable_to_non_nullable
as NotificationSpanTone,
  ));
}

}


/// Adds pattern-matching-related methods to [NotificationSpan].
extension NotificationSpanPatterns on NotificationSpan {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _NotificationSpan value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _NotificationSpan() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _NotificationSpan value)  $default,){
final _that = this;
switch (_that) {
case _NotificationSpan():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _NotificationSpan value)?  $default,){
final _that = this;
switch (_that) {
case _NotificationSpan() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String text,  NotificationSpanTone tone)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _NotificationSpan() when $default != null:
return $default(_that.text,_that.tone);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String text,  NotificationSpanTone tone)  $default,) {final _that = this;
switch (_that) {
case _NotificationSpan():
return $default(_that.text,_that.tone);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String text,  NotificationSpanTone tone)?  $default,) {final _that = this;
switch (_that) {
case _NotificationSpan() when $default != null:
return $default(_that.text,_that.tone);case _:
  return null;

}
}

}

/// @nodoc


class _NotificationSpan implements NotificationSpan {
  const _NotificationSpan(this.text, {this.tone = NotificationSpanTone.plain});
  

@override final  String text;
@override@JsonKey() final  NotificationSpanTone tone;

/// Create a copy of NotificationSpan
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$NotificationSpanCopyWith<_NotificationSpan> get copyWith => __$NotificationSpanCopyWithImpl<_NotificationSpan>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _NotificationSpan&&(identical(other.text, text) || other.text == text)&&(identical(other.tone, tone) || other.tone == tone));
}


@override
int get hashCode {
    return Object.hash(runtimeType,text,tone);
}

@override
String toString() {
    return 'NotificationSpan(text: $text, tone: $tone)';
}


}

/// @nodoc
abstract mixin class _$NotificationSpanCopyWith<$Res> implements $NotificationSpanCopyWith<$Res> {
  factory _$NotificationSpanCopyWith(_NotificationSpan value, $Res Function(_NotificationSpan) _then) = __$NotificationSpanCopyWithImpl;
@override @useResult
$Res call({
 String text, NotificationSpanTone tone
});




}
/// @nodoc
class __$NotificationSpanCopyWithImpl<$Res>
    implements _$NotificationSpanCopyWith<$Res> {
  __$NotificationSpanCopyWithImpl(this._self, this._then);

  final _NotificationSpan _self;
  final $Res Function(_NotificationSpan) _then;

/// Create a copy of NotificationSpan
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? text = null,Object? tone = null,}) {
  return _then(_NotificationSpan(
null == text ? _self.text : text // ignore: cast_nullable_to_non_nullable
as String,tone: null == tone ? _self.tone : tone // ignore: cast_nullable_to_non_nullable
as NotificationSpanTone,
  ));
}


}

/// @nodoc
mixin _$NotificationFooter {





@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is NotificationFooter);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'NotificationFooter()';
}


}

/// @nodoc
class $NotificationFooterCopyWith<$Res>  {
$NotificationFooterCopyWith(NotificationFooter _, $Res Function(NotificationFooter) __);
}


/// Adds pattern-matching-related methods to [NotificationFooter].
extension NotificationFooterPatterns on NotificationFooter {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>({TResult Function( AuctionBidFooter value)?  auctionBid,TResult Function( StreakCheckInFooter value)?  streakCheckIn,TResult Function( PointsCreditedFooter value)?  pointsCredited,TResult Function( PointsAddedFooter value)?  pointsAdded,required TResult orElse(),}){
final _that = this;
switch (_that) {
case AuctionBidFooter() when auctionBid != null:
return auctionBid(_that);case StreakCheckInFooter() when streakCheckIn != null:
return streakCheckIn(_that);case PointsCreditedFooter() when pointsCredited != null:
return pointsCredited(_that);case PointsAddedFooter() when pointsAdded != null:
return pointsAdded(_that);case _:
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

@optionalTypeArgs TResult map<TResult extends Object?>({required TResult Function( AuctionBidFooter value)  auctionBid,required TResult Function( StreakCheckInFooter value)  streakCheckIn,required TResult Function( PointsCreditedFooter value)  pointsCredited,required TResult Function( PointsAddedFooter value)  pointsAdded,}){
final _that = this;
switch (_that) {
case AuctionBidFooter():
return auctionBid(_that);case StreakCheckInFooter():
return streakCheckIn(_that);case PointsCreditedFooter():
return pointsCredited(_that);case PointsAddedFooter():
return pointsAdded(_that);}
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>({TResult? Function( AuctionBidFooter value)?  auctionBid,TResult? Function( StreakCheckInFooter value)?  streakCheckIn,TResult? Function( PointsCreditedFooter value)?  pointsCredited,TResult? Function( PointsAddedFooter value)?  pointsAdded,}){
final _that = this;
switch (_that) {
case AuctionBidFooter() when auctionBid != null:
return auctionBid(_that);case StreakCheckInFooter() when streakCheckIn != null:
return streakCheckIn(_that);case PointsCreditedFooter() when pointsCredited != null:
return pointsCredited(_that);case PointsAddedFooter() when pointsAdded != null:
return pointsAdded(_that);case _:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>({TResult Function( DateTime endsAt)?  auctionBid,TResult Function()?  streakCheckIn,TResult Function( int points,  int balance)?  pointsCredited,TResult Function( int points)?  pointsAdded,required TResult orElse(),}) {final _that = this;
switch (_that) {
case AuctionBidFooter() when auctionBid != null:
return auctionBid(_that.endsAt);case StreakCheckInFooter() when streakCheckIn != null:
return streakCheckIn();case PointsCreditedFooter() when pointsCredited != null:
return pointsCredited(_that.points,_that.balance);case PointsAddedFooter() when pointsAdded != null:
return pointsAdded(_that.points);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>({required TResult Function( DateTime endsAt)  auctionBid,required TResult Function()  streakCheckIn,required TResult Function( int points,  int balance)  pointsCredited,required TResult Function( int points)  pointsAdded,}) {final _that = this;
switch (_that) {
case AuctionBidFooter():
return auctionBid(_that.endsAt);case StreakCheckInFooter():
return streakCheckIn();case PointsCreditedFooter():
return pointsCredited(_that.points,_that.balance);case PointsAddedFooter():
return pointsAdded(_that.points);}
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>({TResult? Function( DateTime endsAt)?  auctionBid,TResult? Function()?  streakCheckIn,TResult? Function( int points,  int balance)?  pointsCredited,TResult? Function( int points)?  pointsAdded,}) {final _that = this;
switch (_that) {
case AuctionBidFooter() when auctionBid != null:
return auctionBid(_that.endsAt);case StreakCheckInFooter() when streakCheckIn != null:
return streakCheckIn();case PointsCreditedFooter() when pointsCredited != null:
return pointsCredited(_that.points,_that.balance);case PointsAddedFooter() when pointsAdded != null:
return pointsAdded(_that.points);case _:
  return null;

}
}

}

/// @nodoc


class AuctionBidFooter implements NotificationFooter {
  const AuctionBidFooter({required this.endsAt});
  

 final  DateTime endsAt;

/// Create a copy of NotificationFooter
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuctionBidFooterCopyWith<AuctionBidFooter> get copyWith => _$AuctionBidFooterCopyWithImpl<AuctionBidFooter>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionBidFooter&&(identical(other.endsAt, endsAt) || other.endsAt == endsAt));
}


@override
int get hashCode {
    return Object.hash(runtimeType,endsAt);
}

@override
String toString() {
    return 'NotificationFooter.auctionBid(endsAt: $endsAt)';
}


}

/// @nodoc
abstract mixin class $AuctionBidFooterCopyWith<$Res> implements $NotificationFooterCopyWith<$Res> {
  factory $AuctionBidFooterCopyWith(AuctionBidFooter value, $Res Function(AuctionBidFooter) _then) = _$AuctionBidFooterCopyWithImpl;
@useResult
$Res call({
 DateTime endsAt
});




}
/// @nodoc
class _$AuctionBidFooterCopyWithImpl<$Res>
    implements $AuctionBidFooterCopyWith<$Res> {
  _$AuctionBidFooterCopyWithImpl(this._self, this._then);

  final AuctionBidFooter _self;
  final $Res Function(AuctionBidFooter) _then;

/// Create a copy of NotificationFooter
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? endsAt = null,}) {
  return _then(AuctionBidFooter(
endsAt: null == endsAt ? _self.endsAt : endsAt // ignore: cast_nullable_to_non_nullable
as DateTime,
  ));
}


}

/// @nodoc


class StreakCheckInFooter implements NotificationFooter {
  const StreakCheckInFooter();
  






@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is StreakCheckInFooter);
}


@override
int get hashCode => runtimeType.hashCode;

@override
String toString() {
    return 'NotificationFooter.streakCheckIn()';
}


}




/// @nodoc


class PointsCreditedFooter implements NotificationFooter {
  const PointsCreditedFooter({required this.points, required this.balance});
  

 final  int points;
 final  int balance;

/// Create a copy of NotificationFooter
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PointsCreditedFooterCopyWith<PointsCreditedFooter> get copyWith => _$PointsCreditedFooterCopyWithImpl<PointsCreditedFooter>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PointsCreditedFooter&&(identical(other.points, points) || other.points == points)&&(identical(other.balance, balance) || other.balance == balance));
}


@override
int get hashCode {
    return Object.hash(runtimeType,points,balance);
}

@override
String toString() {
    return 'NotificationFooter.pointsCredited(points: $points, balance: $balance)';
}


}

/// @nodoc
abstract mixin class $PointsCreditedFooterCopyWith<$Res> implements $NotificationFooterCopyWith<$Res> {
  factory $PointsCreditedFooterCopyWith(PointsCreditedFooter value, $Res Function(PointsCreditedFooter) _then) = _$PointsCreditedFooterCopyWithImpl;
@useResult
$Res call({
 int points, int balance
});




}
/// @nodoc
class _$PointsCreditedFooterCopyWithImpl<$Res>
    implements $PointsCreditedFooterCopyWith<$Res> {
  _$PointsCreditedFooterCopyWithImpl(this._self, this._then);

  final PointsCreditedFooter _self;
  final $Res Function(PointsCreditedFooter) _then;

/// Create a copy of NotificationFooter
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? points = null,Object? balance = null,}) {
  return _then(PointsCreditedFooter(
points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,balance: null == balance ? _self.balance : balance // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

/// @nodoc


class PointsAddedFooter implements NotificationFooter {
  const PointsAddedFooter({required this.points});
  

 final  int points;

/// Create a copy of NotificationFooter
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PointsAddedFooterCopyWith<PointsAddedFooter> get copyWith => _$PointsAddedFooterCopyWithImpl<PointsAddedFooter>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is PointsAddedFooter&&(identical(other.points, points) || other.points == points));
}


@override
int get hashCode {
    return Object.hash(runtimeType,points);
}

@override
String toString() {
    return 'NotificationFooter.pointsAdded(points: $points)';
}


}

/// @nodoc
abstract mixin class $PointsAddedFooterCopyWith<$Res> implements $NotificationFooterCopyWith<$Res> {
  factory $PointsAddedFooterCopyWith(PointsAddedFooter value, $Res Function(PointsAddedFooter) _then) = _$PointsAddedFooterCopyWithImpl;
@useResult
$Res call({
 int points
});




}
/// @nodoc
class _$PointsAddedFooterCopyWithImpl<$Res>
    implements $PointsAddedFooterCopyWith<$Res> {
  _$PointsAddedFooterCopyWithImpl(this._self, this._then);

  final PointsAddedFooter _self;
  final $Res Function(PointsAddedFooter) _then;

/// Create a copy of NotificationFooter
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') $Res call({Object? points = null,}) {
  return _then(PointsAddedFooter(
points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,
  ));
}


}

/// @nodoc
mixin _$AppNotification {

 String get id; NotificationCategory get category; String get title; List<NotificationSpan> get body; DateTime get receivedAt; bool get isRead; bool get isUrgent; NotificationFooter? get footer;
/// Create a copy of AppNotification
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AppNotificationCopyWith<AppNotification> get copyWith => _$AppNotificationCopyWithImpl<AppNotification>(this as AppNotification, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as AppNotification;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AppNotification&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.category, _this.category) || other.category == _this.category)&&(identical(other.title, _this.title) || other.title == _this.title)&&const DeepCollectionEquality().equals(other.body, _this.body)&&(identical(other.receivedAt, _this.receivedAt) || other.receivedAt == _this.receivedAt)&&(identical(other.isRead, _this.isRead) || other.isRead == _this.isRead)&&(identical(other.isUrgent, _this.isUrgent) || other.isUrgent == _this.isUrgent)&&(identical(other.footer, _this.footer) || other.footer == _this.footer));
}


@override
int get hashCode {
  final _this = this as AppNotification;
  return Object.hash(runtimeType,_this.id,_this.category,_this.title,const DeepCollectionEquality().hash(_this.body),_this.receivedAt,_this.isRead,_this.isUrgent,_this.footer);
}

@override
String toString() {
  final _this = this as AppNotification;
  return 'AppNotification(id: ${_this.id}, category: ${_this.category}, title: ${_this.title}, body: ${_this.body}, receivedAt: ${_this.receivedAt}, isRead: ${_this.isRead}, isUrgent: ${_this.isUrgent}, footer: ${_this.footer})';
}


}

/// @nodoc
abstract mixin class $AppNotificationCopyWith<$Res>  {
  factory $AppNotificationCopyWith(AppNotification value, $Res Function(AppNotification) _then) = _$AppNotificationCopyWithImpl;
@useResult
$Res call({
 String id, NotificationCategory category, String title, List<NotificationSpan> body, DateTime receivedAt, bool isRead, bool isUrgent, NotificationFooter? footer
});


$NotificationFooterCopyWith<$Res>? get footer;

}
/// @nodoc
class _$AppNotificationCopyWithImpl<$Res>
    implements $AppNotificationCopyWith<$Res> {
  _$AppNotificationCopyWithImpl(this._self, this._then);

  final AppNotification _self;
  final $Res Function(AppNotification) _then;

/// Create a copy of AppNotification
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? category = null,Object? title = null,Object? body = null,Object? receivedAt = null,Object? isRead = null,Object? isUrgent = null,Object? footer = freezed,}) {
  return _then(AppNotification(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as NotificationCategory,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,body: null == body ? _self.body : body // ignore: cast_nullable_to_non_nullable
as List<NotificationSpan>,receivedAt: null == receivedAt ? _self.receivedAt : receivedAt // ignore: cast_nullable_to_non_nullable
as DateTime,isRead: null == isRead ? _self.isRead : isRead // ignore: cast_nullable_to_non_nullable
as bool,isUrgent: null == isUrgent ? _self.isUrgent : isUrgent // ignore: cast_nullable_to_non_nullable
as bool,footer: freezed == footer ? _self.footer : footer // ignore: cast_nullable_to_non_nullable
as NotificationFooter?,
  ));
}
/// Create a copy of AppNotification
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$NotificationFooterCopyWith<$Res>? get footer {
    if (_self.footer == null) {
    return null;
  }

  return $NotificationFooterCopyWith<$Res>(_self.footer!, (value) {
    return _then(_self.copyWith(footer: value));
  });
}
}


/// Adds pattern-matching-related methods to [AppNotification].
extension AppNotificationPatterns on AppNotification {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AppNotification value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AppNotification() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AppNotification value)  $default,){
final _that = this;
switch (_that) {
case _AppNotification():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AppNotification value)?  $default,){
final _that = this;
switch (_that) {
case _AppNotification() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  NotificationCategory category,  String title,  List<NotificationSpan> body,  DateTime receivedAt,  bool isRead,  bool isUrgent,  NotificationFooter? footer)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AppNotification() when $default != null:
return $default(_that.id,_that.category,_that.title,_that.body,_that.receivedAt,_that.isRead,_that.isUrgent,_that.footer);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  NotificationCategory category,  String title,  List<NotificationSpan> body,  DateTime receivedAt,  bool isRead,  bool isUrgent,  NotificationFooter? footer)  $default,) {final _that = this;
switch (_that) {
case _AppNotification():
return $default(_that.id,_that.category,_that.title,_that.body,_that.receivedAt,_that.isRead,_that.isUrgent,_that.footer);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  NotificationCategory category,  String title,  List<NotificationSpan> body,  DateTime receivedAt,  bool isRead,  bool isUrgent,  NotificationFooter? footer)?  $default,) {final _that = this;
switch (_that) {
case _AppNotification() when $default != null:
return $default(_that.id,_that.category,_that.title,_that.body,_that.receivedAt,_that.isRead,_that.isUrgent,_that.footer);case _:
  return null;

}
}

}

/// @nodoc


class _AppNotification implements AppNotification {
  const _AppNotification({required this.id, required this.category, required this.title, required  List<NotificationSpan> body, required this.receivedAt, this.isRead = false, this.isUrgent = false, this.footer}): _body = body;
  

@override final  String id;
@override final  NotificationCategory category;
@override final  String title;
 final  List<NotificationSpan> _body;
@override List<NotificationSpan> get body {
  if (_body is EqualUnmodifiableListView) return _body;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_body);
}

@override final  DateTime receivedAt;
@override@JsonKey() final  bool isRead;
@override@JsonKey() final  bool isUrgent;
@override final  NotificationFooter? footer;

/// Create a copy of AppNotification
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AppNotificationCopyWith<_AppNotification> get copyWith => __$AppNotificationCopyWithImpl<_AppNotification>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _AppNotification&&(identical(other.id, id) || other.id == id)&&(identical(other.category, category) || other.category == category)&&(identical(other.title, title) || other.title == title)&&const DeepCollectionEquality().equals(other.body, _body)&&(identical(other.receivedAt, receivedAt) || other.receivedAt == receivedAt)&&(identical(other.isRead, isRead) || other.isRead == isRead)&&(identical(other.isUrgent, isUrgent) || other.isUrgent == isUrgent)&&(identical(other.footer, footer) || other.footer == footer));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,category,title,const DeepCollectionEquality().hash(_body),receivedAt,isRead,isUrgent,footer);
}

@override
String toString() {
    return 'AppNotification(id: $id, category: $category, title: $title, body: $body, receivedAt: $receivedAt, isRead: $isRead, isUrgent: $isUrgent, footer: $footer)';
}


}

/// @nodoc
abstract mixin class _$AppNotificationCopyWith<$Res> implements $AppNotificationCopyWith<$Res> {
  factory _$AppNotificationCopyWith(_AppNotification value, $Res Function(_AppNotification) _then) = __$AppNotificationCopyWithImpl;
@override @useResult
$Res call({
 String id, NotificationCategory category, String title, List<NotificationSpan> body, DateTime receivedAt, bool isRead, bool isUrgent, NotificationFooter? footer
});


@override $NotificationFooterCopyWith<$Res>? get footer;

}
/// @nodoc
class __$AppNotificationCopyWithImpl<$Res>
    implements _$AppNotificationCopyWith<$Res> {
  __$AppNotificationCopyWithImpl(this._self, this._then);

  final _AppNotification _self;
  final $Res Function(_AppNotification) _then;

/// Create a copy of AppNotification
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? category = null,Object? title = null,Object? body = null,Object? receivedAt = null,Object? isRead = null,Object? isUrgent = null,Object? footer = freezed,}) {
  return _then(_AppNotification(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,category: null == category ? _self.category : category // ignore: cast_nullable_to_non_nullable
as NotificationCategory,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,body: null == body ? _self._body : body // ignore: cast_nullable_to_non_nullable
as List<NotificationSpan>,receivedAt: null == receivedAt ? _self.receivedAt : receivedAt // ignore: cast_nullable_to_non_nullable
as DateTime,isRead: null == isRead ? _self.isRead : isRead // ignore: cast_nullable_to_non_nullable
as bool,isUrgent: null == isUrgent ? _self.isUrgent : isUrgent // ignore: cast_nullable_to_non_nullable
as bool,footer: freezed == footer ? _self.footer : footer // ignore: cast_nullable_to_non_nullable
as NotificationFooter?,
  ));
}

/// Create a copy of AppNotification
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$NotificationFooterCopyWith<$Res>? get footer {
    if (_self.footer == null) {
    return null;
  }

  return $NotificationFooterCopyWith<$Res>(_self.footer!, (value) {
    return _then(_self.copyWith(footer: value));
  });
}
}

// dart format on
