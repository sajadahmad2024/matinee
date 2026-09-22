// GENERATED CODE - DO NOT MODIFY BY HAND
// coverage:ignore-file
// ignore_for_file: type=lint, type=warning, deprecated_member_use, deprecated_member_use_from_same_package
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'auction.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

// GENERATED CODE - DO NOT MODIFY BY HAND
// dart format off
T _$identity<T>(T value) => value;
/// @nodoc
mixin _$AuctionBoard {

 Auction get auction; int get pointsBalance;
/// Create a copy of AuctionBoard
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuctionBoardCopyWith<AuctionBoard> get copyWith => _$AuctionBoardCopyWithImpl<AuctionBoard>(this as AuctionBoard, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as AuctionBoard;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionBoard&&(identical(other.auction, _this.auction) || other.auction == _this.auction)&&(identical(other.pointsBalance, _this.pointsBalance) || other.pointsBalance == _this.pointsBalance));
}


@override
int get hashCode {
  final _this = this as AuctionBoard;
  return Object.hash(runtimeType,_this.auction,_this.pointsBalance);
}

@override
String toString() {
  final _this = this as AuctionBoard;
  return 'AuctionBoard(auction: ${_this.auction}, pointsBalance: ${_this.pointsBalance})';
}


}

/// @nodoc
abstract mixin class $AuctionBoardCopyWith<$Res>  {
  factory $AuctionBoardCopyWith(AuctionBoard value, $Res Function(AuctionBoard) _then) = _$AuctionBoardCopyWithImpl;
@useResult
$Res call({
 Auction auction, int pointsBalance
});


$AuctionCopyWith<$Res> get auction;

}
/// @nodoc
class _$AuctionBoardCopyWithImpl<$Res>
    implements $AuctionBoardCopyWith<$Res> {
  _$AuctionBoardCopyWithImpl(this._self, this._then);

  final AuctionBoard _self;
  final $Res Function(AuctionBoard) _then;

/// Create a copy of AuctionBoard
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? auction = null,Object? pointsBalance = null,}) {
  return _then(AuctionBoard(
auction: null == auction ? _self.auction : auction // ignore: cast_nullable_to_non_nullable
as Auction,pointsBalance: null == pointsBalance ? _self.pointsBalance : pointsBalance // ignore: cast_nullable_to_non_nullable
as int,
  ));
}
/// Create a copy of AuctionBoard
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuctionCopyWith<$Res> get auction {
  
  return $AuctionCopyWith<$Res>(_self.auction, (value) {
    return _then(_self.copyWith(auction: value));
  });
}
}


/// Adds pattern-matching-related methods to [AuctionBoard].
extension AuctionBoardPatterns on AuctionBoard {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuctionBoard value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuctionBoard() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuctionBoard value)  $default,){
final _that = this;
switch (_that) {
case _AuctionBoard():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuctionBoard value)?  $default,){
final _that = this;
switch (_that) {
case _AuctionBoard() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( Auction auction,  int pointsBalance)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuctionBoard() when $default != null:
return $default(_that.auction,_that.pointsBalance);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( Auction auction,  int pointsBalance)  $default,) {final _that = this;
switch (_that) {
case _AuctionBoard():
return $default(_that.auction,_that.pointsBalance);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( Auction auction,  int pointsBalance)?  $default,) {final _that = this;
switch (_that) {
case _AuctionBoard() when $default != null:
return $default(_that.auction,_that.pointsBalance);case _:
  return null;

}
}

}

/// @nodoc


class _AuctionBoard implements AuctionBoard {
  const _AuctionBoard({required this.auction, required this.pointsBalance});
  

@override final  Auction auction;
@override final  int pointsBalance;

/// Create a copy of AuctionBoard
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuctionBoardCopyWith<_AuctionBoard> get copyWith => __$AuctionBoardCopyWithImpl<_AuctionBoard>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuctionBoard&&(identical(other.auction, auction) || other.auction == auction)&&(identical(other.pointsBalance, pointsBalance) || other.pointsBalance == pointsBalance));
}


