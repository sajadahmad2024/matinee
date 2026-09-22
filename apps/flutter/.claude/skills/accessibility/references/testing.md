# Accessibility — Full Test Suite Example

A complete Flutter accessibility test suite covering the six audit categories. Verified on Flutter 3.47 with `flutter analyze --fatal-infos` and `flutter test`.

Two layers:

- **Built-in guidelines** from `flutter_test` do the bulk of the work on a real screen: `androidTapTargetGuideline` (48x48 dp), `iOSTapTargetGuideline` (44x44 pt), `labeledTapTargetGuideline` (every tappable node has a label) and `textContrastGuideline` (4.5:1, or 3:1 for large text, measured on the rendered frame). Run all four at the end of every screen test, pumped through the project's `pumpApp` helper so the real theme is measured.
- **Semantics assertions** for the things the guidelines cannot see: roles, headings, live regions, focus movement, text scaling and reduced motion. `tester.ensureSemantics()` is needed before reading nodes; `flagsCollection` replaces the deprecated `hasFlag(SemanticsFlag.x)`.

`SemanticsRole` lives in `package:flutter/semantics.dart`; `material.dart` does not re-export it.

---

## Full Accessibility Test Suite Example

```dart
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('Built-in guidelines', () {
    testWidgets('screen meets the tap target, label and contrast guidelines', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            appBar: AppBar(title: const Text('Cart')),
            body: Column(
              children: [
                IconButton(icon: const Icon(Icons.close), tooltip: 'Close', onPressed: () {}),
                FilledButton(onPressed: () {}, child: const Text('Checkout')),
              ],
            ),
          ),
        ),
      );

      // 48x48 dp Material minimum, 44x44 pt iOS minimum, a label on every tappable
      // node, and 4.5:1 (3:1 for large text) on every text node.
      await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
      await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
      await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
      await expectLater(tester, meetsGuideline(textContrastGuideline));
    });
  });

  group('Semantics', () {
    testWidgets('informative icon has a text alternative', (tester) async {
      final handle = tester.ensureSemantics();

      // Image.semanticLabel is asserted the same way; a real asset is needed for that.
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: Icon(Icons.warning, semanticLabel: 'Warning')),
        ),
      );

      expect(tester.getSemantics(find.byType(Icon)).label, 'Warning');

      handle.dispose();
    });

    testWidgets('changing text is a live region', (tester) async {
      final handle = tester.ensureSemantics();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(body: Semantics(liveRegion: true, child: const Text('3 items in cart'))),
        ),
      );

      expect(tester.getSemantics(find.text('3 items in cart')).flagsCollection.isLiveRegion, isTrue);

      handle.dispose();
    });

    testWidgets('status message carries the status role', (tester) async {
      final handle = tester.ensureSemantics();

      // The status and alert roles are live regions by definition; adding
      // liveRegion: true on top of them is an assertion failure.
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Semantics(role: SemanticsRole.status, child: const Text('Saved')),
          ),
        ),
      );

      expect(tester.getSemantics(find.text('Saved')).role, SemanticsRole.status);

      handle.dispose();
    });

    testWidgets('section title is exposed as a heading', (tester) async {
      final handle = tester.ensureSemantics();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Semantics(header: true, headingLevel: 2, child: const Text('Recommended')),
          ),
        ),
      );

      final node = tester.getSemantics(find.text('Recommended'));
      expect(node.flagsCollection.isHeader, isTrue);
      expect(node.headingLevel, 2);

      handle.dispose();
    });
  });

  group('Focus and keyboard', () {
    testWidgets('tab moves keyboard focus onto the button', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: FilledButton(onPressed: () {}, child: const Text('Save')),
          ),
        ),
      );

      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      // Focus.of from the label resolves to the button's own focus node.
      expect(Focus.of(tester.element(find.text('Save'))).hasFocus, isTrue);
    });

    testWidgets('dialog takes focus when opened', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Builder(
              builder: (context) => FilledButton(
                onPressed: () => showDialog<void>(
                  context: context,
                  builder: (_) => AlertDialog(
                    title: const Text('Confirm'),
                    actions: [TextButton(onPressed: () {}, child: const Text('OK'))],
                  ),
                ),
                child: const Text('Open'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Open'));
      await tester.pumpAndSettle();
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();

      expect(Focus.of(tester.element(find.text('OK'))).hasFocus, isTrue);
    });
  });

  group('Text scaling', () {
    testWidgets('text is not clipped at 200 percent', (tester) async {
      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2)),
          child: MaterialApp(
            home: Scaffold(
              body: ConstrainedBox(
                constraints: const BoxConstraints(minHeight: 48),
                child: const Text('This text should not be clipped at double scale'),
              ),
            ),
          ),
        ),
      );

      // An overflow would surface as a RenderFlex or clipping exception.
      expect(tester.takeException(), isNull);
      expect(find.text('This text should not be clipped at double scale'), findsOneWidget);
    });

    testWidgets('widget does not clamp the user text scale', (tester) async {
      late TextScaler seen;

      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(textScaler: TextScaler.linear(2)),
          child: MaterialApp(
            home: Builder(
              builder: (context) {
                seen = MediaQuery.textScalerOf(context);
                return const SizedBox.shrink();
              },
            ),
          ),
        ),
      );

      expect(seen.scale(10), 20);
    });
  });

  group('Animation and motion', () {
    testWidgets('resize completes in one frame when animations are disabled', (tester) async {
      var expanded = false;

      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(disableAnimations: true),
          child: MaterialApp(
            home: Scaffold(
              body: StatefulBuilder(
                builder: (context, setState) => Column(
                  children: [
                    AnimatedContainer(
                      duration: MediaQuery.disableAnimationsOf(context)
                          ? Duration.zero
                          : const Duration(milliseconds: 300),
                      width: expanded ? 200 : 100,
                      height: 10,
                    ),
                    FilledButton(
                      onPressed: () => setState(() => expanded = true),
                      child: const Text('Expand'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Expand'));
      await tester.pump();

      expect(tester.getSize(find.byType(AnimatedContainer)).width, 200);
    });
  });
}
```

---

## Notes

- `textContrastGuideline` renders the frame and samples pixels, so it needs a `MaterialApp` with the real theme. A failure is a theme finding, not a widget override.
- Set `tester.view.physicalSize` and `devicePixelRatio` (and `addTearDown(tester.view.reset)`) before the guideline checks on a full screen; the default test surface is small and shifts layout.
- `Focus.of(tester.element(find.text('Save')))` resolves from the label to the button's own focus node. Calling `Focus.of` on the button's element itself finds an ancestor scope and proves nothing.
- Combining `role: SemanticsRole.status` (or `alert`) with `liveRegion: true` throws during the semantics update; the role already implies the live region.
- `Image.semanticLabel` is asserted exactly like the `Icon` case above but the asset must exist in the test bundle.
