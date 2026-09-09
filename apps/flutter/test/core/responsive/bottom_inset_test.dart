import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_scaffold.dart';

import '../../helpers/helpers.dart';

void main() {
  ///
  /// A phone with a home indicator. The design's frames are the whole screen
  /// and draw no indicator of their own, so a screen that keeps its design gap
  /// *and* a bottom SafeArea reserves this twice over.
  ///
  const homeIndicator = 34.0;

  Widget withInset(Widget child) {
    return MediaQuery(
      data: const MediaQueryData(padding: EdgeInsets.only(bottom: homeIndicator)),
      child: child,
    );
  }

  group('bottomInset', () {
    testWidgets('takes the design gap when it is larger than the device inset', (tester) async {
      late double inset;
      await tester.pumpApp(
        withInset(
          Builder(
            builder: (context) {
              inset = context.bottomInset(AppSpacing.screenBottom);
              return const SizedBox.shrink();
            },
          ),
        ),
      );

      expect(inset, AppSpacing.screenBottom);
    });

    testWidgets('takes the device inset when it is larger than the design gap', (tester) async {
      late double inset;
      await tester.pumpApp(
        withInset(
          Builder(
            builder: (context) {
              inset = context.bottomInset(AppSpacing.sm);
              return const SizedBox.shrink();
            },
          ),
        ),
      );

      expect(inset, homeIndicator);
    });

    testWidgets('falls back to the design gap where there is no inset', (tester) async {
      late double inset;
      await tester.pumpApp(
        Builder(
          builder: (context) {
            inset = context.bottomInset(AppSpacing.screenBottom);
            return const SizedBox.shrink();
          },
        ),
      );

      expect(inset, AppSpacing.screenBottom);
    });
  });

  group('AuthScaffold', () {
    testWidgets('leaves the design gap under its footer, not the gap plus the inset', (tester) async {
      const footerKey = Key('footer');
      await tester.pumpApp(
        withInset(
          const AuthScaffold(
            title: 'Title',
            footer: SizedBox(key: footerKey, height: 52),
            children: [Text('Body')],
          ),
        ),
      );

      final screenBottom = tester.getSize(find.byType(AuthScaffold)).height;
      final gap = screenBottom - tester.getRect(find.byKey(footerKey)).bottom;

      expect(gap, AppSpacing.screenBottom);
      expect(gap, lessThan(AppSpacing.screenBottom + homeIndicator));
    });
  });
}
