import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/config/legal_links.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/theme/app_text_styles.dart';
import 'package:matinee/core/theme/extensions/build_context_extensions.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/auth/presentation/subscribe_sheet.dart';
import 'package:matinee/features/profile/data/models/profile.dart';
import 'package:matinee/features/profile/data/profile_repository.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_cubit.dart';
import 'package:matinee/features/profile/presentation/cubit/profile_state.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_avatar.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_menu_row.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_stat_card.dart';
import 'package:matinee/features/profile/presentation/widgets/profile_upgrade_card.dart';
import 'package:matinee/features/profile/presentation/widgets/refer_sheet.dart';
import 'package:url_launcher/url_launcher.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = ProfileCubit(getIt<ProfileRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const ProfileView(),
    );
  }
}

@visibleForTesting
class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: ContentContainer(
          maxWidth: ContentContainer.reading,
          child: BlocBuilder<ProfileCubit, ProfileState>(
            builder: (context, state) => switch (state) {
              ProfileInitial() => const SizedBox.shrink(),
              ProfileLoading() => const LoadingView(),
              ProfileFailure(:final error) => ErrorView(
                message: error.localizedMessage(l10n),
                onRetry: () => unawaited(context.read<ProfileCubit>().load()),
              ),
              ProfileSuccess(:final profile) => _Body(profile: profile),
            },
          ),
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.profile});

  /// The plan line the design writes as 'Pro plan expires Jun 30, 2026'.
  static String _expiryDate(BuildContext context, DateTime date) {
    return '${MaterialLocalizations.of(context).formatShortMonthDay(date)}, ${date.year}';
  }

  final Profile profile;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _Header(profile: profile)),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: AppScreenPadding.main),
          sliver: SliverList.list(
            children: [
              Row(
                spacing: AppSpacing.cardGap,
                children: [
                  Expanded(
                    child: ProfileStatCard(
                      value: context.decimalFormat.format(profile.totalPoints),
                      label: l10n.profileStatPoints,
                      semanticLabel: l10n.profileStatValue(
                        context.decimalFormat.format(profile.totalPoints),
                        l10n.profileStatPoints,
                      ),
                    ),
                  ),
                  Expanded(
                    child: ProfileStatCard(
                      value: context.decimalFormat.format(profile.streaks),
                      label: l10n.profileStatStreaks,
                      semanticLabel: l10n.profileStatValue(
                        context.decimalFormat.format(profile.streaks),
                        l10n.profileStatStreaks,
                      ),
                    ),
                  ),
                  Expanded(
                    child: ProfileStatCard(
                      value: '#${context.decimalFormat.format(profile.rank)}',
                      label: l10n.profileStatRank,
                      semanticLabel: l10n.profileStatValue(
                        '#${context.decimalFormat.format(profile.rank)}',
                        l10n.profileStatRank,
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.lg),
                child: ProfileUpgradeCard(
                  title: l10n.profileUpgradeTitle,
                  subtitle: l10n.profileUpgradeSubtitle(
                    profile.planName,
                    _expiryDate(context, profile.planExpiresOn),
                  ),
                  actionLabel: l10n.profileUpgradeCta,
                  onUpgrade: () => unawaited(showSubscribeSheet(context)),
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: AppSpacing.lg),
                child: _Menu(referralCode: profile.referralCode),
              ),
            ],
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(height: context.bottomInset(AppSpacing.xxxl)),
        ),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.profile});

  final Profile profile;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final colors = context.appColors;
    return Column(
      children: [
        // No top padding: the frame leaves 11 above the bell, and the bell's 48
        // tap target already carries 12 around its 24 glyph.
        Padding(
          padding: const EdgeInsets.only(
            left: AppScreenPadding.main,
            right: AppScreenPadding.main,
            bottom: AppSpacing.xxl,
          ),
          child: Row(
            children: [
              Expanded(
                child: ScreenTitle(
                  label: l10n.profileTitle,
                  child: Text(
                    l10n.profileTitle.toUpperCase(),
                    style: AppTextStyle.overline.copyWith(color: colors.text.secondary),
                  ),
                ),
              ),
              IconButton(
                // The frame draws a bell whatever the component's name says. No
                // notifications screen exists yet, so the control is disabled.
                onPressed: null,
                tooltip: l10n.profileMenuNotifications,
                icon: const Icon(Icons.notifications_none),
              ),
            ],
          ),
        ),
        ProfileAvatar(name: profile.name, imageUrl: profile.avatarUrl),
        Padding(
          padding: const EdgeInsets.only(top: AppSpacing.sm),
          child: Text(
            profile.name,
            style: Theme.of(context).textTheme.titleLarge?.copyWith(color: colors.text.primary),
          ),
        ),
        // The design sets these two lines tight together, so the gap around the
        // button is trimmed rather than its 48 tap target.
        TextButton(
          // Pushed, not gone to: this is a detail screen the user comes
          // back from, so the platform back gesture has to return here.
          onPressed: () => unawaited(const EditProfileRoute().push<void>(context)),
          style: TextButton.styleFrom(padding: EdgeInsets.zero),
          child: Text(l10n.profileEditAction),
        ),
        const SizedBox(height: AppSpacing.sm),
      ],
    );
  }
}

class _Menu extends StatelessWidget {
  const _Menu({required this.referralCode});

  final String referralCode;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Column(
      children: [
        // My Earns and Notifications have no screen yet, so they render as the
        // design draws them and do nothing until one exists.
        ProfileMenuRow(label: l10n.profileMenuEarns, onTap: null),
        ProfileMenuRow(
          label: l10n.profileMenuRefer,
          onTap: () => unawaited(showReferSheet(context, referralCode: referralCode)),
        ),
        ProfileMenuRow(label: l10n.profileMenuNotifications, onTap: null),
        ProfileMenuRow(
          label: l10n.profileMenuTerms,
          onTap: () => unawaited(launchUrl(AppLegalLinks.terms)),
        ),
        ProfileMenuRow(
          label: l10n.profileMenuPrivacy,
          onTap: () => unawaited(launchUrl(AppLegalLinks.privacy)),
        ),
        ProfileMenuRow(
          label: l10n.profileMenuLogout,
          icon: Icons.logout,
          isDestructive: true,
          onTap: null,
        ),
      ],
    );
  }
}
