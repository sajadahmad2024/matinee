import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  final Uri origin = Uri.parse('https://cdn.example.com/reel42/master.m3u8');

  group('HlsContentDescriptor', () {
    test('fixture catalog maps to liveSegmentCache and drm none', () {
      final HlsReelCatalog catalog = HlsReelCatalog.fixtures();
      expect(catalog.liveSegmentDescriptors, hasLength(catalog.masters.length));
      for (final HlsContentDescriptor descriptor
          in catalog.liveSegmentDescriptors) {
        expect(descriptor.drm, HlsDrmKind.none);
        expect(descriptor.cachePolicy, HlsCachePolicy.liveSegmentCache);
        expect(descriptor.prefetchEnabled, isTrue);
        expect(descriptor.substitutionEnabled, isTrue);
        expect(descriptor.assetId, descriptor.originUrl);
      }
    });

    test('toChannelMap / fromChannelMap round-trip including drm and auth', () {
      final HlsContentDescriptor original = HlsContentDescriptor(
        assetId: Uri.parse('https://cdn.example.com/reel42/master.m3u8'),
        originUrl: Uri.parse(
          'https://cdn.example.com/reel42/master.m3u8?sig=1',
        ),
        drm: HlsDrmKind.fairplay,
        drmConfig: HlsDrmConfig(
          certificateUrl: Uri.parse('https://license.example/cert'),
          licenseServerUrl: Uri.parse('https://license.example/fps'),
          contentId: 'reel42',
        ),
        authMode: HlsAuthMode.tokenHeader,
        authConfig: HlsAuthConfig(
          headerName: 'Authorization',
          headerValue: 'Bearer abc',
          tokenRefreshId: 'session-1',
        ),
        cachePolicy: HlsCachePolicy.fullDownload,
        prefetchEnabled: false,
        substitutionEnabled: false,
        maxPrefetchSegments: 4,
        maxPrefetchHeight: 360,
      );

      final HlsContentDescriptor restored = HlsContentDescriptor.fromChannelMap(
        original.toChannelMap(),
      );

      expect(restored.assetId, original.assetId);
      expect(restored.originUrl, original.originUrl);
      expect(restored.drm, HlsDrmKind.fairplay);
      expect(
        restored.drmConfig?.certificateUrl,
        original.drmConfig?.certificateUrl,
      );
      expect(
        restored.drmConfig?.licenseServerUrl,
        original.drmConfig?.licenseServerUrl,
      );
      expect(restored.drmConfig?.contentId, 'reel42');
      expect(restored.authMode, HlsAuthMode.tokenHeader);
      expect(restored.authConfig?.headerName, 'Authorization');
      expect(restored.authConfig?.headerValue, 'Bearer abc');
      expect(restored.authConfig?.tokenRefreshId, 'session-1');
      expect(restored.cachePolicy, HlsCachePolicy.fullDownload);
      expect(restored.prefetchEnabled, isFalse);
      expect(restored.substitutionEnabled, isFalse);
      expect(restored.maxPrefetchSegments, 4);
      expect(restored.maxPrefetchHeight, 360);
    });

    test('fromChannelMap throws when originUrl is missing', () {
      expect(
        () => HlsContentDescriptor.fromChannelMap(<Object?, Object?>{
          'assetId': origin.toString(),
        }),
        throwsFormatException,
      );
    });
  });

  group('HlsFetchEvent channel codec', () {
    test('toChannelMap / fromChannelMap round-trip', () {
      final HlsFetchEvent original = HlsFetchEvent(
        kind: HlsResourceKind.segment,
        originUri: Uri.parse('https://cdn.example.com/reel42/seg-1.ts'),
        byteLength: 4096,
        occurredAt: DateTime.utc(2026, 9, 16, 12),
        variant: HlsVariant(
          playlistUri: Uri.parse('https://cdn.example.com/reel42/low.m3u8'),
          bandwidth: 800000,
          width: 640,
          height: 360,
          codecs: 'avc1.4d401e',
        ),
        segmentDuration: const Duration(milliseconds: 4000),
        segmentStart: const Duration(milliseconds: 8000),
        statusCode: 200,
        servedFromCache: true,
        cacheSkipReason: 'substituted',
      );

      final HlsFetchEvent restored = HlsFetchEvent.fromChannelMap(
        original.toChannelMap(),
      );

      expect(restored.kind, HlsResourceKind.segment);
      expect(restored.originUri, original.originUri);
      expect(restored.byteLength, 4096);
      expect(restored.occurredAt, original.occurredAt);
      expect(restored.variant?.playlistUri, original.variant?.playlistUri);
      expect(restored.variant?.bandwidth, 800000);
      expect(restored.variant?.height, 360);
      expect(restored.segmentDuration, const Duration(milliseconds: 4000));
      expect(restored.segmentStart, const Duration(milliseconds: 8000));
      expect(restored.statusCode, 200);
      expect(restored.servedFromCache, isTrue);
      expect(restored.cacheSkipReason, 'substituted');
    });
  });

  group('HlsNativeBridge', () {
    late MethodChannel control;

    setUp(() {
      control = const MethodChannel(HlsNativeBridge.controlChannelName);
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(control, (MethodCall call) async {
            switch (call.method) {
              case 'openAsset':
                final Map<Object?, Object?> args = Map<Object?, Object?>.from(
                  call.arguments as Map,
                );
                return <String, Object>{
                  'playerUri': args['originUrl'] as String,
                  'strategy': 'direct',
                };
              case 'prefetchMaster':
                return 0;
              case 'prefetchToDisk':
                return 0;
              case 'refreshReachability':
                final Map<Object?, Object?> args = Map<Object?, Object?>.from(
                  call.arguments as Map,
                );
                final List<Object?> masters =
                    args['masters'] as List<Object?>? ?? <Object?>[];
                if (masters.isEmpty) {
                  return <String>[];
                }
                return masters.map((Object? raw) => raw.toString()).toList();
              case 'clearCache':
                return null;
              case 'cacheStats':
                return <String, Object>{
                  'backendName': 'none',
                  'entryCount': 0,
                  'storedBytes': 0,
                };
              case 'isCacheOnlyFor':
                return false;
              default:
                throw PlatformException(code: 'unimplemented');
            }
          });
    });

    tearDown(() {
      TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
          .setMockMethodCallHandler(control, null);
    });

    test('openAsset echoes origin as a direct playerUri', () async {
      final HlsNativeBridge bridge = HlsNativeBridge();
      final HlsOpenAssetResult result = await bridge.openAsset(
        HlsContentDescriptor.liveSegmentFixture(originUrl: origin),
      );
      expect(result.playerUri, origin);
      expect(result.strategy, HlsDeliveryStrategy.direct);
    });

    test('stub methods return empty cache and online', () async {
      final HlsNativeBridge bridge = HlsNativeBridge();
      expect(await bridge.prefetchMaster(origin), 0);
      expect(
        await bridge.prefetchToDisk(
          HlsContentDescriptor.liveSegmentFixture(originUrl: origin),
        ),
        0,
      );
      expect(await bridge.refreshReachability(masters: <Uri>[]), isEmpty);
      expect(await bridge.refreshReachability(masters: <Uri>[origin]), <Uri>[
        origin,
      ]);
      await bridge.clearCache();
      final HlsCacheStats stats = await bridge.cacheStats();
      expect(stats.backendName, 'none');
      expect(stats.entryCount, 0);
      expect(await bridge.isCacheOnlyFor(origin), isFalse);
    });
  });
}
