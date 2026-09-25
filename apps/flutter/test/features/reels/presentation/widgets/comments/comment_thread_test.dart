import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_thread.dart';

import '../../../../../helpers/helpers.dart';

void main() {
  group(CommentThread, () {
    const parentKey = Key('parent');
    const replyKey = Key('reply');
    late List<bool> expandedChanges;
    late int loadMores;

    setUp(() {
      expandedChanges = [];
      loadMores = 0;
    });

    Future<void> pump(WidgetTester tester, {int replyCount = 3, bool hasMore = false, bool isLoading = false}) {
      usePhoneSurface(tester);
      return tester.pumpApp(
        Scaffold(
          body: SingleChildScrollView(
            child: CommentThread(
              comment: const SizedBox(key: parentKey, height: 60, width: double.infinity),
              replyCount: replyCount,
              replies: const [SizedBox(key: replyKey, height: 60, width: double.infinity)],
              hasMoreReplies: hasMore,
              isLoadingReplies: isLoading,
              onExpandedChanged: expandedChanges.add,
              onLoadMoreReplies: () => loadMores++,
            ),
          ),
        ),
      );
    }

    group('renders', () {
      testWidgets('only the comment when it has no replies', (tester) async {
        await pump(tester, replyCount: 0);

        expect(find.byKey(parentKey), findsOneWidget);
        expect(find.textContaining('View'), findsNothing);
      });

      testWidgets('replies collapsed behind View N replies', (tester) async {
        await pump(tester);

        expect(find.text('View 3 replies'), findsOneWidget);
        expect(find.byKey(replyKey), findsNothing);
      });

      testWidgets('replies one indent in from the comment once expanded', (tester) async {
        await pump(tester);
        await tester.tap(find.text('View 3 replies'));
        await tester.pump();

        expect(
          tester.getTopLeft(find.byKey(replyKey)).dx - tester.getTopLeft(find.byKey(parentKey)).dx,
          CommentThread.replyIndent,
        );
        expect(find.text('Hide replies'), findsOneWidget);
      });

      testWidgets('a loading row instead of View more replies while loading', (tester) async {
        await pump(tester, hasMore: true, isLoading: true);
        await tester.tap(find.text('View 3 replies'));
        await tester.pump();

        expect(find.byType(LoadingView), findsOneWidget);
        expect(find.text('View more replies'), findsNothing);
      });

      testWidgets('meeting the guidelines', (tester) async {
        await pump(tester, hasMore: true);
        await tester.tap(find.text('View 3 replies'));
        await tester.pump();

        await expectMeetsGuidelines(tester);
      });
    });

    group('calls', () {
      testWidgets('onExpandedChanged as the replies open and close', (tester) async {
        await pump(tester);
        await tester.tap(find.text('View 3 replies'));
        await tester.pump();
        await tester.tap(find.text('Hide replies'));
        await tester.pump();

        expect(expandedChanges, [true, false]);
        expect(find.byKey(replyKey), findsNothing);
      });

      testWidgets('onLoadMoreReplies from View more replies', (tester) async {
        await pump(tester, hasMore: true);
        await tester.tap(find.text('View 3 replies'));
        await tester.pump();
        await tester.tap(find.text('View more replies'));

        expect(loadMores, 1);
      });
    });
  });
}
