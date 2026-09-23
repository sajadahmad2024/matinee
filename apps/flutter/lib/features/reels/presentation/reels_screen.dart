import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:matinee/core/l10n/app_exception_l10n.dart';
import 'package:matinee/core/l10n/l10n.dart';
import 'package:matinee/core/widgets/error_view.dart';
import 'package:matinee/core/widgets/loading_view.dart';
import 'package:matinee/core/widgets/screen_title.dart';
import 'package:matinee/di/service_locator.dart';
import 'package:matinee/features/reels/data/models/reel.dart';
import 'package:matinee/features/reels/data/reels_repository.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_cubit.dart';
import 'package:matinee/features/reels/presentation/cubit/reels_state.dart';
import 'package:matinee/features/reels/presentation/reel_to_hls_item.dart';

class ReelsScreen extends StatelessWidget {
  const ReelsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) {
        final cubit = ReelsCubit(getIt<ReelsRepository>());
        unawaited(cubit.load());
        return cubit;
      },
      child: const ReelsView(),
    );
  }
}

@visibleForTesting
class ReelsView extends StatelessWidget {
  const ReelsView({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    return Scaffold(
      body: BlocBuilder<ReelsCubit, ReelsState>(
        builder: (context, state) => switch (state) {
          ReelsInitial() => const SizedBox.shrink(),
          ReelsLoading() => const SafeArea(child: LoadingView()),
          ReelsFailure(:final error) => SafeArea(
            child: ErrorView(
              message: error.localizedMessage(l10n),
              onRetry: () => unawaited(context.read<ReelsCubit>().load()),
            ),
          ),
          ReelsSuccess(:final reels) => _Feed(reels: reels),
        },
      ),
    );
  }
}

class _Feed extends StatelessWidget {
  const _Feed({required this.reels});

  final List<Reel> reels;

  @override
  Widget build(BuildContext context) {
    final items = [for (final reel in reels.where(isPlayableReel)) toHlsReelItem(reel)];
    return Stack(
      fit: StackFit.expand,
      children: [
        HlsReelPager(
          items: items,
          itemBuilder: (context, slot) => slot.video,
        ),
        IgnorePointer(
          child: ScreenTitle(label: context.l10n.navHome, child: const SizedBox.shrink()),
        ),
      ],
    );
  }
}
