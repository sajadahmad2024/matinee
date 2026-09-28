import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/app_bottom_sheet.dart';
import 'package:matinee/core/widgets/logo_tile.dart';
import 'package:matinee/core/widgets/section_label.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/presentation/widgets/details/cast_member.dart';
import 'package:matinee/features/reels/presentation/widgets/reel_credits.dart';

/// Opens [VideoDetailsSheet] for [reel].
Future<void> showVideoDetailsSheet(
  BuildContext context, {
  required Reel reel,
  ValueChanged<ReelStreamingService>? onStreamingTap,
  ValueChanged<ReelCastMember>? onCastTap,
}) {
  return showAppBottomSheet<void>(
    context,
    builder: (_) => VideoDetailsSheet(reel: reel, onStreamingTap: onStreamingTap, onCastTap: onCastTap),
  );
}

///
/// What a video is: its title, studio and genres, synopsis, where it streams
/// and who is in it. Sized to its content; a long synopsis scrolls.
///
/// A reel without a synopsis shows its caption; the streaming and cast rows
/// are left out when the reel has none.
///
class VideoDetailsSheet extends StatelessWidget {
  const VideoDetailsSheet({required this.reel, super.key, this.onStreamingTap, this.onCastTap});

  final Reel reel;

  /// Makes each streaming logo a button.
  final ValueChanged<ReelStreamingService>? onStreamingTap;

  /// Makes each cast member a button.
  final ValueChanged<ReelCastMember>? onCastTap;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final onStreamingTap = this.onStreamingTap;
    final onCastTap = this.onCastTap;
    return AppBottomSheet(
      title: reel.title,
      titleStyle: AppTextStyle.headlineSmall,
      closeLabel: l10n.reelsDetailsClose,
      body: SingleChildScrollView(
        padding: EdgeInsets.only(bottom: context.bottomInset(AppSpacing.xxxl)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _Inset(
              child: ReelCredits(studio: reel.author.displayName, genres: reel.genres),
            ),
            const SizedBox(height: AppSpacing.lg),
            _Inset(
              child: Text(
                reel.synopsis ?? reel.caption,
                style: AppTextStyle.bodyMedium.copyWith(color: context.appColors.text.secondary),
              ),
            ),
            if (reel.streamingOn.isNotEmpty)
              _Section(
                label: l10n.reelsDetailsStreamingOn,
                spacing: AppSpacing.md,
                children: [
                  for (final service in reel.streamingOn)
                    LogoTile(
                      imageUrl: service.logoUrl,
                      semanticLabel: service.name,
                      onTap: onStreamingTap == null ? null : () => onStreamingTap(service),
                    ),
                ],
              ),
            if (reel.cast.isNotEmpty)
              _Section(
                label: l10n.reelsDetailsCast,
                spacing: AppSpacing.lg,
                children: [
                  for (final member in reel.cast)
                    CastMember(
                      name: member.name,
                      imageUrl: member.imageUrl,
                      onTap: onCastTap == null ? null : () => onCastTap(member),
                    ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

/// The sheet's side padding, for content that does not scroll sideways.
class _Inset extends StatelessWidget {
  const _Inset({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
      child: child,
    );
  }
}

///
/// An eyebrow over a row that scrolls sideways once it outgrows the sheet. The
/// row pads inside the scroll view, so it scrolls out to the sheet's edges.
///
class _Section extends StatelessWidget {
  const _Section({required this.label, required this.spacing, required this.children});

  final String label;
  final double spacing;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: AppSpacing.md,
        children: [
          _Inset(child: SectionLabel(label: label, isMuted: true)),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              spacing: spacing,
              children: children,
            ),
          ),
        ],
      ),
    );
  }
}
