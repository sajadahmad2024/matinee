import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_sizes.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/app_bottom_sheet.dart';
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
/// The same offer as SubscribeScreen, which ends sign-up; here the user is
/// mid-task and expects to land back where they were, so it closes instead.
///
Future<bool> showSubscribeSheet(BuildContext context) async {
  final subscribed = await showAppBottomSheet<bool>(
    context,
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
    return AppBottomSheet(
      closeLabel: l10n.subscribeClose,
      // Full height: the offer is taller than the sheet on a phone.
      heightFactor: 1,
      maxHeightFactor: 1,
      // Without its own messenger a failure snackbar goes behind the scrim.
      hostsSnackBars: true,
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
                padding: EdgeInsets.symmetric(horizontal: AppScreenPadding.main, vertical: AppSpacing.sm),
                child: Align(alignment: AlignmentDirectional.centerStart, child: SubscribeEyebrow()),
              ),
              // The offer scrolls and the actions below stay put.
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
    );
  }
}
