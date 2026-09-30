import 'dart:async';

import 'package:flutter/material.dart';
import 'package:hls_video_player/hls_video_player.dart';
import 'package:hls_video_player/src/lab/swipe_through_overscroll.dart';

/// What a pager lab reel carries in [HlsReelItem.data].
typedef _LabReel = ({String title, bool isLocked});

/// The blank-paper way to build a reels screen: [HlsReelPager], with the host
/// drawing and managing everything else itself.
///
/// The former v1 Reels screen, ported widget for widget with placeholder UI.
/// Brings its own [MaterialApp], like `ReelFeedLab`.
class ReelPagerLab extends StatelessWidget {
  const ReelPagerLab({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(brightness: Brightness.dark, colorSchemeSeed: Colors.amber),
      home: const _Feed(),
    );
  }
}

class _Feed extends StatefulWidget {
  const _Feed();

  @override
  State<_Feed> createState() => _FeedState();
}

class _FeedState extends State<_Feed> {
  static final List<HlsReelItem> _items = <HlsReelItem>[
    for (final (int i, Uri master) in HlsReelCatalog.fixtures().masters.indexed)
      HlsReelItem(
        id: 'reel-$i',
        masterUri: master,
        // The fourth reel is locked, as in the ReelFeed lab.
        data: (title: 'Reel ${i + 1}', isLocked: i == 3),
      ),
  ];

  // Owned here, not by HlsReelPager, so a swipe over the curtain can drive
  // it the same as a swipe on the pager itself.
  final PageController _pageController = PageController();

  // Session-only: which locked reels this viewer has unlocked.
  final Set<String> _unlockedReelIds = <String>{};

  // Reported by the focused _ReelPage, so the points pill can hide while a
  // locked reel's curtain is covering it instead of sitting on top of it.
  bool _lockedReelShowing = false;

  bool _showHud = false;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _share(_LabReel reel) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text('Share ${reel.title}: the host wires this')));
  }

  void _handleLockedReelVisibilityChanged({required bool showing}) {
    // Reported after the frame, when the lab may already be gone.
    if (mounted && _lockedReelShowing != showing) {
      setState(() => _lockedReelShowing = showing);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          HlsReelPager(
            controller: _pageController,
            items: _items,
            showHud: _showHud,
            // Seek bar comes back as slot.bottomBar so it paints above the scrim.
            controls: HlsPlayerControls(
              embedBottomBar: false,
              fullscreenBuilder: (BuildContext context, HlsControlsState state) {
                return const Padding(padding: EdgeInsets.all(8), child: Icon(Icons.screen_rotation_rounded, size: 20));
              },
            ),
            itemBuilder: (BuildContext context, HlsReelSlot slot) {
              final _LabReel reel = slot.item.data! as _LabReel;
              final String id = slot.item.id;
              return _ReelPage(
                reel: reel,
                video: slot.video,
                bottomBar: slot.bottomBar,
                isFocused: slot.isFocused,
                isUnlocked: _unlockedReelIds.contains(id),
                pageController: _pageController,
                onUnlocked: () => setState(() => _unlockedReelIds.add(id)),
                onOverlayVisibleChanged: _handleLockedReelVisibilityChanged,
                onShare: () => _share(reel),
              );
            },
          ),
          const IgnorePointer(
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Text('Pager Lab (v1)', style: TextStyle(color: Colors.white, fontSize: 20)),
              ),
            ),
          ),
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 104,
            child: IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: <Color>[Color(0x99000000), Colors.transparent],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            top: 0,
            right: 0,
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.only(right: 16),
                child: Row(
                  children: <Widget>[
                    IconButton(
                      tooltip: _showHud ? 'Hide HUD' : 'Show HUD',
                      icon: Icon(_showHud ? Icons.analytics : Icons.analytics_outlined),
                      onPressed: () => setState(() => _showHud = !_showHud),
                    ),
                    if (!_lockedReelShowing) const Chip(label: Text('1,250 PTS')),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReelPage extends StatelessWidget {
  const _ReelPage({
    required this.reel,
    required this.video,
    required this.bottomBar,
    required this.isFocused,
    required this.isUnlocked,
    required this.pageController,
    required this.onUnlocked,
    required this.onOverlayVisibleChanged,
    required this.onShare,
  });

  final _LabReel reel;
  final Widget video;

  /// Player seek bar and timer, painted above the scrim and below the overlay.
  final Widget? bottomBar;

  /// Whether the pager has this reel focused, updated once a page change settles.
  final bool isFocused;

  final bool isUnlocked;
  final PageController pageController;
  final VoidCallback onUnlocked;

  /// Reports whether this page's curtain is showing, whenever this is the
  /// focused page, so the feed can hide the points pill behind it.
  final void Function({required bool showing}) onOverlayVisibleChanged;

  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    final bool showOverlay = reel.isLocked && isFocused && !isUnlocked;
    // Deferred a frame: reporting to an ancestor mid-build would call its
    // setState while the tree is still building.
    if (isFocused) {
      WidgetsBinding.instance.addPostFrameCallback((_) => onOverlayVisibleChanged(showing: showOverlay));
    }
    return Stack(
      fit: StackFit.expand,
      children: <Widget>[
        video,
        const IgnorePointer(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[Colors.transparent, Color(0xAA000000)],
                stops: <double>[0.5, 1],
              ),
            ),
          ),
        ),
        ?bottomBar,
        Positioned(
          left: 0,
          right: 0,
          bottom: 0,
          child: SafeArea(
            top: false,
            child: Padding(
              // Leaves the player's seek bar row uncovered at the bottom.
              padding: const EdgeInsets.only(bottom: HlsPlayerControls.bottomBarHeight),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                spacing: 32,
                children: <Widget>[
                  Align(
                    alignment: Alignment.centerRight,
                    child: Padding(
                      padding: const EdgeInsets.only(right: 16),
                      child: IconButton.filledTonal(
                        tooltip: 'Share',
                        icon: const Icon(Icons.share),
                        onPressed: onShare,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Text(reel.title, style: const TextStyle(color: Colors.white, fontSize: 18)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (showOverlay)
          SwipeThroughOverscroll(
            onSwipeForward: () =>
                unawaited(pageController.nextPage(duration: Durations.medium2, curve: Curves.easeOut)),
            onSwipeBackward: () =>
                unawaited(pageController.previousPage(duration: Durations.medium2, curve: Curves.easeOut)),
            child: _Curtain(reel: reel, onUnlock: onUnlocked),
          ),
      ],
    );
  }
}

class _Curtain extends StatelessWidget {
  const _Curtain({required this.reel, required this.onUnlock});

  final _LabReel reel;
  final VoidCallback onUnlock;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: const Color(0xEE000000),
      child: SafeArea(
        child: LayoutBuilder(
          // Fills the viewport and scrolls only once the copy does not fit, as the app's unlock curtain does.
          builder: (BuildContext context, BoxConstraints constraints) => SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                spacing: 12,
                children: <Widget>[
                  const Icon(Icons.lock, size: 56, color: Colors.amber),
                  Text(
                    '${reel.title} is locked',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.white, fontSize: 20),
                  ),
                  const Text(
                    'Its player is still open under this curtain: the pager knows nothing about locks.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white70),
                  ),
                  FilledButton(onPressed: onUnlock, child: const Text('Unlock')),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
