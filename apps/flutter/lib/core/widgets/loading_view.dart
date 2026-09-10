import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:matinee/core/l10n/l10n.dart';

///
/// The spinner every screen shows while its content is on the way. A bare
/// CircularProgressIndicator is silent; the status role announces it politely.
///
class LoadingView extends StatelessWidget {
  const LoadingView({super.key, this.label});

  /// Defaults to the localised 'Loading'.
  final String? label;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      role: SemanticsRole.status,
      label: label ?? context.l10n.a11yLoading,
      child: const Center(child: CircularProgressIndicator()),
    );
  }
}
