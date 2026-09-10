import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/data/models/auth_outcome.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_flow_listener.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_submit_button.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_content.dart';

///
/// Opens the paywall over whatever screen asked for it, and resolves true once
/// the user has subscribed.
///
/// The same offer as SubscribeScreen, which ends sign-up and sends the user on
/// to the app. This is the form an upgrade action takes later — from the
/// profile, say — where the user is mid-task and expects to land back where
/// they were, so it closes rather than navigating.
///
Future<bool> showSubscribeSheet(BuildContext context) async {
  final subscribed = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    // The paywall is warm where the app is navy, matching the screen it
    // mirrors; everything else comes from the sheet theme.
    backgroundColor: context.appColors.auth.surface,
    useSafeArea: true,
    // Above the shell, so the sheet covers the bottom nav the way the design
    // draws it rather than being boxed inside the current tab.
    useRootNavigator: true,
    builder: (_) => BlocProvider(
      create: (_) => AuthCubit(getIt<AuthRepository>()),
      child: const SubscribeSheet(),
    ),
  );
  return subscribed ?? false;
}

///
/// The body of the paywall sheet: the offer scrolls, the two actions stay put
/// beneath it.
///
@visibleForTesting
class SubscribeSheet extends StatelessWidget {
  const SubscribeSheet({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    // A messenger and a scaffold of the sheet's own. Without them a failure
    // snackbar goes to the page underneath, where the scrim hides it, and the
    // footer floats mid-sheet on a window taller than the offer instead of
    // sitting under it.
    return ScaffoldMessenger(
      child: Scaffold(
        backgroundColor: context.appColors.sheet.routeBackground,
        body: AuthFlowListener(
          onSuccess: (outcome) {
            if (outcome == AuthOutcome.subscribed) {
              Navigator.of(context).pop(true);
            }
          },
          child: ContentContainer(
            maxWidth: ContentContainer.form,
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: AppScreenPadding.main,
                    vertical: AppSpacing.sm,
                  ),
                  child: Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: SubscribeEyebrow(),
                  ),
                ),
                // The offer is taller than the sheet on a phone, so it scrolls
                // and the actions below stay put.
                const Expanded(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
                    child: SubscribeBody(),
                  ),
                ),
                Padding(
                  padding: EdgeInsets.only(
                    left: AppScreenPadding.auth,
                    right: AppScreenPadding.auth,
                    top: AppSpacing.xxxl,
                    bottom: context.bottomInset(AppSpacing.xxxl),
                  ),
                  child: Column(
                    spacing: AppSpacing.cardGap,
                    children: [
                      BlocBuilder<AuthCubit, AuthState>(
                        builder: (context, state) => AuthSubmitButton(
                          label: l10n.subscribeCta,
                          isLoading: state is AuthLoading,
                          onPressed: () => unawaited(context.read<AuthCubit>().subscribe()),
                        ),
                      ),
                      // The sheet's way out. The screen puts this beside the
                      // eyebrow; here it is the second action under the CTA.
                      SizedBox(
                        height: AppControlHeight.cta,
                        width: double.infinity,
                        child: TextButton(
                          onPressed: () => Navigator.of(context).pop(false),
                          child: Text(l10n.subscribeSkip),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
