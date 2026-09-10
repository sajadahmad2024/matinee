import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';

///
/// The four built-in guidelines every screen has to pass: both tap-target
/// sizes, a name on everything tappable, and text contrast, plus the one they
/// cannot see (see [expectControlsAreActivatable]).
///
Future<void> expectMeetsGuidelines(WidgetTester tester) async {
  await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
  await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
  await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
  await expectLater(tester, meetsGuideline(textContrastGuideline));
  expectControlsAreActivatable(tester);
}

///
/// The WCAG 2.x contrast ratio between two opaque colours, 1:1 to 21:1.
///
/// Needed because `textContrastGuideline` reads the semantics tree and so
/// cannot see text inside `excludeSemantics: true` — which is most of this
/// app's cards, since they compose their texts into one spoken label. Contrast
/// is therefore asserted against the theme's roles instead, in
/// `test/core/theme/contrast_test.dart`.
///
double contrastRatio(Color foreground, Color background) {
  double channel(double c) => c <= 0.03928 ? c / 12.92 : math.pow((c + 0.055) / 1.055, 2.4).toDouble();
  double luminance(Color c) => 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
  final a = luminance(foreground);
  final b = luminance(background);
  return (math.max(a, b) + 0.05) / (math.min(a, b) + 0.05);
}

///
/// Fails when a node says it is a live control but carries no tap action, which
/// leaves a screen reader able to reach it and unable to use it.
///
/// The usual cause is `Semantics(excludeSemantics: true)` over an `InkWell`:
/// excluding the subtree takes the tap with it, and the node keeps only the
/// flags set above. Forward the callback with `onTap:` on the `Semantics` too.
///
/// None of the three tap-target or labelling guidelines catch it — every one of
/// them only visits nodes that already carry a tap or long-press action, so an
/// 8x8 excluded button passes all three.
///
void expectControlsAreActivatable(WidgetTester tester) {
  // Enabled here rather than assumed: the built-in guidelines turn semantics
  // on and off around themselves, so by this point there may be no tree.
  final handle = tester.ensureSemantics();
  final dead = <String>[];
  void visit(SemanticsNode node) {
    final data = node.getSemanticsData();
    // A node that reports being chosen, or one of a set, is a control whether
    // or not it also set `button` — the top-up packs are exactly that shape.
    final claimsControl =
        data.flagsCollection.isButton ||
        data.flagsCollection.isLink ||
        data.flagsCollection.isInMutuallyExclusiveGroup ||
        data.flagsCollection.isSelected != Tristate.none ||
        node.role == SemanticsRole.tab;
    // A disabled control has nothing to dispatch, which is correct rather than
    // broken: a row whose screen does not exist yet says so with the flag.
    // `none` means the node never declared an enabled state, so it is live.
    final isLive = data.flagsCollection.isEnabled != Tristate.isFalse;
    if (claimsControl && isLive && !data.hasAction(SemanticsAction.tap)) {
      dead.add('${data.label.isEmpty ? "(unnamed)" : data.label} at ${node.rect}');
    }
    node.visitChildren((child) {
      visit(child);
      return true;
    });
  }

  for (final view in tester.binding.renderViews) {
    final root = view.owner?.semanticsOwner?.rootSemanticsNode;
    if (root != null) {
      visit(root);
    }
  }
  handle.dispose();
  expect(
    dead,
    isEmpty,
    reason:
        'these nodes claim to be controls but carry no tap action, so assistive '
        'tech cannot activate them: ${dead.join(", ")}',
  );
}

/// Sizes the surface to a phone, which the guidelines measure against.
void usePhoneSurface(WidgetTester tester) {
  tester.view.physicalSize = const Size(1170, 2532);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
}

///
/// Advances far enough for a message just shown to be built, animated in and
/// flushed to the semantics tree, and no further.
///
/// Too few frames and a snackbar's role is not flushed yet; `pumpAndSettle`
/// overshoots and the message is gone. Four frames sits inside both windows.
///
Future<void> pumpAnnouncement(WidgetTester tester) async {
  await tester.pump();
  for (var frame = 0; frame < 4; frame++) {
    await tester.pump(const Duration(milliseconds: 100));
  }
}
