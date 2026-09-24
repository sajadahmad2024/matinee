import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/features/reels/presentation/widgets/unlock_overlay.dart';

import '../../../../helpers/helpers.dart';

void main() {
  group(UnlockOverlay, () {
    Widget buildOverlay({required VoidCallback confirmAndUnlock, VoidCallback? onUnlock}) {
      return UnlockOverlay(
        tagLabel: 'EXCLUSIVE CONTENT',
        title: 'BTS Video',
        unlocksForLabel: 'Unlocks for',
        costLabel: '500 POINTS',
        previewLabel: 'PREVIEW',
        preview: 'Behind the scenes footage.',
        castLabel: 'CAST & CREW',
        cast: 'Christopher Nolan',
        unlockCtaLabel: 'Unlock Now',
        confirmTitle: 'Confirm Unlock',
        confirmMessage: "You're about to spend points to unlock this content.",
        pointDeductionLabel: 'Point Deduction',
        confirmCtaLabel: 'Confirm & Unlock',
        onUnlock: onUnlock,
        confirmAndUnlock: confirmAndUnlock,
      );
    }

    group('renders', () {
      testWidgets('the tag, title, cost and preview over the reel', (tester) async {
        await tester.pumpApp(buildOverlay(confirmAndUnlock: () {}));

        expect(find.text('EXCLUSIVE CONTENT'), findsOneWidget);
        expect(find.text('BTS Video'), findsOneWidget);
        expect(find.text('500 POINTS'), findsOneWidget);
        expect(find.text('Behind the scenes footage.'), findsOneWidget);
        expect(find.text('Christopher Nolan'), findsOneWidget);
        expect(find.text('Unlock Now'), findsOneWidget);
      });

      testWidgets('meets tap-target, labelling and contrast guidelines', (tester) async {
        usePhoneSurface(tester);
        await tester.pumpApp(buildOverlay(confirmAndUnlock: () {}));

        await expectMeetsGuidelines(tester);
      });
    });

    group('confirm step', () {
      testWidgets('replaces the preview with the spend confirmation when the CTA is tapped', (
        tester,
      ) async {
        await tester.pumpApp(buildOverlay(confirmAndUnlock: () {}));

        await tester.tap(find.widgetWithText(FilledButton, 'Unlock Now'));
        await tester.pump();

        expect(find.text('Confirm Unlock'), findsOneWidget);
        expect(find.text('Point Deduction'), findsOneWidget);
        expect(find.text('Behind the scenes footage.'), findsNothing);
        expect(find.widgetWithText(FilledButton, 'Confirm & Unlock'), findsOneWidget);
      });

      testWidgets('calls confirmAndUnlock when the confirm CTA is tapped', (tester) async {
        var confirmed = false;
        await tester.pumpApp(buildOverlay(confirmAndUnlock: () => confirmed = true));

        await tester.tap(find.widgetWithText(FilledButton, 'Unlock Now'));
        await tester.pump();
        await tester.tap(find.widgetWithText(FilledButton, 'Confirm & Unlock'));
        await tester.pump();

        expect(confirmed, isTrue);
      });

      testWidgets('meets tap-target, labelling and contrast guidelines', (tester) async {
        usePhoneSurface(tester);
        await tester.pumpApp(buildOverlay(confirmAndUnlock: () {}));

        await tester.tap(find.widgetWithText(FilledButton, 'Unlock Now'));
        await tester.pump();

        await expectMeetsGuidelines(tester);
      });
    });

    group('onUnlock', () {
      testWidgets('is called instead of showing the confirm step, when given', (tester) async {
        var tapped = false;
        await tester.pumpApp(
          buildOverlay(onUnlock: () => tapped = true, confirmAndUnlock: () {}),
        );

        await tester.tap(find.widgetWithText(FilledButton, 'Unlock Now'));
        await tester.pump();

        expect(tapped, isTrue);
        expect(find.text('Confirm Unlock'), findsNothing);
      });
    });
  });
}
