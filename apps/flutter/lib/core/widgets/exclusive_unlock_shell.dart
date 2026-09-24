import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/exclusive_offer.dart';
import 'package:matinee/core/widgets/exclusive_tag.dart';

///
/// The tag-and-offer header shared by every step of an unlock prompt; it
/// scrolls rather than overflows once the copy or text scale does not fit.
///
/// [bottom] is the step-specific content under the offer — a preview and
/// its CTA, or a spend confirmation and its own.
///
class ExclusiveUnlockShell extends StatelessWidget {
  const ExclusiveUnlockShell({
    required this.tagLabel,
    required this.title,
    required this.unlocksForLabel,
    required this.costLabel,
    required this.bottom,
    this.isScreenTitle = false,
    super.key,
  });

  final String tagLabel;
  final String title;
  final String unlocksForLabel;
  final String costLabel;
  final Widget bottom;

  /// Marks [title] as the screen's own heading, for a caller with no other
  /// `ScreenTitle` of its own.
  final bool isScreenTitle;

  @override
  Widget build(BuildContext context) {
    // Fills the viewport and scrolls only once the copy does not fit — 77 past
    // the bottom at a 1.5 scale, where the unlock action was unreachable.
    final bottomPadding = context.bottomInset(AppSpacing.xxl);
    return LayoutBuilder(
      builder: (context, constraints) => SingleChildScrollView(
        padding: EdgeInsets.only(
          left: AppScreenPadding.main,
          right: AppScreenPadding.main,
          bottom: bottomPadding,
        ),
        child: ConstrainedBox(
          constraints: BoxConstraints(
            // The gap comes off the minimum: a scroll view lays its padding out
            // around the child, so a full viewport would always overflow it.
            minHeight: (constraints.maxHeight - bottomPadding).clamp(0, double.infinity),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: Padding(
                  padding: const EdgeInsets.only(top: AppSpacing.md),
                  child: ExclusiveTag(label: tagLabel),
                ),
              ),

              ExclusiveOffer(
                title: title,
                unlocksFor: unlocksForLabel,
                cost: costLabel,
                isScreenTitle: isScreenTitle,
              ),

              bottom,
            ],
          ),
        ),
      ),
    );
  }
}
