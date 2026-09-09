import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_legal_text.dart';

import '../../../../helpers/helpers.dart';

void main() {
  group(AuthLegalText, () {
    late List<String> tapped;

    setUp(() {
      tapped = [];
    });

    Future<void> pumpText(WidgetTester tester) {
      return tester.pumpApp(
        AuthLegalText(
          sentence: 'By continuing, you agree to our {terms} and {privacy}',
          termsLabel: 'Terms of Service',
          privacyLabel: 'Privacy Policy',
          onTermsTap: () => tapped.add('terms'),
          onPrivacyTap: () => tapped.add('privacy'),
        ),
      );
    }

    group('renders', () {
      testWidgets('the sentence with both document names spliced in', (tester) async {
        await pumpText(tester);

        expect(
          find.text('By continuing, you agree to our Terms of Service and Privacy Policy', findRichText: true),
          findsOneWidget,
        );
      });
    });

    group('calls back', () {
      testWidgets('for the terms link only when the terms run is tapped', (tester) async {
        await pumpText(tester);

        await tester.tapOnText(find.textRange.ofSubstring('Terms of Service'));
        await tester.pump();

        expect(tapped, ['terms']);
      });

      testWidgets('for the privacy link only when the privacy run is tapped', (tester) async {
        await pumpText(tester);

        await tester.tapOnText(find.textRange.ofSubstring('Privacy Policy'));
        await tester.pump();

        expect(tapped, ['privacy']);
      });
    });
  });
}