@override
int get hashCode {
    return Object.hash(runtimeType,auction,pointsBalance);
}

@override
String toString() {
    return 'AuctionBoard(auction: $auction, pointsBalance: $pointsBalance)';
}


}

/// @nodoc
abstract mixin class _$AuctionBoardCopyWith<$Res> implements $AuctionBoardCopyWith<$Res> {
  factory _$AuctionBoardCopyWith(_AuctionBoard value, $Res Function(_AuctionBoard) _then) = __$AuctionBoardCopyWithImpl;
@override @useResult
$Res call({
 Auction auction, int pointsBalance
});


@override $AuctionCopyWith<$Res> get auction;

}
/// @nodoc
class __$AuctionBoardCopyWithImpl<$Res>
    implements _$AuctionBoardCopyWith<$Res> {
  __$AuctionBoardCopyWithImpl(this._self, this._then);

  final _AuctionBoard _self;
  final $Res Function(_AuctionBoard) _then;

/// Create a copy of AuctionBoard
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? auction = null,Object? pointsBalance = null,}) {
  return _then(_AuctionBoard(
auction: null == auction ? _self.auction : auction // ignore: cast_nullable_to_non_nullable
as Auction,pointsBalance: null == pointsBalance ? _self.pointsBalance : pointsBalance // ignore: cast_nullable_to_non_nullable
as int,
  ));
}

/// Create a copy of AuctionBoard
/// with the given fields replaced by the non-null parameter values.
@override
@pragma('vm:prefer-inline')
$AuctionCopyWith<$Res> get auction {
  
  return $AuctionCopyWith<$Res>(_self.auction, (value) {
    return _then(_self.copyWith(auction: value));
  });
}
}

/// @nodoc
mixin _$Auction {

 String get id; String get title; String get description; String get imageAsset; int get currentBid; int get minimumIncrement; int get watching; DateTime get endsAt; List<AuctionBid> get bids; List<int> get quickIncrements;
/// Create a copy of Auction
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuctionCopyWith<Auction> get copyWith => _$AuctionCopyWithImpl<Auction>(this as Auction, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as Auction;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is Auction&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.title, _this.title) || other.title == _this.title)&&(identical(other.description, _this.description) || other.description == _this.description)&&(identical(other.imageAsset, _this.imageAsset) || other.imageAsset == _this.imageAsset)&&(identical(other.currentBid, _this.currentBid) || other.currentBid == _this.currentBid)&&(identical(other.minimumIncrement, _this.minimumIncrement) || other.minimumIncrement == _this.minimumIncrement)&&(identical(other.watching, _this.watching) || other.watching == _this.watching)&&(identical(other.endsAt, _this.endsAt) || other.endsAt == _this.endsAt)&&const DeepCollectionEquality().equals(other.bids, _this.bids)&&const DeepCollectionEquality().equals(other.quickIncrements, _this.quickIncrements));
}


@override
int get hashCode {
  final _this = this as Auction;
  return Object.hash(runtimeType,_this.id,_this.title,_this.description,_this.imageAsset,_this.currentBid,_this.minimumIncrement,_this.watching,_this.endsAt,const DeepCollectionEquality().hash(_this.bids),const DeepCollectionEquality().hash(_this.quickIncrements));
}

@override
String toString() {
  final _this = this as Auction;
  return 'Auction(id: ${_this.id}, title: ${_this.title}, description: ${_this.description}, imageAsset: ${_this.imageAsset}, currentBid: ${_this.currentBid}, minimumIncrement: ${_this.minimumIncrement}, watching: ${_this.watching}, endsAt: ${_this.endsAt}, bids: ${_this.bids}, quickIncrements: ${_this.quickIncrements})';
}


}

