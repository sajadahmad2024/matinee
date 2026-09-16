import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:matinee/core/theme/app_color_scheme.dart';
import 'package:matinee/core/theme/app_colors.dart';

import '../../helpers/helpers.dart';

///
/// Contrast is a property of the theme, not of a widget, so it is asserted
/// against the roles rather than against a rendered screen.
///
/// `textContrastGuideline` cannot stand in for this: it walks the semantics
/// tree, so every label inside an `excludeSemantics: true` block — which is
/// how this app composes a card into one spoken node — is invisible to it. A
/// tile whose name sat at 2.38:1 passed every screen test until this existed.
void main() {
  final colors = AppColors.dark;
  final text = colors.text;
  final icon = colors.icon;

  /// The grounds text is laid on.
  ///
  /// `card.backgroundLocked` is not among them: it fills a locked media tile
  /// that carries a glyph and never a word, so it belongs to the icon matrix
  /// below. Asserting text against it would fail on a pair the app cannot
  /// produce (`text.error` lands at 4.39:1 there).
  final textSurfaces = <String, Color>{
    'colorScheme.surface': AppColorScheme.dark.surface,
    'card.background': colors.card.background,
    'card.backgroundRaised': colors.card.backgroundRaised,
    // Both stops of the quest row's wash, since a row's copy crosses the whole
    // fall of it.
    'card.backgroundRow first stop': colors.card.backgroundRow.colors.first,
    'card.backgroundRow last stop': colors.card.backgroundRow.colors.last,
  };

  final iconSurfaces = <String, Color>{
    ...textSurfaces,
    'card.backgroundLocked': colors.card.backgroundLocked,
  };

  group('text roles clear AA 4.5:1 on every surface', () {
    final roles = <String, Color>{
      'primary': text.primary,
      'secondary': text.secondary,
      'muted': text.muted,
      'link': text.link,
      'numeral': text.numeral,
      'success': text.success,
      'warning': text.warning,
      'error': text.error,
    };

    for (final role in roles.entries) {
      for (final surface in textSurfaces.entries) {
        test('text.${role.key} on ${surface.key}', () {
          expect(
            contrastRatio(role.value, surface.value),
            greaterThanOrEqualTo(4.5),
            reason:
                'text.${role.key} on ${surface.key} is below the 4.5:1 WCAG 1.4.3 minimum '
                'for normal-size text. Fix the role in the theme and docs/design/, '
                'never at the call site.',
          );
        });
      }
    }
  });

  group('icon roles clear AA 3:1 on every surface', () {
    final roles = <String, Color>{
      'primary': icon.primary,
      'secondary': icon.secondary,
      'muted': icon.muted,
      'accent': icon.accent,
    };

    for (final role in roles.entries) {
      for (final surface in iconSurfaces.entries) {
        test('icon.${role.key} on ${surface.key}', () {
          expect(
            contrastRatio(role.value, surface.value),
            greaterThanOrEqualTo(3),
            reason:
                'icon.${role.key} on ${surface.key} is below the 3:1 WCAG 1.4.11 minimum '
                'for a graphical object that carries meaning.',
          );
        });
      }
    }
  });

  ///
  /// A tinted pill's label sits on its own tint, not on the card, so the tint
  /// is composited first. The neutral pill is left out: it names a lot over a
  /// still, where the on-image convention applies and no ground is fixed.
  ///
  group('a tinted pill clears AA 4.5:1 against its own tint', () {
    final pills = <String, (Color, Color)>{
      'badge.success': (colors.badge.successLabel, colors.badge.successBackground),
      'badge.error': (colors.badge.errorLabel, colors.badge.errorBackground),
      'badge.level1': (colors.badge.level1Label, colors.badge.level1Background),
      'badge.level2': (colors.badge.level2Label, colors.badge.level2Background),
      'tag.goldSubtle': (colors.tag.goldSubtleLabel, colors.tag.goldSubtleBackground),
    };

    for (final pill in pills.entries) {
      test('${pill.key} on a card', () {
        final ground = Color.alphaBlend(pill.value.$2, colors.card.background);
        expect(
          contrastRatio(pill.value.$1, ground),
          greaterThanOrEqualTo(4.5),
          reason:
              '${pill.key} reads below the 4.5:1 WCAG 1.4.3 minimum once its tint is '
              'composited over the card it sits on.',
        );
      });
    }
  });

  ///
  /// The tinted cards P2P draws are grounds of their own: a gold or green wash
  /// over the screen, not the flat card fill the matrix above covers. Only the
  /// roles each card actually carries are asserted, for the same reason
  /// `card.backgroundLocked` is left out of the matrix.
  ///
  group('a tinted card clears AA 4.5:1 for the roles it carries', () {
    final surface = AppColorScheme.dark.surface;
    final pairs = <String, (Color, Color)>{
      'text.primary on the streak level card': (text.primary, colors.card.backgroundGoldTint),
      'text.warning on the streak level card': (text.warning, colors.card.backgroundGoldTint),
      'text.muted on the streak level card': (text.muted, colors.card.backgroundGoldTint),
      'text.link on the streak level card': (text.link, colors.card.backgroundGoldTint),
      'text.link on a picked vote button': (text.link, colors.button.outlineGoldBackground),
      'text.primary on the congratulations card': (text.primary, colors.badge.successBackground),
      'text.secondary on the congratulations card': (
        text.secondary,
        colors.badge.successBackground,
      ),
      'text.primary on the active pill over a still': (text.primary, colors.pill.pointsBackground),
    };

    for (final pair in pairs.entries) {
      test(pair.key, () {
        final ground = Color.alphaBlend(pair.value.$2, surface);
        expect(
          contrastRatio(pair.value.$1, ground),
          greaterThanOrEqualTo(4.5),
          reason:
              '${pair.key} reads below the 4.5:1 WCAG 1.4.3 minimum once the card tint is '
              'composited over the screen behind it.',
        );
      });
    }
  });

  ///
  /// The glyph boxes are a tint over a tint: a gold pane inside a gold-washed
  /// card, or a gold disc on the flat one.
  ///
  group('a glyph box clears AA 4.5:1 through both of its tints', () {
    final surface = AppColorScheme.dark.surface;

    test('the level disc figure inside the streak level card', () {
      final card = Color.alphaBlend(colors.card.backgroundGoldTint, surface);
      final disc = Color.alphaBlend(colors.tag.goldBackground, card);
      expect(contrastRatio(text.warning, disc), greaterThanOrEqualTo(4.5));
    });

    test("the level track's current disc figure", () {
      final disc = Color.alphaBlend(colors.tag.goldBackground, colors.card.background);
      expect(contrastRatio(text.warning, disc), greaterThanOrEqualTo(4.5));
    });
  });

  ///
  /// A tick sits on a solid fill rather than a tint, and carries meaning, so it
  /// is held to the 3:1 a graphical object needs rather than 4.5:1.
  ///
  group('a check disc clears AA 3:1 against its fill', () {
    test('the inline tick on its green square', () {
      expect(contrastRatio(text.inverse, colors.status.success), greaterThanOrEqualTo(3));
    });

    test('the level tick on its gold disc', () {
      expect(contrastRatio(text.inverse, icon.accent), greaterThanOrEqualTo(3));
    });

    test('the outlined tick against the green wash it sits in', () {
      final ground = Color.alphaBlend(colors.badge.successBackground, colors.card.background);
      expect(contrastRatio(colors.status.success, ground), greaterThanOrEqualTo(3));
    });
  });

  group('the disabled roles are exempt, and only because they label a dead control', () {
    test('text.disabled would fail as content, which is why nothing uses it there', () {
      // WCAG 1.4.3 exempts an inactive component's own label. The moment this
      // tone is used for a value, a name or a caption it becomes a failure —
      // the locked badge tile shipped at 2.38:1 that way.
      expect(contrastRatio(text.disabled, colors.card.background), lessThan(4.5));
    });

    test('icon.disabled likewise', () {
      expect(contrastRatio(icon.disabled, colors.card.backgroundRaised), lessThan(3));
    });
  });
}
