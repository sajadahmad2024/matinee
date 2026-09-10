import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';

///
/// The four built-in guidelines every screen has to pass: both tap-target
/// sizes, a name on everything tappable, and text contrast.
///
Future<void> expectMeetsGuidelines(WidgetTester tester) async {
  await expectLater(tester, meetsGuideline(androidTapTargetGuideline));
  await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));
  await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
  await expectLater(tester, meetsGuideline(textContrastGuideline));
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