/// @nodoc
abstract mixin class $AuctionCopyWith<$Res>  {
  factory $AuctionCopyWith(Auction value, $Res Function(Auction) _then) = _$AuctionCopyWithImpl;
@useResult
$Res call({
 String id, String title, String description, String imageAsset, int currentBid, int minimumIncrement, int watching, DateTime endsAt, List<AuctionBid> bids, List<int> quickIncrements
});




}
/// @nodoc
class _$AuctionCopyWithImpl<$Res>
    implements $AuctionCopyWith<$Res> {
  _$AuctionCopyWithImpl(this._self, this._then);

  final Auction _self;
  final $Res Function(Auction) _then;

/// Create a copy of Auction
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? title = null,Object? description = null,Object? imageAsset = null,Object? currentBid = null,Object? minimumIncrement = null,Object? watching = null,Object? endsAt = null,Object? bids = null,Object? quickIncrements = null,}) {
  return _then(Auction(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,currentBid: null == currentBid ? _self.currentBid : currentBid // ignore: cast_nullable_to_non_nullable
as int,minimumIncrement: null == minimumIncrement ? _self.minimumIncrement : minimumIncrement // ignore: cast_nullable_to_non_nullable
as int,watching: null == watching ? _self.watching : watching // ignore: cast_nullable_to_non_nullable
as int,endsAt: null == endsAt ? _self.endsAt : endsAt // ignore: cast_nullable_to_non_nullable
as DateTime,bids: null == bids ? _self.bids : bids // ignore: cast_nullable_to_non_nullable
as List<AuctionBid>,quickIncrements: null == quickIncrements ? _self.quickIncrements : quickIncrements // ignore: cast_nullable_to_non_nullable
as List<int>,
  ));
}

}


/// Adds pattern-matching-related methods to [Auction].
extension AuctionPatterns on Auction {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _Auction value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _Auction() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _Auction value)  $default,){
final _that = this;
switch (_that) {
case _Auction():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _Auction value)?  $default,){
final _that = this;
switch (_that) {
case _Auction() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  String title,  String description,  String imageAsset,  int currentBid,  int minimumIncrement,  int watching,  DateTime endsAt,  List<AuctionBid> bids,  List<int> quickIncrements)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _Auction() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.currentBid,_that.minimumIncrement,_that.watching,_that.endsAt,_that.bids,_that.quickIncrements);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  String title,  String description,  String imageAsset,  int currentBid,  int minimumIncrement,  int watching,  DateTime endsAt,  List<AuctionBid> bids,  List<int> quickIncrements)  $default,) {final _that = this;
switch (_that) {
case _Auction():
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.currentBid,_that.minimumIncrement,_that.watching,_that.endsAt,_that.bids,_that.quickIncrements);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  String title,  String description,  String imageAsset,  int currentBid,  int minimumIncrement,  int watching,  DateTime endsAt,  List<AuctionBid> bids,  List<int> quickIncrements)?  $default,) {final _that = this;
switch (_that) {
case _Auction() when $default != null:
return $default(_that.id,_that.title,_that.description,_that.imageAsset,_that.currentBid,_that.minimumIncrement,_that.watching,_that.endsAt,_that.bids,_that.quickIncrements);case _:
  return null;

}
}

}

/// @nodoc


class _Auction implements Auction {
  const _Auction({required this.id, required this.title, required this.description, required this.imageAsset, required this.currentBid, required this.minimumIncrement, required this.watching, required this.endsAt, required  List<AuctionBid> bids, required  List<int> quickIncrements}): _bids = bids,_quickIncrements = quickIncrements;
  

@override final  String id;
@override final  String title;
@override final  String description;
@override final  String imageAsset;
@override final  int currentBid;
@override final  int minimumIncrement;
@override final  int watching;
@override final  DateTime endsAt;
 final  List<AuctionBid> _bids;
@override List<AuctionBid> get bids {
  if (_bids is EqualUnmodifiableListView) return _bids;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_bids);
}

 final  List<int> _quickIncrements;
