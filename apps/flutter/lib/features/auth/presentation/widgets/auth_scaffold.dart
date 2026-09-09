import 'package:flutter/material.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';

///
/// The frame every auth screen shares: the warm surface, the back header the
/// design puts above every form, and a scrolling content column inset by the
/// auth side padding.
///
/// [footer] sits at the bottom of the viewport while the content is short,
/// which is how the design places the legal paragraph, and follows the content
/// down once it grows past a screenful.
///
class AuthScaffold extends StatelessWidget {
  const AuthScaffold({
    required this.title,
    required this.children,
    super.key,
    this.leading,
    this.blockGap = AppSpacing.xxxl,
    this.footer,
  });

  static const double _contentMaxWidth = 560;

  final String title;
  final List<Widget> children;

  /// The back disc, on the screens the design gives one. Sign In has none.
  final Widget? leading;

  final double blockGap;
  final Widget? footer;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.appColors.auth.surface,
      body: SafeArea(
        child: ContentContainer(
          maxWidth: _contentMaxWidth,
          child: Column(
            children: [
              _Header(title: title, leading: leading),
              Expanded(
                child: _Body(blockGap: blockGap, footer: footer, children: children),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.title, required this.leading});

  final String title;
  final Widget? leading;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(
        left: AppSpacing.xl,
        right: AppSpacing.xl,
        top: AppSpacing.xs,
        bottom: AppSpacing.sm,
      ),
      child: Row(
        spacing: AppSpacing.md,
        children: [
          ?leading,
          Expanded(
            child: Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(color: context.appColors.auth.onSurface),
            ),
          ),
        ],
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.blockGap, required this.footer, required this.children});

  final double blockGap;
  final Widget? footer;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) => SingleChildScrollView(
        padding: const EdgeInsets.only(
          left: AppScreenPadding.auth,
          right: AppScreenPadding.auth,
          top: AppSpacing.xxl,
          bottom: AppSpacing.xxxl,
        ),
        child: ConstrainedBox(
          // The vertical padding comes off the viewport so the footer lands
          // inside it; a viewport shorter than that padding would otherwise
          // ask for a negative height.
          constraints: BoxConstraints(
            minHeight: (constraints.maxHeight - AppSpacing.xxl - AppSpacing.xxxl).clamp(0, double.infinity),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: blockGap,
                children: children,
              ),
              if (footer case final footer?)
                Padding(
                  padding: EdgeInsets.only(top: blockGap),
                  child: footer,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
