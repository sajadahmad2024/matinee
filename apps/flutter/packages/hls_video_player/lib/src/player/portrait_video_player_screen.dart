import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:hls_video_player/src/bridge/hls_native_bridge.dart';
import 'package:hls_video_player/src/player/hls_connectivity.dart';
import 'package:hls_video_player/src/player/hls_player_port.dart';
import 'package:hls_video_player/src/player/hls_reel_catalog.dart';
import 'package:hls_video_player/src/player/hls_reel_item.dart';
import 'package:hls_video_player/src/player/hls_reel_pager.dart';
import 'package:hls_video_player/src/player/hls_reel_slot.dart';
import 'package:hls_video_player/src/player/portrait_player_item.dart';

/// Lab host for the reusable native-backed [HlsReelPager].
///
/// Owns Scaffold, fixture catalog, and the HUD toggle. Playback, events, and
/// HUD fold live in [HlsReelPager] / [HlsVideoPlayer].
class PortraitVideoPlayerScreen extends StatefulWidget {
  const PortraitVideoPlayerScreen({
    this.nativeBridge,
    this.catalog,
    this.playerFactory,
    super.key,
  });

  /// Optional compatibility overrides used by the old demo wiring.
  final HlsNativeBridge? nativeBridge;
  final HlsReelCatalog? catalog;
  final HlsPlayerPortFactory? playerFactory;

  @override
  State<PortraitVideoPlayerScreen> createState() =>
      _PortraitVideoPlayerScreenState();
}

class _PortraitVideoPlayerScreenState extends State<PortraitVideoPlayerScreen> {
  static const int _windowRadius = 2;

  final _connectivity = _ConnectivityAdapter(Connectivity());
  bool _hudOn = false;
  late final List<HlsReelItem> _items;

  HlsReelCatalog get _catalog => widget.catalog ?? HlsReelCatalog.fixtures();

  @override
  void initState() {
    super.initState();
    _items = <HlsReelItem>[
      for (var index = 0; index < _catalog.masters.length; index++)
        HlsReelItem(
          id: '$index',
          masterUri: _catalog.masters[index],
          descriptor: _catalog.descriptorFor(_catalog.masters[index]),
        ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reels pager'),
        actions: <Widget>[
          IconButton(
            tooltip: _hudOn ? 'Hide HUD' : 'Show HUD',
            onPressed: () => setState(() => _hudOn = !_hudOn),
            icon: Icon(_hudOn ? Icons.analytics : Icons.analytics_outlined),
          ),
        ],
      ),
      body: HlsReelPager(
        items: _items,
        windowRadius: _windowRadius,
        showHud: _hudOn,
        connectivity: _connectivity,
        itemBuilder: (BuildContext context, HlsReelSlot slot) {
          return PortraitPlayerItem(
            reelIndex: slot.index,
            isFocused: slot.isFocused,
            port: slot.port,
            hudOn: _hudOn,
            child: slot.video,
          );
        },
      ),
    );
  }
}

class _ConnectivityAdapter implements HlsConnectivity {
  const _ConnectivityAdapter(this._connectivity);

  final Connectivity _connectivity;

  @override
  Future<bool> get isConnected async =>
      _online(await _connectivity.checkConnectivity());

  @override
  Stream<bool> get onConnectivityChanged =>
      _connectivity.onConnectivityChanged.map(_online).distinct();

  static bool _online(List<ConnectivityResult> results) {
    return results.any(
      (ConnectivityResult result) =>
          result == ConnectivityResult.mobile ||
          result == ConnectivityResult.wifi ||
          result == ConnectivityResult.ethernet,
    );
  }
}
