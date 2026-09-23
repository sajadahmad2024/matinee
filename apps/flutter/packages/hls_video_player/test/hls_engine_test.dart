import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  tearDown(HlsEngine.debugReset);

  test('instance throws before initialization', () {
    expect(() => HlsEngine.instance, throwsStateError);
  });

  test('initialize returns the same process instance', () async {
    final HlsEngine first = await HlsEngine.initialize(
      allowedOriginHosts: const <String>{'cdn.example.com'},
    );
    final HlsEngine second = await HlsEngine.initialize();

    expect(identical(first, second), isTrue);
    expect(first.allowedOriginHosts, contains('cdn.example.com'));
  });

  test('debugReset permits initialization again', () async {
    final HlsEngine first = await HlsEngine.initialize();
    HlsEngine.debugReset();
    final HlsEngine second = await HlsEngine.initialize();

    expect(identical(first, second), isFalse);
  });
}
