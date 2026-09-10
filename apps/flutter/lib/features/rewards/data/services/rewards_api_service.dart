import 'dart:async';

import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/features/rewards/data/models/auction.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/models/rewards_summary.dart';

///
/// Stands in for the rewards endpoints until the API exists. It answers after
/// a short delay so the screens exercise their loading states, and holds the
/// balance, the bids and the unlocked items in memory so spending points on
/// one screen is visible on the next.
///
class RewardsApiService {
  RewardsApiService();

  static const Duration mockLatency = Duration(milliseconds: 600);

  ///
  /// The auction ends a fixed span from the moment the app starts rather than
  /// at a stored instant, so the countdown is always mid-flight in a demo.
  ///
  static const Duration _auctionRunsFor = Duration(hours: 2, minutes: 11, seconds: 56);

  final DateTime _startedAt = DateTime.now();

  ///
  /// The balance is the one value more than one screen shows, so a change to
  /// it is broadcast rather than left for each screen to notice on its own.
  /// The service is a lazy singleton that lives as long as the app, so the
  /// controller is never closed.
  ///
  final StreamController<int> _pointsChanges = StreamController<int>.broadcast();

  int _points = 7082;

  Stream<int> get pointsChanges => _pointsChanges.stream;

  void _setPoints(int value) {
    _points = value;
    _pointsChanges.add(value);
  }

  late List<AuctionBid> _bids = _seedBids;

  Set<String> _unlockedItemIds = const {'ex-1', 'ex-3', 'ex-5', 'ex-7', 'ex-8'};

  Future<RewardsSummary> fetchSummary() async {
    await Future<void>.delayed(mockLatency);
    return RewardsSummary(
      totalPoints: _points,
      badgeName: 'Expert',
      pointsToNextBadge: 918,
      nextBadgeName: 'Loyalist',
      destinations: const [
        RedeemDestination(
          kind: RedeemKind.liveAuction,
          category: 'AUCTION',
          title: 'Live Auction',
          subtitle: 'Watch trailers & complete missions',
          imageAsset: AppImageAssets.rewardsAuctionCard,
        ),
        RedeemDestination(
          kind: RedeemKind.exclusiveContent,
          category: 'BTS & TRAILERS',
          title: 'Exclusive Content',
          subtitle: 'Get access to exclusive BTS & trailers',
          imageAsset: AppImageAssets.rewardsExclusiveCard,
        ),
      ],
    );
  }

  Future<AuctionBoard> fetchAuctionBoard() async {
    await Future<void>.delayed(mockLatency);
    return AuctionBoard(auction: _auction, pointsBalance: _points);
  }

  ///
  /// Bidding prepends the new bid and hands back the lot, so the history and
  /// the current bid move together.
  ///
  Future<AuctionBoard> placeBid(int amount) async {
    await Future<void>.delayed(mockLatency);
    _bids = [
      AuctionBid(bidderName: 'You', amount: amount, placedAt: DateTime.now(), isLeading: true),
      for (final bid in _bids) bid.copyWith(isLeading: false),
    ];
    return AuctionBoard(auction: _auction, pointsBalance: _points);
  }

  Future<List<PointsPack>> fetchPointsPacks() async {
    await Future<void>.delayed(mockLatency);
    return const [
      PointsPack(id: 'pack-500', points: 500, priceLabel: '₹79'),
      PointsPack(id: 'pack-1500', points: 1500, priceLabel: '₹199'),
      PointsPack(id: 'pack-5000', points: 5000, priceLabel: '₹499'),
    ];
  }

  ///
  /// Stands in for the payment gateway, which a later change hands off to. The
  /// points land as soon as it answers.
  ///
  Future<int> purchasePointsPack(PointsPack pack) async {
    await Future<void>.delayed(mockLatency);
    _setPoints(_points + pack.points);
    return _points;
  }

  Future<ExclusiveLibrary> fetchLibrary({String? filter}) async {
    await Future<void>.delayed(mockLatency);
    final selected = filter ?? _defaultFilter;
    return ExclusiveLibrary(
      filters: _filters,
      selectedFilter: selected,
      items: [
        for (final item in _catalogue)
          if (selected == _defaultFilter || item.category == selected)
            item.copyWith(isUnlocked: _unlockedItemIds.contains(item.id)),
      ],
    );
  }

  Future<ExclusiveItem> fetchItem(String id) async {
    await Future<void>.delayed(mockLatency);
    final item = _find(id);
    return item.copyWith(isUnlocked: _unlockedItemIds.contains(item.id));
  }

  ///
  /// Unlocking debits the balance and remembers the item, so coming back to
  /// the library shows it open.
  ///
  Future<ExclusiveItem> unlockItem(String id) async {
    await Future<void>.delayed(mockLatency);
    final item = _find(id);
    if (!_unlockedItemIds.contains(id)) {
      if (item.unlockCost > _points) {
        throw const ValidationException(402);
      }
      _setPoints(_points - item.unlockCost);
      _unlockedItemIds = {..._unlockedItemIds, id};
    }
    return item.copyWith(isUnlocked: true);
  }

