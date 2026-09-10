import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/app/router/not_found_screen.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/tab_placeholder_screen.dart';

import '../../helpers/helpers.dart';

///
/// The shared widgets that carry a semantics role, each pumped with semantics
/// switched on.
///
/// A role is only checked when something is listening, so an illegal pairing
/// renders fine everywhere else and asserts once a screen reader is on.
///
void main() {
  Future<void> pumpWithSemantics(WidgetTester tester, Widget widget) async {
    usePhoneSurface(tester);
    await tester.pumpApp(widget);
    await pumpAnnouncement(tester);
  }

  testWidgets('$LoadingView', (tester) async {
    final handle = tester.ensureSemantics();
    await pumpWithSemantics(tester, const Scaffold(body: LoadingView()));

    expect(find.byType(CircularProgressIndicator), findsOne);
    expect(tester.takeException(), isNull);
    handle.dispose();
  });

  testWidgets('$ErrorView', (tester) async {
    final handle = tester.ensureSemantics();
    await pumpWithSemantics(
      tester,
      Scaffold(
        body: ErrorView(message: 'Could not load.', onRetry: () {}),
      ),
    );

    expect(find.text('Could not load.'), findsOne);
    expect(tester.takeException(), isNull);
    handle.dispose();
  });

  testWidgets('$NotFoundScreen, which is an $ErrorView', (tester) async {
    final handle = tester.ensureSemantics();
    await pumpWithSemantics(tester, NotFoundScreen(uri: Uri.parse('/nowhere')));

    expect(find.byType(ErrorView), findsOne);
    expect(tester.takeException(), isNull);
    handle.dispose();
  });

  testWidgets('$TabPlaceholderScreen, which carries a screen title', (tester) async {
    final handle = tester.ensureSemantics();
    await pumpWithSemantics(tester, const TabPlaceholderScreen(title: 'Home'));

    expect(find.text('Home'), findsOne);
    expect(tester.takeException(), isNull);
    handle.dispose();
  });
}
