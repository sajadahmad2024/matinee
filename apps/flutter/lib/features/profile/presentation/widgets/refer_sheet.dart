import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_elevation.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:url_launcher/url_launcher.dart';

///
/// Opens the refer-a-friend sheet over the profile.
///
Future<void> showReferSheet(BuildContext context, {required String referralCode}) {
  return showModalBottomSheet<void>(
    context: context,
    // The route covers the screen while only the block at the bottom is
    // painted. A sheet sized to its content would put the copy confirmation
    // behind itself, because the snackbar belongs to whatever scaffold is
    // underneath; this way the sheet carries its own.
    isScrollControlled: true,
    useRootNavigator: true,
    backgroundColor: context.appColors.sheet.routeBackground,
    showDragHandle: false,
    builder: (_) => ReferSheet(referralCode: referralCode),
  );
}

///
/// The referral code, the four ways to pass it on, and the share action.
///
/// The design draws the share targets as coloured discs carrying a letter
/// rather than the brand marks, which is what this renders; the marks
/// themselves are on the design system's list of SVGs still to be exported.
///
@visibleForTesting
class ReferSheet extends StatelessWidget {
  const ReferSheet({required this.referralCode, super.key});

  static const double _discSize = 48;

  final String referralCode;

  Future<void> _copyCode(BuildContext context) async {
    final l10n = context.l10n;
    final messenger = ScaffoldMessenger.of(context);
    await Clipboard.setData(ClipboardData(text: referralCode));
    messenger.showSnackBar(SnackBar(content: Text(l10n.referCopied)));
  }

  ///
  /// Hands the code to an app that takes a shared message from a link, and
  /// falls back to the clipboard when the app is not installed. A launch that
  /// fails for a platform reason is left to the global net, as elsewhere.
  ///
  Future<void> _shareVia(BuildContext context, Uri uri) async {
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
      return;
    }
    if (context.mounted) {
      await _copyCode(context);
    }
  }

  ///
  /// Instagram has no link that opens a share with text in it, so the code
  /// goes to the clipboard and the message says where to paste it.
  ///
  Future<void> _copyForInstagram(BuildContext context) async {
    final l10n = context.l10n;
    final messenger = ScaffoldMessenger.of(context);
    await Clipboard.setData(ClipboardData(text: referralCode));
    messenger.showSnackBar(SnackBar(content: Text(l10n.referCopiedForInstagram)));
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    final textTheme = Theme.of(context).textTheme;
    return ScaffoldMessenger(
      child: Scaffold(
        backgroundColor: colors.sheet.routeBackground,
        // A context below the messenger and the scaffold above: the build
        // context is outside both, so a snackbar asked for with it would go to
        // the page underneath and never be seen.
        body: Builder(
          builder: (context) => Column(
            children: [
              // The uncovered part of the screen still dismisses the sheet, which
              // the modal barrier would do if this route were not painting over
              // it.
              Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: Navigator.of(context).pop,
                  child: const SizedBox.expand(),
                ),
              ),
              _Surface(
                child: ContentContainer(
                  maxWidth: ContentContainer.form,
                  child: Padding(
                    padding: EdgeInsets.only(
                      left: AppScreenPadding.sheet,
                      right: AppScreenPadding.sheet,
                      bottom: context.bottomInset(AppSpacing.xxxl),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Text(
                                l10n.referTitle,
                                style: textTheme.titleMedium?.copyWith(color: colors.text.primary),
                              ),
                            ),
                            IconButton(
                              onPressed: Navigator.of(context).pop,
                              tooltip: l10n.referClose,
                              icon: const Icon(Icons.close, size: AppIconSize.md),
                            ),
                          ],
                        ),
                        Padding(
                          padding: const EdgeInsets.only(top: AppSpacing.lg),
                          child: _CodeCard(code: referralCode, onCopy: () => _copyCode(context)),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: AppSpacing.xl),
                          child: Row(
                            // An even share each, so a long label or a scaled-up
                            // one ellipsises inside its own column rather than
                            // pushing the row past the sheet.
                            children: [
                              Expanded(
                                child: _ShareTarget(
                                  letter: 'W',
                                  label: l10n.referShareWhatsapp,
                                  color: colors.share.whatsapp,
                                  onTap: () => _shareVia(
                                    context,
                                    Uri.https('wa.me', '/', {'text': referralCode}),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: _ShareTarget(
                                  letter: 'T',
                                  label: l10n.referShareTelegram,
                                  color: colors.share.telegram,
                                  onTap: () => _shareVia(
                                    context,
                                    Uri.https('t.me', '/share/url', {'url': referralCode}),
                                  ),
                                ),
                              ),
                              Expanded(
                                child: _ShareTarget(
                                  letter: 'I',
                                  label: l10n.referShareInstagram,
                                  color: colors.share.instagram,
                                  onTap: () => _copyForInstagram(context),
                                ),
                              ),
                              Expanded(
                                child: _ShareTarget(
                                  letter: '#',
                                  label: l10n.referShareCopy,
                                  color: colors.icon.muted,
                                  onTap: () => _copyCode(context),
                                ),
                              ),
                            ],
                          ),
                        ),
                        FilledButton(
                          onPressed: () => _copyCode(context),
                          child: Text(l10n.referCta),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

///
/// The sheet's own frame, drawn here rather than by the sheet theme: the route
/// behind it is transparent so the block can hug its content.
///
class _Surface extends StatelessWidget {
  const _Surface({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.sheet;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: AppRadius.sheetTop,
        border: Border(top: BorderSide(color: colors.border)),
        boxShadow: AppElevation.sheet,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: AppSpacing.md, bottom: AppSpacing.sm),
            child: SizedBox.fromSize(
              size: AppControlHeight.sheetHandle,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: colors.handle,
                  borderRadius: const BorderRadius.all(Radius.circular(AppRadius.full)),
                ),
              ),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class _CodeCard extends StatelessWidget {
  const _CodeCard({required this.code, required this.onCopy});

  final String code;
  final VoidCallback onCopy;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: colors.card.backgroundRaised,
        borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
      ),
      child: Padding(
        padding: AppSpacing.cardPadding,
        child: Row(
          spacing: AppSpacing.md,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: AppSpacing.xs,
                children: [
                  Text(
                    l10n.referCodeLabel,
                    style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
                  ),
                  Text(
                    code,
                    style: AppTextStyle.numeralLg.copyWith(color: colors.text.numeral),
                  ),
                ],
              ),
            ),
            OutlinedButton(onPressed: onCopy, child: Text(l10n.referCopyCode)),
          ],
        ),
      ),
    );
  }
}

class _ShareTarget extends StatelessWidget {
  const _ShareTarget({
    required this.letter,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final String letter;
  final String label;
  final Color color;
  final Future<void> Function() onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    final textTheme = Theme.of(context).textTheme;
    return InkWell(
      onTap: () => unawaited(onTap()),
      borderRadius: const BorderRadius.all(Radius.circular(AppRadius.sm)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xs, vertical: AppSpacing.xs),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.sm,
          children: [
            SizedBox.square(
              dimension: ReferSheet._discSize,
              child: DecoratedBox(
                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                child: Center(
                  child: Text(
                    letter,
                    style: textTheme.titleMedium?.copyWith(color: colors.text.primary),
                  ),
                ),
              ),
            ),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyle.caption.copyWith(color: colors.text.secondary),
            ),
          ],
        ),
      ),
    );
  }
}
