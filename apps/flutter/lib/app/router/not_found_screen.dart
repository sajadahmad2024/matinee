import 'package:flutter/material.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/widgets/error_view.dart';

class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({required this.uri, super.key});

  final Uri uri;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: ErrorView(
        message: context.l10n.pageNotFound(uri.path),
        actionLabel: context.l10n.goHome,
        onRetry: () => const HomeRoute().go(context),
      ),
    );
  }
}
