import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/theme/app_radius.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/check_disc.dart';

/// One finished action on the receipt: a tick, what it was, and that it is done.
class CompletedActionRow extends StatelessWidget {
  const CompletedActionRow({required this.title, required this.doneLabel, super.key});

  final String title;
  final String doneLabel;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors;
    return Semantics(
      role: SemanticsRole.listItem,
      container: true,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: colors.card.background,
          border: Border.all(color: colors.card.border),
          borderRadius: const BorderRadius.all(Radius.circular(AppRadius.md)),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
          child: Row(
            spacing: AppSpacing.md,
            children: [
              const CheckDisc.outlined(),
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyle.bodyMedium.copyWith(color: colors.text.primary),
                ),
              ),
              Text(
                doneLabel,
                style: AppTextStyle.caption.copyWith(color: colors.text.success),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
