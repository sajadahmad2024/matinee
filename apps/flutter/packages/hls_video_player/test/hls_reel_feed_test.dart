import 'package:flutter_test/flutter_test.dart';
import 'package:hls_video_player/hls_video_player.dart';

void main() {
  final Uri one = Uri.parse('https://cdn.example/1/master.m3u8');
  final Uri two = Uri.parse('https://cdn.example/2/master.m3u8');

  test('sameHlsReelFeed is true for equal ids and uris in a new list', () {
    final List<HlsReelItem> first = <HlsReelItem>[
      HlsReelItem(id: '0', masterUri: one),
      HlsReelItem(id: '1', masterUri: two),
    ];
    final List<HlsReelItem> second = <HlsReelItem>[
      HlsReelItem(id: '0', masterUri: one),
      HlsReelItem(id: '1', masterUri: two),
    ];

    expect(identical(first, second), isFalse);
    expect(sameHlsReelFeed(first, second), isTrue);
  });

  test('sameHlsReelFeed is false when a master uri changes', () {
    expect(
      sameHlsReelFeed(<HlsReelItem>[
        HlsReelItem(id: '0', masterUri: one),
      ], <HlsReelItem>[HlsReelItem(id: '0', masterUri: two)]),
      isFalse,
    );
  });
}