@override List<int> get quickIncrements {
  if (_quickIncrements is EqualUnmodifiableListView) return _quickIncrements;
  // ignore: implicit_dynamic_type
  return EqualUnmodifiableListView(_quickIncrements);
}


/// Create a copy of Auction
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuctionCopyWith<_Auction> get copyWith => __$AuctionCopyWithImpl<_Auction>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _Auction&&(identical(other.id, id) || other.id == id)&&(identical(other.title, title) || other.title == title)&&(identical(other.description, description) || other.description == description)&&(identical(other.imageAsset, imageAsset) || other.imageAsset == imageAsset)&&(identical(other.currentBid, currentBid) || other.currentBid == currentBid)&&(identical(other.minimumIncrement, minimumIncrement) || other.minimumIncrement == minimumIncrement)&&(identical(other.watching, watching) || other.watching == watching)&&(identical(other.endsAt, endsAt) || other.endsAt == endsAt)&&const DeepCollectionEquality().equals(other.bids, _bids)&&const DeepCollectionEquality().equals(other.quickIncrements, _quickIncrements));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,title,description,imageAsset,currentBid,minimumIncrement,watching,endsAt,const DeepCollectionEquality().hash(_bids),const DeepCollectionEquality().hash(_quickIncrements));
}

@override
String toString() {
    return 'Auction(id: $id, title: $title, description: $description, imageAsset: $imageAsset, currentBid: $currentBid, minimumIncrement: $minimumIncrement, watching: $watching, endsAt: $endsAt, bids: $bids, quickIncrements: $quickIncrements)';
}


}

/// @nodoc
abstract mixin class _$AuctionCopyWith<$Res> implements $AuctionCopyWith<$Res> {
  factory _$AuctionCopyWith(_Auction value, $Res Function(_Auction) _then) = __$AuctionCopyWithImpl;
@override @useResult
$Res call({
 String id, String title, String description, String imageAsset, int currentBid, int minimumIncrement, int watching, DateTime endsAt, List<AuctionBid> bids, List<int> quickIncrements
});




}
/// @nodoc
class __$AuctionCopyWithImpl<$Res>
    implements _$AuctionCopyWith<$Res> {
  __$AuctionCopyWithImpl(this._self, this._then);

  final _Auction _self;
  final $Res Function(_Auction) _then;

/// Create a copy of Auction
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? title = null,Object? description = null,Object? imageAsset = null,Object? currentBid = null,Object? minimumIncrement = null,Object? watching = null,Object? endsAt = null,Object? bids = null,Object? quickIncrements = null,}) {
  return _then(_Auction(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,title: null == title ? _self.title : title // ignore: cast_nullable_to_non_nullable
as String,description: null == description ? _self.description : description // ignore: cast_nullable_to_non_nullable
as String,imageAsset: null == imageAsset ? _self.imageAsset : imageAsset // ignore: cast_nullable_to_non_nullable
as String,currentBid: null == currentBid ? _self.currentBid : currentBid // ignore: cast_nullable_to_non_nullable
as int,minimumIncrement: null == minimumIncrement ? _self.minimumIncrement : minimumIncrement // ignore: cast_nullable_to_non_nullable
as int,watching: null == watching ? _self.watching : watching // ignore: cast_nullable_to_non_nullable
as int,endsAt: null == endsAt ? _self.endsAt : endsAt // ignore: cast_nullable_to_non_nullable
as DateTime,bids: null == bids ? _self._bids : bids // ignore: cast_nullable_to_non_nullable
as List<AuctionBid>,quickIncrements: null == quickIncrements ? _self._quickIncrements : quickIncrements // ignore: cast_nullable_to_non_nullable
as List<int>,
  ));
}


}

