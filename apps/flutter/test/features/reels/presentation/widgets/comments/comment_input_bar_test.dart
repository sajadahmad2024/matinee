import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_input_bar.dart';

import '../../../../../helpers/helpers.dart';

void main() {
  group(CommentInputBar, () {
    late List<String> sent;
    late int cancels;

    setUp(() {
      sent = [];
      cancels = 0;
    });

    Future<void> pump(WidgetTester tester, {String? replyingTo}) {
      usePhoneSurface(tester);
      return tester.pumpApp(
        Scaffold(
          body: Align(
            alignment: Alignment.bottomCenter,
            child: CommentInputBar(onSend: sent.add, replyingTo: replyingTo, onCancelReply: () => cancels++),
          ),
        ),
      );
    }

    IconButton send(WidgetTester tester) =>
        tester.widget<IconButton>(find.ancestor(of: find.byTooltip('Send comment'), matching: find.byType(IconButton)));

    group('renders', () {
      testWidgets('the placeholder in a box of the comment height, inside a 48 target', (tester) async {
        await pump(tester);
        final box = find.descendant(
          of: find.byType(CommentInputBar),
          matching: find.byWidgetPredicate(
            (widget) =>
                widget is DecoratedBox &&
                widget.decoration is BoxDecoration &&
                (widget.decoration as BoxDecoration).borderRadius ==
                    const BorderRadius.all(Radius.circular(AppRadius.sm)),
          ),
        );

        expect(find.text('Add a comment\u2026'), findsOneWidget);
        // Within a pixel: the line height the test font rounds to decides the rest.
        expect(tester.getSize(box).height, closeTo(AppControlHeight.commentField, 1));
        expect(tester.getSize(find.byType(TextField)).height, greaterThanOrEqualTo(kMinInteractiveDimension));
      });

      testWidgets('send disabled until there is text', (tester) async {
        await pump(tester);
        expect(send(tester).onPressed, isNull);

        await tester.enterText(find.byType(TextField), '   ');
        await tester.pump();
        expect(send(tester).onPressed, isNull);

        await tester.enterText(find.byType(TextField), 'Nice');
        await tester.pump();
        expect(send(tester).onPressed, isNotNull);
      });

      testWidgets('the Replying to line when answering someone', (tester) async {
        await pump(tester, replyingTo: 'sarahk');

        expect(find.text('Replying to @sarahk'), findsOneWidget);
      });

      testWidgets('meeting the guidelines', (tester) async {
        await pump(tester, replyingTo: 'sarahk');
        await tester.enterText(find.byType(TextField), 'Nice');
        await tester.pump();

        await expectMeetsGuidelines(tester);
      });
    });

    group('calls', () {
      testWidgets('onSend with the trimmed text, then clears the field', (tester) async {
        await pump(tester);
        await tester.enterText(find.byType(TextField), '  Nice shot  ');
        await tester.pump();

        await tester.tap(find.byTooltip('Send comment'));
        await tester.pump();

        expect(sent, ['Nice shot']);
        expect(find.text('Nice shot'), findsNothing);
      });

      testWidgets('onCancelReply from the cancel button', (tester) async {
        await pump(tester, replyingTo: 'sarahk');

        await tester.tap(find.byTooltip('Cancel reply'));
        expect(cancels, 1);
      });
    });
  });
}
