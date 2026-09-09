import 'package:flutter/material.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/widgets/tab_placeholder_screen.dart';

class P2pScreen extends StatelessWidget {
  const P2pScreen({super.key});

  @override
  Widget build(BuildContext context) => TabPlaceholderScreen(title: context.l10n.navP2p);
}