/// @nodoc
mixin _$AuctionBid {

 String get bidderName; int get amount; DateTime get placedAt; bool get isLeading;
/// Create a copy of AuctionBid
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$AuctionBidCopyWith<AuctionBid> get copyWith => _$AuctionBidCopyWithImpl<AuctionBid>(this as AuctionBid, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as AuctionBid;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is AuctionBid&&(identical(other.bidderName, _this.bidderName) || other.bidderName == _this.bidderName)&&(identical(other.amount, _this.amount) || other.amount == _this.amount)&&(identical(other.placedAt, _this.placedAt) || other.placedAt == _this.placedAt)&&(identical(other.isLeading, _this.isLeading) || other.isLeading == _this.isLeading));
}


@override
int get hashCode {
  final _this = this as AuctionBid;
  return Object.hash(runtimeType,_this.bidderName,_this.amount,_this.placedAt,_this.isLeading);
}

@override
String toString() {
  final _this = this as AuctionBid;
  return 'AuctionBid(bidderName: ${_this.bidderName}, amount: ${_this.amount}, placedAt: ${_this.placedAt}, isLeading: ${_this.isLeading})';
}


}

/// @nodoc
abstract mixin class $AuctionBidCopyWith<$Res>  {
  factory $AuctionBidCopyWith(AuctionBid value, $Res Function(AuctionBid) _then) = _$AuctionBidCopyWithImpl;
@useResult
$Res call({
 String bidderName, int amount, DateTime placedAt, bool isLeading
});




}
/// @nodoc
class _$AuctionBidCopyWithImpl<$Res>
    implements $AuctionBidCopyWith<$Res> {
  _$AuctionBidCopyWithImpl(this._self, this._then);

  final AuctionBid _self;
  final $Res Function(AuctionBid) _then;

/// Create a copy of AuctionBid
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? bidderName = null,Object? amount = null,Object? placedAt = null,Object? isLeading = null,}) {
  return _then(AuctionBid(
bidderName: null == bidderName ? _self.bidderName : bidderName // ignore: cast_nullable_to_non_nullable
as String,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as int,placedAt: null == placedAt ? _self.placedAt : placedAt // ignore: cast_nullable_to_non_nullable
as DateTime,isLeading: null == isLeading ? _self.isLeading : isLeading // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}

}


/// Adds pattern-matching-related methods to [AuctionBid].
extension AuctionBidPatterns on AuctionBid {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _AuctionBid value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _AuctionBid() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _AuctionBid value)  $default,){
final _that = this;
switch (_that) {
case _AuctionBid():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _AuctionBid value)?  $default,){
final _that = this;
switch (_that) {
case _AuctionBid() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String bidderName,  int amount,  DateTime placedAt,  bool isLeading)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _AuctionBid() when $default != null:
return $default(_that.bidderName,_that.amount,_that.placedAt,_that.isLeading);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String bidderName,  int amount,  DateTime placedAt,  bool isLeading)  $default,) {final _that = this;
switch (_that) {
case _AuctionBid():
return $default(_that.bidderName,_that.amount,_that.placedAt,_that.isLeading);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String bidderName,  int amount,  DateTime placedAt,  bool isLeading)?  $default,) {final _that = this;
switch (_that) {
case _AuctionBid() when $default != null:
return $default(_that.bidderName,_that.amount,_that.placedAt,_that.isLeading);case _:
  return null;

}
}

}

/// @nodoc


class _AuctionBid implements AuctionBid {
  const _AuctionBid({required this.bidderName, required this.amount, required this.placedAt, this.isLeading = false});
  

@override final  String bidderName;
@override final  int amount;
@override final  DateTime placedAt;
@override@JsonKey() final  bool isLeading;

/// Create a copy of AuctionBid
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$AuctionBidCopyWith<_AuctionBid> get copyWith => __$AuctionBidCopyWithImpl<_AuctionBid>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _AuctionBid&&(identical(other.bidderName, bidderName) || other.bidderName == bidderName)&&(identical(other.amount, amount) || other.amount == amount)&&(identical(other.placedAt, placedAt) || other.placedAt == placedAt)&&(identical(other.isLeading, isLeading) || other.isLeading == isLeading));
}


