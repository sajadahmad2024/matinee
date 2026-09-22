import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/error/app_exception.dart';
import 'package:matinee/shared/points/data/models/points_standing.dart';
import 'package:matinee/shared/points/data/services/points_service.dart';

void main() {
  group(PointsService, () {
    late PointsService service;

    setUp(() => service = PointsService());

    group('standing', () {
      test('reads the badge the balance has earned and the distance to the next', () {
        final standing = service.standing;

        expect(standing.totalPoints, 7082);
        expect(standing.badgeName, 'Expert');
        expect(standing.nextBadgeName, 'Cinematic Loyalist');
        // The next rung is at 8,000, which is the design's own '918 pts to'.
        expect(standing.pointsToNextBadge, 918);
      });

      test('measures progress across the tier the balance sits in, not from zero', () {
        // 2,082 of the 3,000 between Expert at 5,000 and Loyalist at 8,000.
        expect(service.standing.progressToNextBadge, closeTo(0.694, 0.001));
      });

      test('reads as complete once the top of the ladder is reached', () {
        service.credit(PointsService.tiers.last.threshold);
        final standing = service.standing;

        expect(standing.badgeName, 'Visionary');
        expect(standing.pointsToNextBadge, isZero);
        expect(standing.progressToNextBadge, 1);
      });

      test('writes the fraction across the tier the balance sits in', () {
        final standing = service.standing;

        expect(standing.pointsIntoBadge, 2082);
        expect(standing.badgeSpan, 3000);
      });

      test('reads the top rung as complete rather than as nothing into a span of one', () {
        service.credit(PointsService.tiers.last.threshold - service.balance);
        final standing = service.standing;

        // The rung that reached the top, cleared in full: 12,000 less the
        // 8,000 below it.
        expect(standing.pointsIntoBadge, 4000);
        expect(standing.badgeSpan, 4000);
        expect(standing.progressToNextBadge, 1);
        expect(standing.isTopBadge, isTrue);
      });

      test('drops to the tier below when the balance falls', () {
        service.debit(3000);

        expect(service.standing.badgeName, 'Prediction Pundit');
        expect(service.standing.nextBadgeName, 'Expert');
      });
    });

    group('debit', () {
      test('throws $ValidationException rather than overdrawing the balance', () {
        expect(() => service.debit(service.balance + 1), throwsA(isA<ValidationException>()));
        expect(service.balance, 7082);
      });
    });

    group('pointsChanges', () {
      test('broadcasts every move, so each screen showing the balance follows it', () {
        expect(service.pointsChanges, emitsInOrder(<int>[7582, 7082]));

        service
          ..credit(500)
          ..debit(500);
      });

      test('stays quiet when a debit is refused', () async {
        final seen = <int>[];
        final subscription = service.pointsChanges.listen(seen.add);
        addTearDown(subscription.cancel);

        expect(() => service.debit(99999), throwsA(isA<ValidationException>()));
        await Future<void>.delayed(Duration.zero);

        expect(seen, isEmpty);
      });
    });

    group('tiers', () {
      test('are ordered by threshold, which the standing lookup relies on', () {
        final thresholds = [for (final tier in PointsService.tiers) tier.threshold];

        expect(thresholds, orderedEquals(List<int>.of(thresholds)..sort()));
      });
    });
  });
}
