import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/profile/presentation/widgets/refer_sheet.dart';

import '../../../../helpers/helpers.dart';

void main() {
  group(ReferSheet, () {
    const code = 'CH8362';

    late List<MethodCall> clipboard;

    setUp(() {
      clipboard = [];
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        (call) async {
          if (call.method == 'Clipboard.setData') {
            clipboard.add(call);
          }
          return null;
        },
      );
    });

    tearDown(() {
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        null,
      );
    });

    Future<void> pumpSheet(WidgetTester tester) {
      tester.view.physicalSize = const Size(1170, 2532);
      tester.view.devicePixelRatio = 3;
      addTearDown(tester.view.reset);
      return tester.pumpApp(const ReferSheet(referralCode: code));
    }

    group('renders', () {
      testWidgets('the referral code and every way to pass it on', (tester) async {
        await pumpSheet(tester);

        expect(find.text(code), findsOneWidget);
        expect(find.text('WhatsApp'), findsOneWidget);
        expect(find.text('Telegram'), findsOneWidget);
        expect(find.text('Instagram'), findsOneWidget);
        expect(find.text('Copy'), findsOneWidget);
      });

      testWidgets('only as tall as its content, leaving the screen behind it', (tester) async {
        await pumpSheet(tester);

        final screen = tester.getSize(find.byType(ReferSheet)).height;
        final surfaceTop = tester.getRect(find.text('Refer a Friend')).top;

        expect(surfaceTop, greaterThan(screen / 2));
      });
    });

    group('copies the code', () {
      testWidgets('to the clipboard when Copy Code is tapped', (tester) async {
        await pumpSheet(tester);

        await tester.tap(find.text('Copy Code'));
        await tester.pump();

        expect(clipboard, hasLength(1));
        expect(clipboard.single.arguments, containsPair('text', code));
      });

      testWidgets('and confirms it inside the sheet, not behind it', (tester) async {
        await pumpSheet(tester);

        await tester.tap(find.text('Copy Code'));
        await tester.pump();
        await tester.pump();

        // The sheet carries its own messenger, so the confirmation has to be
        // above the sheet's own surface rather than on the page underneath.
        final snackBar = find.byType(SnackBar);
        expect(snackBar, findsOneWidget);
        expect(
          tester.getRect(snackBar).bottom,
          lessThanOrEqualTo(tester.getSize(find.byType(ReferSheet)).height),
        );
      });
    });
  });
}