@override
int get hashCode {
    return Object.hash(runtimeType,bidderName,amount,placedAt,isLeading);
}

@override
String toString() {
    return 'AuctionBid(bidderName: $bidderName, amount: $amount, placedAt: $placedAt, isLeading: $isLeading)';
}


}

/// @nodoc
abstract mixin class _$AuctionBidCopyWith<$Res> implements $AuctionBidCopyWith<$Res> {
  factory _$AuctionBidCopyWith(_AuctionBid value, $Res Function(_AuctionBid) _then) = __$AuctionBidCopyWithImpl;
@override @useResult
$Res call({
 String bidderName, int amount, DateTime placedAt, bool isLeading
});




}
/// @nodoc
class __$AuctionBidCopyWithImpl<$Res>
    implements _$AuctionBidCopyWith<$Res> {
  __$AuctionBidCopyWithImpl(this._self, this._then);

  final _AuctionBid _self;
  final $Res Function(_AuctionBid) _then;

/// Create a copy of AuctionBid
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? bidderName = null,Object? amount = null,Object? placedAt = null,Object? isLeading = null,}) {
  return _then(_AuctionBid(
bidderName: null == bidderName ? _self.bidderName : bidderName // ignore: cast_nullable_to_non_nullable
as String,amount: null == amount ? _self.amount : amount // ignore: cast_nullable_to_non_nullable
as int,placedAt: null == placedAt ? _self.placedAt : placedAt // ignore: cast_nullable_to_non_nullable
as DateTime,isLeading: null == isLeading ? _self.isLeading : isLeading // ignore: cast_nullable_to_non_nullable
as bool,
  ));
}


}

/// @nodoc
mixin _$PointsPack {

 String get id; int get points; String get priceLabel;
/// Create a copy of PointsPack
/// with the given fields replaced by the non-null parameter values.
@JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
$PointsPackCopyWith<PointsPack> get copyWith => _$PointsPackCopyWithImpl<PointsPack>(this as PointsPack, _$identity);



@override
bool operator ==(Object other) {
  final _this = this as PointsPack;
  return identical(this, other) || (other.runtimeType == runtimeType&&other is PointsPack&&(identical(other.id, _this.id) || other.id == _this.id)&&(identical(other.points, _this.points) || other.points == _this.points)&&(identical(other.priceLabel, _this.priceLabel) || other.priceLabel == _this.priceLabel));
}


@override
int get hashCode {
  final _this = this as PointsPack;
  return Object.hash(runtimeType,_this.id,_this.points,_this.priceLabel);
}

@override
String toString() {
  final _this = this as PointsPack;
  return 'PointsPack(id: ${_this.id}, points: ${_this.points}, priceLabel: ${_this.priceLabel})';
}


}

/// @nodoc
abstract mixin class $PointsPackCopyWith<$Res>  {
  factory $PointsPackCopyWith(PointsPack value, $Res Function(PointsPack) _then) = _$PointsPackCopyWithImpl;
@useResult
$Res call({
 String id, int points, String priceLabel
});




}
/// @nodoc
class _$PointsPackCopyWithImpl<$Res>
    implements $PointsPackCopyWith<$Res> {
  _$PointsPackCopyWithImpl(this._self, this._then);

  final PointsPack _self;
  final $Res Function(PointsPack) _then;

/// Create a copy of PointsPack
/// with the given fields replaced by the non-null parameter values.
@pragma('vm:prefer-inline') @override $Res call({Object? id = null,Object? points = null,Object? priceLabel = null,}) {
  return _then(PointsPack(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,priceLabel: null == priceLabel ? _self.priceLabel : priceLabel // ignore: cast_nullable_to_non_nullable
as String,
  ));
}

}


