import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  const MethodChannel control = MethodChannel(
    HlsNativeBridge.controlChannelName,
  );
  final List<String> calls = <String>[];

  setUp(() {
    HlsEngine.debugReset();
    calls.clear();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(control, (MethodCall call) async {
          final Map<Object?, Object?> args = Map<Object?, Object?>.from(
            call.arguments as Map,
          );
          switch (call.method) {
            case 'prefetchToDisk':
              final String origin = args['originUrl']! as String;
              calls.add('disk:$origin');
              if (origin.contains('broken')) {
                throw PlatformException(code: 'prefetch_failed');
              }
              return origin.contains('one') ? 3 : 5;
            case 'openAsset':
              calls.add('open:${args['originUrl']}');
              throw StateError('prefetchMasters must not call openAsset');
            case 'prefetchMaster':
              calls.add('prefetch:${args['masterUri']}');
              throw StateError('prefetchMasters must not call prefetchMaster');
          }
          throw PlatformException(code: 'unimplemented');
        });
  });

  tearDown(() {
    HlsEngine.debugReset();
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(control, null);
  });

  test('registers then prefetches unique masters in input order', () async {
    await HlsEngine.initialize();
    final Uri one = Uri.parse('https://cdn.example/one/master.m3u8');
    final Uri two = Uri.parse('https://cdn.example/two/master.m3u8');

    final HlsPrefetchBatchResult result = await HlsEngine.prefetchMasters(<Uri>[
      one,
      two,
      one,
    ], concurrency: 1);

    expect(
      result.entries.map((HlsPrefetchEntry entry) => entry.masterUri),
      <Uri>[one, two],
    );
    expect(
      result.entries.map((HlsPrefetchEntry entry) => entry.segmentCount),
      <int>[3, 5],
    );
    expect(calls, <String>[
      'disk:$one',
      'disk:$two',
    ]);
  });

  test('returns zero for an item failure without throwing', () async {
    await HlsEngine.initialize();
    final Uri broken = Uri.parse('https://cdn.example/broken/master.m3u8');

    final HlsPrefetchBatchResult result = await HlsEngine.prefetchMasters(<Uri>[
      broken,
    ]);

    expect(result.entries.single.segmentCount, 0);
    expect(calls, <String>['disk:$broken']);
  });

  test('requires initialize', () {
    expect(() => HlsEngine.prefetchMasters(<Uri>[]), throwsStateError);
  });

  test('concurrency two completes both masters', () async {
    await HlsEngine.initialize();
    final Uri one = Uri.parse('https://cdn.example/one/master.m3u8');
    final Uri two = Uri.parse('https://cdn.example/two/master.m3u8');

    final HlsPrefetchBatchResult result = await HlsEngine.prefetchMasters(
      <Uri>[one, two],
      concurrency: 2,
    );

    expect(result.entries, hasLength(2));
    expect(
      result.entries.map((HlsPrefetchEntry entry) => entry.segmentCount),
      containsAll(<int>[3, 5]),
    );
    expect(calls.where((String call) => call.startsWith('disk:')), hasLength(2));
    expect(calls.where((String call) => call.startsWith('open:')), isEmpty);
    expect(
      calls.where((String call) => call.startsWith('prefetch:')),
      isEmpty,
    );
  });
}
