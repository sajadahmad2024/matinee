import 'package:freezed_annotation/freezed_annotation.dart';

part 'app_notification.freezed.dart';

/// The filter a notification falls under. Prediction results count as quests.
enum NotificationCategory { auctions, questsAndStreaks, system }

/// How a run of body text is set against the plain copy around it.
enum NotificationSpanTone { plain, emphasis, strong, accent, warning }

///
/// One run of a notification's body. The server marks the names, amounts and
/// deadlines it wants to stand out, so the card never parses the copy.
///
@freezed
abstract class NotificationSpan with _$NotificationSpan {
  const factory NotificationSpan(
    String text, {
    @Default(NotificationSpanTone.plain) NotificationSpanTone tone,
  }) = _NotificationSpan;
}

/// What a card offers under its body, when it offers anything.
@freezed
sealed class NotificationFooter with _$NotificationFooter {
  /// The lot's countdown.
  const factory NotificationFooter.auctionCountdown({required DateTime endsAt}) = AuctionCountdownFooter;

  /// Points a quest paid out, beside the balance they landed in.
  const factory NotificationFooter.pointsCredited({required int points, required int balance}) = PointsCreditedFooter;

  /// Points a finished game added, without the balance.
  const factory NotificationFooter.pointsAdded({required int points}) = PointsAddedFooter;
}

///
/// One entry in the inbox. [isUrgent] marks the ones that lose the user
/// something if left, which the card flags beside the title.
///
/// [deepLink] is where the notification leads, when it leads anywhere; the
/// card draws an arrow for it.
///
@freezed
abstract class AppNotification with _$AppNotification {
  const factory AppNotification({
    required String id,
    required NotificationCategory category,
    required String title,
    required List<NotificationSpan> body,
    required DateTime receivedAt,
    @Default(false) bool isRead,
    @Default(false) bool isUrgent,
    NotificationFooter? footer,
    String? deepLink,
  }) = _AppNotification;
}
