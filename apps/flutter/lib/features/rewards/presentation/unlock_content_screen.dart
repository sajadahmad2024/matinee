import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:material_ui/material_ui.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/exclusive_unlock_content.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/unlock_content_state.dart';

///
/// The unlock screen for one locked item: what it is, what it costs and the
/// preview. The design draws it over Home; until Home exists it is a screen.
///
class UnlockContentScreen extends StatelessWidget {
  const UnlockContentScreen({required this.itemId, super.key});

  final String itemId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = UnlockContentCubit(getIt<RewardsRepository>(), itemId);
        unawaited(cubit.load());
        return cubit;
      },
      child: const UnlockContentView(),
    );
  }
}

@visibleForTesting
class UnlockContentView extends StatelessWidget {
  const UnlockContentView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      // No scrim of its own: on the Scaffold it composites over black and comes
      // out darker, not lighter. A transparent route once Home exists.
      body: SafeArea(
        child: ContentContainer(
          maxWidth: ContentContainer.form,
          child: BlocConsumer<UnlockContentCubit, UnlockContentState>(
            listenWhen: (previous, current) => current is UnlockContentSuccess && current.justUnlocked,
            // Unlocking drops the user into the content, which lives on Home.
            listener: (context, state) => const HomeRoute().go(context),
            builder: (context, state) => switch (state) {
              UnlockContentInitial() => const SizedBox.shrink(),
              UnlockContentLoading() => const LoadingView(),
              UnlockContentFailure(:final error) => ErrorView(
                message: error.localizedMessage(l10n),
                onRetry: () => unawaited(context.read<UnlockContentCubit>().load()),
              ),
              UnlockContentSuccess(:final item) => _Body(item: item),
            },
          ),
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.item});

  final ExclusiveItem item;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return ExclusiveUnlockContent(
      tagLabel: l10n.exclusiveTag,
      title: item.title,
      unlocksForLabel: l10n.exclusiveUnlocksFor,
      costLabel: l10n.exclusivePointsCost(item.unlockCost),
      previewLabel: l10n.exclusivePreview,
      preview: item.preview,
      castLabel: l10n.exclusiveCastAndCrew,
      cast: item.castAndCrew,
      unlockCtaLabel: l10n.exclusiveUnlockCta,
      onUnlock: () => unawaited(context.read<UnlockContentCubit>().unlock()),
      isScreenTitle: true,
    );
  }
}
