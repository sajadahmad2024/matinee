// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_Profile _$ProfileFromJson(Map<String, dynamic> json) => _Profile(
  name: json['name'] as String,
  email: json['email'] as String,
  phoneNumber: json['phoneNumber'] as String,
  totalPoints: (json['totalPoints'] as num).toInt(),
  streaks: (json['streaks'] as num).toInt(),
  rank: (json['rank'] as num).toInt(),
  referralCode: json['referralCode'] as String,
  planName: json['planName'] as String,
  planExpiresOn: DateTime.parse(json['planExpiresOn'] as String),
  avatarUrl: json['avatarUrl'] as String?,
);

Map<String, dynamic> _$ProfileToJson(_Profile instance) => <String, dynamic>{
  'name': instance.name,
  'email': instance.email,
  'phoneNumber': instance.phoneNumber,
  'totalPoints': instance.totalPoints,
  'streaks': instance.streaks,
  'rank': instance.rank,
  'referralCode': instance.referralCode,
  'planName': instance.planName,
  'planExpiresOn': instance.planExpiresOn.toIso8601String(),
  'avatarUrl': instance.avatarUrl,
};
