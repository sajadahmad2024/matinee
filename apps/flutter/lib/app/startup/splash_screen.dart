import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/startup/app_startup_cubit.dart';
import 'package:matinee/app/startup/app_startup_state.dart';
import 'package:matinee/core/assets/assets.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/error_view.dart';

///
/// The logo is drawn at the size the design draws it and never scales up on a
/// wide window; the frame only ever centres it.
///
const double _logoWidth = 260;

///
/// The only route reachable before startup succeeds. The router redirect keeps
/// the user here and returns them to the requested location afterwards.
///
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: BoxDecoration(gradient: context.appColors.overlay.splash),
        child: BlocBuilder<AppStartupCubit, AppStartupState>(
          builder: (context, state) => switch (state) {
            StartupInProgress() || StartupSuccess() => const _SplashBody(),
            StartupFailure() => ErrorView(
              message: context.l10n.startupFailed,
              onRetry: context.read<AppStartupCubit>().retry,
            ),
          },
        ),
      ),
    );
  }
}

///
/// The design centres the logo in the frame and draws nothing else.
///
class _SplashBody extends StatelessWidget {
  const _SplashBody();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
        child: Image.asset(
          AppImageAssets.splashLogo,
          width: _logoWidth,
          fit: BoxFit.contain,
          semanticLabel: context.l10n.appTitle,
        ),
      ),
    );
  }
}