/// Adds pattern-matching-related methods to [PointsPack].
extension PointsPackPatterns on PointsPack {
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

@optionalTypeArgs TResult maybeMap<TResult extends Object?>(TResult Function( _PointsPack value)?  $default,{required TResult orElse(),}){
final _that = this;
switch (_that) {
case _PointsPack() when $default != null:
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

@optionalTypeArgs TResult map<TResult extends Object?>(TResult Function( _PointsPack value)  $default,){
final _that = this;
switch (_that) {
case _PointsPack():
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

@optionalTypeArgs TResult? mapOrNull<TResult extends Object?>(TResult? Function( _PointsPack value)?  $default,){
final _that = this;
switch (_that) {
case _PointsPack() when $default != null:
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

@optionalTypeArgs TResult maybeWhen<TResult extends Object?>(TResult Function( String id,  int points,  String priceLabel)?  $default,{required TResult orElse(),}) {final _that = this;
switch (_that) {
case _PointsPack() when $default != null:
return $default(_that.id,_that.points,_that.priceLabel);case _:
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

@optionalTypeArgs TResult when<TResult extends Object?>(TResult Function( String id,  int points,  String priceLabel)  $default,) {final _that = this;
switch (_that) {
case _PointsPack():
return $default(_that.id,_that.points,_that.priceLabel);case _:
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

@optionalTypeArgs TResult? whenOrNull<TResult extends Object?>(TResult? Function( String id,  int points,  String priceLabel)?  $default,) {final _that = this;
switch (_that) {
case _PointsPack() when $default != null:
return $default(_that.id,_that.points,_that.priceLabel);case _:
  return null;

}
}

}

/// @nodoc


class _PointsPack implements PointsPack {
  const _PointsPack({required this.id, required this.points, required this.priceLabel});
  

@override final  String id;
@override final  int points;
@override final  String priceLabel;

/// Create a copy of PointsPack
/// with the given fields replaced by the non-null parameter values.
@override @JsonKey(includeFromJson: false, includeToJson: false)
@pragma('vm:prefer-inline')
_$PointsPackCopyWith<_PointsPack> get copyWith => __$PointsPackCopyWithImpl<_PointsPack>(this, _$identity);



@override
bool operator ==(Object other) {
    return identical(this, other) || (other.runtimeType == runtimeType&&other is _PointsPack&&(identical(other.id, id) || other.id == id)&&(identical(other.points, points) || other.points == points)&&(identical(other.priceLabel, priceLabel) || other.priceLabel == priceLabel));
}


@override
int get hashCode {
    return Object.hash(runtimeType,id,points,priceLabel);
}

@override
String toString() {
    return 'PointsPack(id: $id, points: $points, priceLabel: $priceLabel)';
}


}

/// @nodoc
abstract mixin class _$PointsPackCopyWith<$Res> implements $PointsPackCopyWith<$Res> {
  factory _$PointsPackCopyWith(_PointsPack value, $Res Function(_PointsPack) _then) = __$PointsPackCopyWithImpl;
@override @useResult
$Res call({
 String id, int points, String priceLabel
});




}
/// @nodoc
class __$PointsPackCopyWithImpl<$Res>
    implements _$PointsPackCopyWith<$Res> {
  __$PointsPackCopyWithImpl(this._self, this._then);

  final _PointsPack _self;
  final $Res Function(_PointsPack) _then;

/// Create a copy of PointsPack
/// with the given fields replaced by the non-null parameter values.
@override @pragma('vm:prefer-inline') $Res call({Object? id = null,Object? points = null,Object? priceLabel = null,}) {
  return _then(_PointsPack(
id: null == id ? _self.id : id // ignore: cast_nullable_to_non_nullable
as String,points: null == points ? _self.points : points // ignore: cast_nullable_to_non_nullable
as int,priceLabel: null == priceLabel ? _self.priceLabel : priceLabel // ignore: cast_nullable_to_non_nullable
as String,
  ));
}


}

// dart format on
