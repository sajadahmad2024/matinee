import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:template/app/startup/app_startup_cubit.dart';
import 'package:template/app/startup/app_startup_state.dart';
import 'package:template/core/l10n/l10n.dart';
import 'package:template/core/widgets/error_view.dart';

///
/// The only route reachable before startup succeeds. The router redirect keeps
/// the user here and returns them to the requested location afterwards.
///
class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocBuilder<AppStartupCubit, AppStartupState>(
        builder: (context, state) => switch (state) {
          StartupInProgress() || StartupSuccess() => const Center(child: CircularProgressIndicator()),
          StartupFailure() => ErrorView(
            message: context.l10n.startupFailed,
            onRetry: context.read<AppStartupCubit>().retry,
          ),
        },
      ),
    );
  }
}
