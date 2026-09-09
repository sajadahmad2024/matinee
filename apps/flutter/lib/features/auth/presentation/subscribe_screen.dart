import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/data/auth_repository.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_cubit.dart';
import 'package:matinee/features/auth/presentation/cubit/auth_state.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_flow_listener.dart';
import 'package:matinee/features/auth/presentation/widgets/auth_submit_button.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_benefit_row.dart';
import 'package:matinee/features/auth/presentation/widgets/subscribe_feature_row.dart';

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
                    child: _Body(),
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
    final l10n = context.l10n;
    final colors = context.appColors;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // The eyebrow yields to the skip action rather than pushing it off
          // the row once the type scales up.
          Flexible(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              spacing: AppSpacing.sm,
              children: [
                Icon(Icons.star, size: AppIconSize.sm, color: colors.icon.accent),
                Flexible(
                  child: Text(
                    l10n.subscribeEyebrow,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(color: colors.text.link),
                  ),
                ),
              ],
            ),
          ),
          TextButton(
            onPressed: () => const HomeRoute().go(context),
            style: TextButton.styleFrom(foregroundColor: colors.text.secondary),
            child: Text(l10n.subscribeSkip),
          ),
        ],
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body();

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors.auth;
    final textTheme = Theme.of(context).textTheme;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.xl),
          child: Text(
            l10n.subscribeTitle,
            style: textTheme.headlineMedium?.copyWith(color: colors.onSurface),
          ),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: AppSpacing.cardGap,
          children: [
            SubscribeFeatureRow(
              title: l10n.subscribeFeature1Title,
              subtitle: l10n.subscribeFeature1Subtitle,
              chipLabel: l10n.subscribeUnlockChip,
            ),
            SubscribeFeatureRow(
              title: l10n.subscribeFeature2Title,
              subtitle: l10n.subscribeFeature2Subtitle,
              chipLabel: l10n.subscribeUnlockChip,
            ),
            SubscribeFeatureRow(
              title: l10n.subscribeFeature3Title,
              subtitle: l10n.subscribeFeature3Subtitle,
              chipLabel: l10n.subscribeUnlockChip,
            ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.xxl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: AppSpacing.lg,
            children: [
              Text(
                l10n.subscribeWhyTitle,
                style: AppTextStyle.overline.copyWith(color: colors.onSurfaceVariant),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: AppSpacing.md,
                children: [
                  SubscribeBenefitRow(label: l10n.subscribeBenefit1),
                  SubscribeBenefitRow(label: l10n.subscribeBenefit2),
                  SubscribeBenefitRow(label: l10n.subscribeBenefit3),
                  SubscribeBenefitRow(label: l10n.subscribeBenefit4),
                  SubscribeBenefitRow(label: l10n.subscribeBenefit5),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
