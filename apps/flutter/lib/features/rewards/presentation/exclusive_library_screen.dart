import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:matinee/app/router/app_routes.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/responsive/responsive.dart';
import 'package:matinee/core/theme/app_spacing.dart';
import 'package:matinee/core/widgets/back_disc_button.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/rewards/data/models/exclusive_content.dart';
import 'package:matinee/features/rewards/data/rewards_repository.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_cubit.dart';
import 'package:matinee/features/rewards/presentation/cubit/exclusive_library_state.dart';
import 'package:matinee/features/rewards/presentation/widgets/content_filter_chips.dart';
import 'package:matinee/features/rewards/presentation/widgets/exclusive_tile.dart';

class ExclusiveLibraryScreen extends StatelessWidget {
  const ExclusiveLibraryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = ExclusiveLibraryCubit(getIt<RewardsRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const ExclusiveLibraryView(),
    );
  }
}

@visibleForTesting
class ExclusiveLibraryView extends StatelessWidget {
  const ExclusiveLibraryView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      appBar: AppBar(
        leading: Padding(
          // The screen margin exactly: the button pulls its own overhang back,
          // so the disc lands on the margin the frame draws it against.
          padding: const EdgeInsets.only(left: AppScreenPadding.main),
          // Left, not centred: the slot is wider than the target, and the
          // frame sets the disc against the margin rather than in the middle.
          child: Align(
            alignment: Alignment.centerLeft,
            child: BackDiscButton(
              tooltip: MaterialLocalizations.of(context).backButtonTooltip,
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
        ),
        leadingWidth: AppScreenPadding.main + BackDiscButton.leadingWidth,
        // The frame leaves 12 between the disc and the title, which the slot
        // already ends on; the default 16 would stack on top of it.
        titleSpacing: 0,
        title: ScreenTitle(
          label: l10n.exclusiveTitle,
          child: Text(l10n.exclusiveTitle),
        ),
      ),
      body: ContentContainer(
        maxWidth: ContentContainer.reading,
        child: BlocBuilder<ExclusiveLibraryCubit, ExclusiveLibraryState>(
          builder: (context, state) => switch (state) {
            ExclusiveLibraryInitial() => const SizedBox.shrink(),
            ExclusiveLibraryLoading() => const LoadingView(),
            ExclusiveLibraryFailure(:final error) => ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<ExclusiveLibraryCubit>().load()),
            ),
            ExclusiveLibrarySuccess(:final library) => _Body(library: library),
          },
        ),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  const _Body({required this.library});

  /// The design's grid: three columns with a 4 gutter, inset 4 from the edges.
  static const int _columns = 3;
  static const double _gutter = AppSpacing.xs;

  final ExclusiveLibrary library;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            // The frame's header runs 13 deeper than the app bar and a chip
            // lays out 48 for its 32, so both gaps are set short of the frame.
            padding: const EdgeInsets.only(top: AppSpacing.xs, bottom: AppSpacing.sm),
            child: ContentFilterChips(
              filters: library.filters,
              selected: library.selectedFilter,
              onSelected: (filter) => unawaited(context.read<ExclusiveLibraryCubit>().selectFilter(filter)),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: _gutter),
          sliver: SliverGrid.builder(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: _columns,
              crossAxisSpacing: _gutter,
              mainAxisSpacing: _gutter,
              childAspectRatio: ExclusiveTile.aspectRatio,
            ),
            itemCount: library.items.length,
            itemBuilder: (context, index) {
              final item = library.items[index];
              return ExclusiveTile(
                title: item.title,
                imageAsset: item.imageAsset,
                isUnlocked: item.isUnlocked,
                lockedLabel: l10n.exclusiveLocked,
                // An open item has nowhere to go yet: the player it would
                // start does not exist, so the tile is not a control.
                onTap: item.isUnlocked
                    ? null
                    : () => unawaited(UnlockContentRoute(itemId: item.id).push<void>(context)),
              );
            },
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(height: context.bottomInset(AppSpacing.xxxl)),
        ),
      ],
    );
  }
}
