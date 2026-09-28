import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/widgets/logo_tile.dart';

import '../../helpers/helpers.dart';

void main() {
  group(LogoTile, () {
    const url = 'https://example.com/netflix.png';

    Future<void> pump(WidgetTester tester, LogoTile tile) {
      usePhoneSurface(tester);
      return tester.pumpApp(Scaffold(body: Center(child: tile)));
    }

    group('renders', () {
      testWidgets('a square at the tile size', (tester) async {
        await pump(tester, const LogoTile(imageUrl: url, semanticLabel: 'Netflix'));

        expect(tester.getSize(find.byType(LogoTile)), const Size.square(LogoTile.size));
      });

      testWidgets('without throwing when the logo fails to load', (tester) async {
        await pump(tester, const LogoTile(imageUrl: url, semanticLabel: 'Netflix'));
        await tester.pumpAndSettle();

        expect(tester.takeException(), isNull);
      });

      testWidgets('meeting the guidelines as a button', (tester) async {
        await pump(tester, LogoTile(imageUrl: url, semanticLabel: 'Netflix', onTap: () {}));

        await expectMeetsGuidelines(tester);
      });
    });

    group('announces', () {
      testWidgets('its label as an image without onTap', (tester) async {
        final handle = tester.ensureSemantics();
        await pump(tester, const LogoTile(imageUrl: url, semanticLabel: 'Netflix'));

        final node = tester.getSemantics(find.bySemanticsLabel('Netflix'));
        expect(node.flagsCollection.isImage, isTrue);
        expect(node.flagsCollection.isButton, isFalse);
        handle.dispose();
      });
    });

    group('calls', () {
      testWidgets('onTap when tapped', (tester) async {
        var taps = 0;
        await pump(tester, LogoTile(imageUrl: url, semanticLabel: 'Netflix', onTap: () => taps++));
        await tester.tap(find.byType(LogoTile));

        expect(taps, 1);
      });
    });
  });
}
