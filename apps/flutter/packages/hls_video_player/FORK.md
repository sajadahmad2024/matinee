# Fork of video_player_avfoundation 2.11.1

Upstream: `video_player_avfoundation` **2.11.1**.

pub.dev is already **2.12.0** (AirPlay video routing). Do not take that bump
here unless product needs AirPlay video on the receiver.

## Additive HLS (do not overlay)

`darwin/hls_video_player/Sources/hls_video_player/hls/`

## Hook file

`darwin/hls_video_player/Sources/hls_video_player/VideoPlayerPlugin.swift`

- `HlsEngineChannels.register` / `unregister`
- FairPlay session retain
- `playerItem(with:)` file-URL + FairPlay branch

Inventory, when to rebase, and the overlay checklist:
`apps/documentation/docs/flutter/video-player-fork.md`