  ///
  /// An id the catalogue does not hold is a 404, not a StateError: the cubits
  /// catch AppException only, and everything else reaches the global net.
  ///
  ExclusiveItem _find(String id) {
    for (final item in _catalogue) {
      if (item.id == id) {
        return item;
      }
    }
    throw const NotFoundException();
  }

  Auction get _auction {
    return Auction(
      id: 'auction-1',
      title: 'Exclusive Premiere Pass',
      description:
          "Unlock access to the global digital gala of 'Neon Noir' including live cast Q&A "
          'and limited NFT memorabilia.',
      imageAsset: AppImageAssets.auctionHero,
      currentBid: _bids.first.amount,
      minimumIncrement: 100,
      watching: 1204,
      endsAt: _startedAt.add(_auctionRunsFor),
      bids: _bids,
      quickIncrements: const [500, 1000, 1500, 2000],
    );
  }

  ///
  /// The bids the lot starts a demo with. Read once, when `_bids` is first
  /// touched, so the placed-at times stay put.
  ///
  List<AuctionBid> get _seedBids {
    return [
      AuctionBid(
        bidderName: 'Alex R.',
        amount: 10500,
        placedAt: _startedAt.subtract(const Duration(minutes: 2)),
        isLeading: true,
      ),
      AuctionBid(
        bidderName: 'Sarah Johnson',
        amount: 10000,
        placedAt: _startedAt.subtract(const Duration(minutes: 5)),
      ),
      AuctionBid(
        bidderName: 'Morgan Smith',
        amount: 9500,
        placedAt: _startedAt.subtract(const Duration(minutes: 10)),
      ),
    ];
  }

  static const String _defaultFilter = 'Recommended';

  static const List<String> _filters = [_defaultFilter, 'Horror', 'Thriller', 'New'];

  ///
  /// The grid the design draws: nine tiles, five of them already open. Every
  /// tile carries the copy the unlock screen shows, so opening one needs no
  /// second fetch.
  ///
  static const List<ExclusiveItem> _catalogue = [
    ExclusiveItem(
      id: 'ex-1',
      title: 'Night Shift',
      category: 'Thriller',
      unlockCost: 500,
      preview:
          'Behind the scenes: The making of the IMAX sequence. Exclusive interviews and '
          'never-before-seen footage from the set.',
      castAndCrew: 'Christopher Nolan · Hoyte van Hoytema',
      imageAsset: AppImageAssets.exclusive1,
    ),
    ExclusiveItem(
      id: 'ex-2',
      title: 'BTS Video',
      category: 'Horror',
      unlockCost: 500,
      preview:
          'Behind the scenes: The making of the IMAX sequence. Exclusive interviews and '
          'never-before-seen footage from the set.',
      castAndCrew: 'Christopher Nolan · Hoyte van Hoytema',
      imageAsset: AppImageAssets.exclusive5,
    ),
    ExclusiveItem(
      id: 'ex-3',
      title: 'The Silhouette',
      category: 'Thriller',
      unlockCost: 500,
      preview:
          'A frame-by-frame look at the title sequence and the practical lighting rig '
          'built for it.',
      castAndCrew: 'Denis Villeneuve · Roger Deakins',
      imageAsset: AppImageAssets.exclusive2,
    ),
    ExclusiveItem(
      id: 'ex-4',
      title: 'Cold Open',
      category: 'Horror',
      unlockCost: 750,
      preview: 'The stunt team walks through the opening chase, shot in a single take.',
      castAndCrew: 'Chad Stahelski · Dan Laustsen',
      imageAsset: AppImageAssets.exclusive1,
    ),
    ExclusiveItem(
      id: 'ex-5',
      title: 'Doorway',
      category: 'Horror',
      unlockCost: 500,
      preview: 'Production design on the corridor set, from foam core to final paint.',
      castAndCrew: 'Guillermo del Toro · Tamara Deverell',
      imageAsset: AppImageAssets.exclusive3,
    ),
    ExclusiveItem(
      id: 'ex-6',
      title: 'Last Light',
      category: 'New',
      unlockCost: 1000,
      preview: 'The colourist grades the final reel, side by side with the camera original.',
      castAndCrew: 'Greig Fraser · Tom Poole',
      imageAsset: AppImageAssets.exclusive2,
    ),
    ExclusiveItem(
      id: 'ex-7',
      title: 'Harvest',
      category: 'Thriller',
      unlockCost: 500,
      preview: 'Costume tests and the six-week build behind the field sequence.',
      castAndCrew: 'Jane Campion · Ari Wegner',
      imageAsset: AppImageAssets.exclusive4,
    ),
    ExclusiveItem(
      id: 'ex-8',
      title: 'The Tavern',
      category: 'New',
      unlockCost: 500,
      preview: 'Lighting the interior with practicals only, and the night it nearly burned down.',
      castAndCrew: 'Robert Eggers · Jarin Blaschke',
      imageAsset: AppImageAssets.exclusive5,
    ),
    ExclusiveItem(
      id: 'ex-9',
      title: 'End Credits',
      category: 'New',
      unlockCost: 750,
      preview: 'The score sessions, recorded live to picture with a 90-piece orchestra.',
      castAndCrew: 'Hildur Guðnadóttir · Sam Slater',
      imageAsset: AppImageAssets.exclusive3,
    ),
  ];
}
