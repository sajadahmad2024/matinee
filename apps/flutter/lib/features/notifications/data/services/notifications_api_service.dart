import 'package:matinee/features/notifications/data/models/app_notification.dart';

///
/// Stands in for the notifications inbox until the API exists. Times are set
/// from the moment the app starts, so the relative stamps always read as drawn.
///
class NotificationsApiService {
  NotificationsApiService() : _startedAt = DateTime.now();

  static const Duration mockLatency = Duration(milliseconds: 600);

  final DateTime _startedAt;
  final Set<String> _readIds = {'n-4', 'n-5'};

  Future<List<AppNotification>> fetchNotifications() async {
    await Future<void>.delayed(mockLatency);
    return _inbox();
  }

  Future<List<AppNotification>> markAsRead(String id) async {
    await Future<void>.delayed(mockLatency);
    _readIds.add(id);
    return _inbox();
  }

  Future<List<AppNotification>> markAllAsRead() async {
    await Future<void>.delayed(mockLatency);
    _readIds.addAll(_seed().map((notification) => notification.id));
    return _inbox();
  }

  List<AppNotification> _inbox() => [
    for (final notification in _seed()) notification.copyWith(isRead: _readIds.contains(notification.id)),
  ];

  List<AppNotification> _seed() => [
    AppNotification(
      id: 'n-1',
      category: NotificationCategory.auctions,
      title: 'Outbid on Premiere Pass',
      body: const [
        NotificationSpan('Alex R.', tone: NotificationSpanTone.emphasis),
        NotificationSpan(' placed a bid of '),
        NotificationSpan('10,500 CP', tone: NotificationSpanTone.accent),
        NotificationSpan('. Reclaim the highest bid before timer ends!'),
      ],
      receivedAt: _startedAt.subtract(const Duration(minutes: 5)),
      isUrgent: true,
      footer: NotificationFooter.auctionBid(
        endsAt: _startedAt.add(const Duration(hours: 4, minutes: 11, seconds: 56)),
      ),
    ),
    AppNotification(
      id: 'n-2',
      category: NotificationCategory.questsAndStreaks,
      title: 'Daily Streak at Risk 🔥',
      body: const [
        NotificationSpan('Only '),
        NotificationSpan('23 minutes remaining', tone: NotificationSpanTone.warning),
        NotificationSpan(" to claim today's check-in and keep your 257 streak alive!"),
      ],
      receivedAt: _startedAt.subtract(const Duration(hours: 3)),
      footer: const NotificationFooter.streakCheckIn(),
    ),
    AppNotification(
      id: 'n-3',
      category: NotificationCategory.questsAndStreaks,
      title: 'Weekly Quest Completed',
      body: const [
        NotificationSpan('You completed '),
        NotificationSpan('Trailer Marathon', tone: NotificationSpanTone.emphasis),
        NotificationSpan('. Reward points credited directly to your balance.'),
      ],
      receivedAt: _startedAt.subtract(const Duration(hours: 5)),
      footer: const NotificationFooter.pointsCredited(points: 500, balance: 2500),
    ),
    AppNotification(
      id: 'n-4',
      category: NotificationCategory.questsAndStreaks,
      title: 'Prediction Won: Neon Noir',
      body: const [
        NotificationSpan('Your box-office forecast landed in top 5%. 2X multiplier applied to your wager pool.'),
      ],
      receivedAt: _startedAt.subtract(const Duration(days: 1)),
      footer: const NotificationFooter.pointsAdded(points: 1000),
    ),
    AppNotification(
      id: 'n-5',
      category: NotificationCategory.system,
      title: 'Pro Plan Renewal Notice',
      body: const [
        NotificationSpan('Your Pro perks (zero platform fees, priority auction access) are active until '),
        NotificationSpan('Jun 30, 2026.', tone: NotificationSpanTone.strong),
      ],
      receivedAt: _startedAt.subtract(const Duration(days: 3)),
    ),
  ];
}
