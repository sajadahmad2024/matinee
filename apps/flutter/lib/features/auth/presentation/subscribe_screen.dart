import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_flow_listener.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_submit_button.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_content.dart';

class SubscribeScreen extends StatelessWidget {
  const SubscribeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => AuthCubit(getIt<AuthRepository>()),
      child: const SubscribeView(),
    );
  }
}

///
/// The paywall that closes the sign-up flow. It sits on the warm auth surface
/// rather than the app's navy one, so it reads the auth roles throughout.
///
@visibleForTesting
class SubscribeView extends StatelessWidget {
  const SubscribeView({super.key});

  static const double _contentMaxWidth = 560;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return AuthFlowListener(
      onSuccess: (_) => const HomeRoute().go(context),
      child: Scaffold(
        backgroundColor: context.appColors.auth.surface,
        body: SafeArea(
          bottom: false,
          child: ContentContainer(
            maxWidth: _contentMaxWidth,
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
                  child: _Header(),
                ),
                const Expanded(
                  child: SingleChildScrollView(
                    padding: EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
                    child: SubscribeBody(),
                  ),
                ),
                // The design insets the CTA further than the content above it.
                Padding(
                  padding: EdgeInsets.only(
                    left: AppScreenPadding.auth,
                    right: AppScreenPadding.auth,
                    top: AppSpacing.xxxl,
                    bottom: context.bottomInset(AppSpacing.screenBottom),
                  ),
                  child: BlocBuilder<AuthCubit, AuthState>(
                    builder: (context, state) => AuthSubmitButton(
                      label: l10n.subscribeCta,
                      isLoading: state is AuthLoading,
                      onPressed: () => unawaited(context.read<AuthCubit>().subscribe()),
                    ),
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

///
/// The eyebrow and the way past the paywall. Skipping is the only other exit:
/// the design draws no close affordance.
///
class _Header extends StatelessWidget {
  const _Header();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // The eyebrow yields to the skip action rather than pushing it off
          // the row once the type scales up.
          const Flexible(child: SubscribeEyebrow()),
          TextButton(
            onPressed: () => const HomeRoute().go(context),
            style: TextButton.styleFrom(foregroundColor: context.appColors.text.secondary),
            child: Text(context.l10n.subscribeSkip),
          ),
        ],
      ),
    );
  }
}
