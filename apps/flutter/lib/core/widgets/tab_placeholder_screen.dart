import 'package:flutter/material.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/widgets/screen_title.dart';

///
/// Stands in for a tab not yet built, so the shell can be navigated before its
/// screens exist. Each use disappears as its feature lands.
///
class TabPlaceholderScreen extends StatelessWidget {
  const TabPlaceholderScreen({required this.title, super.key});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: ScreenTitle(label: title, child: Text(title)),
      ),
      body: ContentContainer(
        child: Center(
          child: Text(context.l10n.tabPlaceholder(title), textAlign: TextAlign.center),
        ),
      ),
    );
  }
}
