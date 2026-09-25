import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_card.dart';

import '../../../../../helpers/helpers.dart';

void main() {
  group(CommentCard, () {
    late int likes;
    late int replies;

    setUp(() {
      likes = 0;
      replies = 0;
    });

    Future<void> pump(WidgetTester tester, {String text = 'Great trailer.', String? mention, bool isLiked = false}) {
      usePhoneSurface(tester);
      return tester.pumpApp(
        Scaffold(
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: CommentCard(
              handle: 'alexr',
              timeLabel: '2m ago',
              text: text,
              mention: mention,
              likeCount: 124,
              isLiked: isLiked,
              onLike: () => likes++,
              onReply: () => replies++,
            ),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('the handle, time, text, like count and Reply', (tester) async {
        await pump(tester);

        expect(find.text('@alexr'), findsOneWidget);
        expect(find.text('2m ago'), findsOneWidget);
        expect(find.textContaining('Great trailer.', findRichText: true), findsOneWidget);
        expect(find.text('124'), findsOneWidget);
        expect(find.text('Reply'), findsOneWidget);
      });

      testWidgets('a leading mention on a reply to a reply', (tester) async {
        await pump(tester, mention: 'sarahk');

        expect(find.textContaining('@sarahk Great trailer.', findRichText: true), findsOneWidget);
      });

      testWidgets('See more only when the text is cut off, and expands it', (tester) async {
        await pump(tester);
        expect(find.text('See more'), findsNothing);

        await pump(tester, text: List.filled(40, 'Long comment text.').join(' '));
        expect(find.text('See more'), findsOneWidget);

        await tester.tap(find.text('See more'));
        await tester.pump();
        expect(find.text('See more'), findsNothing);
      });

      testWidgets('meeting the guidelines', (tester) async {
        await pump(tester, text: List.filled(40, 'Long comment text.').join(' '));

        await expectMeetsGuidelines(tester);
      });
    });

    group('calls', () {
      testWidgets('onLike from the like button', (tester) async {
        await pump(tester);

        await tester.tap(find.bySemanticsLabel('Like, 124'));
        expect(likes, 1);
        expect(replies, 0);
      });

      testWidgets('onReply from Reply', (tester) async {
        await pump(tester);

        await tester.tap(find.text('Reply'));
        expect(replies, 1);
        expect(likes, 0);
      });
    });
  });
}
