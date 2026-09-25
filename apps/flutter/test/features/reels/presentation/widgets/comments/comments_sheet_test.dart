import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/widgets/app_bottom_sheet.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comment_input_bar.dart';
import 'package:matinee/features/reels/presentation/widgets/comments/comments_sheet.dart';

import '../../../../../helpers/helpers.dart';

void main() {
  group(CommentsSheet, () {
    late int loadMores;

    setUp(() => loadMores = 0);

    Future<void> open(
      WidgetTester tester, {
      int itemCount = 30,
      bool hasMore = false,
      bool isLoadingMore = false,
      String? replyingTo,
    }) async {
      usePhoneSurface(tester);
      await tester.pumpApp(
        Builder(
          builder: (context) => Scaffold(
            body: Center(
              child: TextButton(
                onPressed: () => showAppBottomSheet<void>(
                  context,
                  builder: (_) => CommentsSheet(
                    itemCount: itemCount,
                    hasMore: hasMore,
                    isLoadingMore: isLoadingMore,
                    onLoadMore: () => loadMores++,
                    replyingTo: replyingTo,
                    onSend: (_) {},
                    itemBuilder: (_, index) => SizedBox(height: 80, child: Text('Comment $index')),
                  ),
                ),
                child: const Text('Open'),
              ),
            ),
          ),
        ),
      );
      await tester.tap(find.text('Open'));
      if (isLoadingMore) {
        // The spinner never settles; pump past the sheet's entrance instead.
        await tester.pump(const Duration(seconds: 1));
      } else {
        await tester.pumpAndSettle();
      }
    }

    group('renders', () {
      testWidgets('the title, the first comments and the comment bar', (tester) async {
        await open(tester);

        expect(find.text('Comments'), findsOneWidget);
        expect(find.text('Comment 0'), findsOneWidget);
        expect(find.byType(CommentInputBar), findsOneWidget);
      });

      testWidgets('lazily, not every comment at once', (tester) async {
        await open(tester);

        expect(find.text('Comment 29'), findsNothing);
      });

      testWidgets('the empty line when there are no comments', (tester) async {
        await open(tester, itemCount: 0);

        expect(find.text('No comments yet'), findsOneWidget);
      });

      testWidgets('a loading row after the list while loading more', (tester) async {
        await open(tester, itemCount: 2, isLoadingMore: true);

        expect(find.byType(LoadingView), findsOneWidget);
      });

      testWidgets('meeting the guidelines', (tester) async {
        await open(tester, itemCount: 2);

        await expectMeetsGuidelines(tester);
      });
    });

    group('calls', () {
      testWidgets('onLoadMore near the end of the list, not before', (tester) async {
        await open(tester, hasMore: true);
        expect(loadMores, 0);

        await tester.drag(find.text('Comment 0'), const Offset(0, -3000));
        await tester.pump();

        expect(loadMores, greaterThan(0));
      });

      testWidgets('onLoadMore when a short first page leaves room', (tester) async {
        await open(tester, itemCount: 2, hasMore: true);

        expect(loadMores, greaterThan(0));
      });

      testWidgets('nothing more while there is no more to load', (tester) async {
        await open(tester);
        await tester.drag(find.text('Comment 0'), const Offset(0, -3000));
        await tester.pump();

        expect(loadMores, 0);
      });
    });
  });
}
