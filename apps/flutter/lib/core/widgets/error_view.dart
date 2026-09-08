import 'package:flutter/material.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_spacing.dart';

class ErrorView extends StatelessWidget {
  const ErrorView({required this.message, required this.onRetry, super.key, this.actionLabel});

  final String message;
  final VoidCallback onRetry;

  // Defaults to the localised "Retry".
  final String? actionLabel;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: AppSpacing.lg,
          children: [
            Text(message, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyLarge),
            FilledButton(onPressed: onRetry, child: Text(actionLabel ?? context.l10n.retry)),
          ],
        ),
      ),
    );
  }
}
