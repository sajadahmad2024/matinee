import 'package:flutter/material.dart';
import 'package:template/core/l10n/l10n.dart';
import 'package:template/core/responsive/responsive.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.l10n.appTitle)),
      body: ContentContainer(
        child: Center(child: Text(context.l10n.homePlaceholder)),
      ),
    );
  }
}
