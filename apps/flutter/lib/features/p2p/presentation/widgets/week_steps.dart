import 'package:flutter/material.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The week as a row of bars, one per day the level asks for, filled as far as
/// the streak has got.
///
/// Excluded: the caption beside it counts the same days in words.
///
class WeekSteps extends StatelessWidget {
  const WeekSteps({required this.done, required this.total, super.key});

  final int done;
  final int total;

  @override
  Widget build(BuildContext context) {
    final colors = context.appColors.progress;
    return ExcludeSemantics(
      child: Row(
        spacing: AppSpacing.xs,
        children: [
          for (var day = 0; day < total; day++)
            Expanded(
              child: SizedBox(
                height: AppControlHeight.progressBarThick,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: day < done ? null : colors.track,
                    gradient: day < done ? colors.fill : null,
                    borderRadius: const BorderRadius.all(
                      Radius.circular(AppControlHeight.progressBarThick / 2),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
