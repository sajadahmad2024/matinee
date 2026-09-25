import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/theme/app_colors.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_theme.dart';
import 'package:matinee/core/widgets/app_avatar.dart';

import '../../helpers/helpers.dart';

void main() {
  group(AppAvatar, () {
    final colors = AppTheme.dark.extension<AppColors>()!;
    final textTheme = AppTheme.dark.textTheme;

    Future<void> pump(WidgetTester tester, AppAvatar avatar) {
      return tester.pumpApp(Center(child: avatar));
    }

    List<BoxDecoration> decorations(WidgetTester tester) => tester
        .widgetList<DecoratedBox>(find.descendant(of: find.byType(AppAvatar), matching: find.byType(DecoratedBox)))
        .map((box) => box.decoration as BoxDecoration)
        .toList();

    group('renders the compact variant', () {
      testWidgets('at the comment size on the avatar fill, without a ring', (tester) async {
        await pump(tester, const AppAvatar(name: 'Alex Rivera'));
        final [fill, overlay] = decorations(tester);

        expect(tester.getSize(find.byType(AppAvatar)), const Size.square(AppAvatarSize.comment));
        expect(fill.color, colors.avatar.background);
        expect(overlay.border, isNull);
        expect(find.text('AR'), findsOneWidget);
        expect(tester.widget<Text>(find.text('AR')).style?.fontSize, textTheme.titleSmall?.fontSize);
      });
    });

    group('renders the profile variant', () {
      testWidgets('at the profile size on the card fill, in the gold ring', (tester) async {
        await pump(tester, const AppAvatar(name: 'Alex Rivera', variant: AppAvatarVariant.profile));
        final [fill, overlay] = decorations(tester);

        expect(tester.getSize(find.byType(AppAvatar)), const Size.square(AppAvatarSize.profile));
        expect(fill.color, colors.card.background);
        expect(overlay.border, Border.all(color: colors.avatar.ring));
        expect(tester.widget<Text>(find.text('AR')).style?.fontSize, textTheme.titleLarge?.fontSize);
      });
    });

    group('announces', () {
      testWidgets('nothing by default, since the name sits beside it', (tester) async {
        final handle = tester.ensureSemantics();
        await pump(tester, const AppAvatar(name: 'Alex Rivera'));

        expect(find.bySemanticsLabel('AR'), findsNothing);
        handle.dispose();
      });

      testWidgets('its label as an image when given one', (tester) async {
        final handle = tester.ensureSemantics();
        await pump(tester, const AppAvatar(name: 'Alex Rivera', semanticLabel: 'Alex Rivera, profile photo'));

        expect(find.bySemanticsLabel('Alex Rivera, profile photo'), findsOneWidget);
        expect(find.bySemanticsLabel('AR'), findsNothing);
        handle.dispose();
      });
    });
  });
}
