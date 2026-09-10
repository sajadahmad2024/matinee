# Matinee consumer app — Component catalogue (final tokens)

> Source: Figma `vVGHTFgrIRYQBTZaRZCYe0`, page **Visuals** (`3:1066`, 71 frames) only. Dark-only app. Units: Flutter logical px. Colour syntax: `{primitive}` or `{primitive@NN%}` (opacity applied to a primitive — there are no extra hexes); `gradient.<name>`. Machine-readable twin: `design-system.json`. Extracted values were simplified on 2026-09-03 per the decisions log at the end.

82 components (70 reusable). Colours and type are expressed in final tokens/roles from `design-system.md`; **evidence** strings keep the raw Figma values so anything can be traced back to a node.

## Index
| id | Name | Category | Reusable | Screens | Instances |
|---|---|---|---|---|---|
| `btn.primary` | Button / Primary (gold CTA) | primitive | yes | 21 | 24 |
| `btn.secondary` | Button / Secondary (neutral outline) | primitive | yes | 2 | 4 |
| `btn.tonal` | Button / Tonal (dark with gold hairline) | primitive | yes | 2 | 4 |
| `btn.outline` | Button / Outline gold | primitive | yes | 2 | 5 |
| `btn.social` | Button / Social sign-in | primitive | yes | 2 | 4 |
| `btn.text` | Button / Text | primitive | yes | 17 | 20 |
| `btn.icon.back` | IconButton / Back (disc) | primitive | yes | 35 | 41 |
| `btn.icon.close` | IconButton / Close | primitive | yes | 3 | 3 |
| `btn.icon.settings` | IconButton / Settings (profile header) | primitive | yes | 8 | 8 |
| `btn.icon.actionRail` | ActionRail Button (like/comment/info/share) | composite | yes | 21 | 96 |
| `input.text` | Input / Text (auth) | primitive | yes | 4 | 8 |
| `input.otp` | Input / OTP box | primitive | yes | 2 | 8 |
| `chip.filter` | Chip / Filter | primitive | yes | 2 | 8 |
| `tag.genre` | Tag / Genre (meta) | primitive | yes | 21 | 42 |
| `tag.category` | Tag / Category over image | primitive | yes | 7 | 21 |
| `tag.eyebrow` | Tag / Eyebrow with dot (onboarding) | primitive | yes | 3 | 3 |
| `tag.exclusive` | Tag / Exclusive content (icon + label) | primitive | yes | 6 | 6 |
| `badge.status` | Badge / Status | primitive | yes | 10 | 36 |
| `badge.level` | Badge / Level (LV 1 / LV 2) | primitive | yes | 1 | 15 |
| `pill.points` | Pill / Points (header) | composite | yes | 22 | 27 |
| `pill.pointsOverImage` | Pill / Points reward over image | primitive | yes | 3 | 5 |
| `pill.multiplier` | Pill / Multiplier over image | primitive | yes | 1 | 3 |
| `chip.counter` | Chip / Counter (2/3, 5/5) | primitive | yes | 2 | 8 |
| `chip.badgeEarned` | Chip / Badge earned (icon + name) | primitive | yes | 4 | 8 |
| `chip.timeLeft` | Chip / Time left | primitive | yes | 3 | 3 |
| `chip.legend` | Chip / Legend (dot + label) | primitive | yes | 1 | 3 |
| `segmented` | Segmented control (earns / badges) | primitive | yes | 6 | 6 |
| `tab.pill` | Tab pill (Earned / Locked) | primitive | yes | 2 | 4 |
| `avatar` | Avatar | primitive | yes | 12 | 19 |
| `progress.linear` | Progress bar (linear) | primitive | yes | 19 | 39 |
| `progress.steps` | Progress steps (7 bars) | primitive | yes | 1 | 1 |
| `progress.ring` | Progress ring (58) | primitive | yes | 2 | 2 |
| `divider` | Divider | primitive | yes | 24 | 24 |
| `checkDisc` | Check disc | primitive | yes | 4 | 14 |
| `sheetHandle` | Sheet handle | primitive | yes | 6 | 6 |
| `icon` | Icon (vector glyph in square frame) | primitive | yes | 1 | 1214 |
| `appBar.back` | AppBar / Back header | composite | yes | 16 | 18 |
| `appBar.profile` | AppBar / Profile header (label + settings) | composite | yes | 8 | 8 |
| `appBar.overVideo` | AppBar / Over-video top bar | composite | yes | 17 | 22 |
| `bottomNav` | BottomNav (client-approved library Nav Bar colours) | composite | yes | 38 | 38 |
| `videoOverlay` | Home / Video player overlay | pattern | yes | 17 | 22 |
| `sheet.bottom` | BottomSheet (container) | composite | yes | 4 | 4 |
| `commentCard` | Comment card | composite | yes | 1 | 3 |
| `onboardingSlide` | Onboarding slide | pattern | yes | 3 | 3 |
| `authForm` | Auth form (Sign In / OTP / Create Account) | pattern | yes | 6 | 6 |
| `statCard` | Stat card (3-up) | composite | yes | 8 | 24 |
| `statRowCard` | Stat row card (P2P header: Rank / Streak / Points + badge progress) | composite | yes | 4 | 4 |
| `gameCard` | Game card (P2P / Rewards list) | composite | yes | 7 | 21 |
| `heroQuestCard` | Hero quest card (featured) | composite | yes | 2 | 2 |
| `questListCard` | Quest list card | composite | yes | 2 | 6 |
| `actionCard` | Quest action card (with curated content) | composite | yes | 2 | 8 |
| `progressSummaryCard` | Progress summary card (ring + text) | composite | yes | 2 | 2 |
| `streakLevelCard` | Streak current-level card | composite | no | 1 | 1 |
| `levelTrack` | Level track (4 steps) | composite | no | 1 | 1 |
| `miniStatCard` | Mini stat card (Streak now / Best / Active days) | composite | yes | 2 | 6 |
| `sessionCard` | Today's session card | composite | no | 1 | 1 |
| `streakCalendar` | Streak calendar | composite | no | 1 | 1 |
| `badgeTile` | Badge tile (2-col grid) | composite | yes | 3 | 15 |
| `badgeUnlockRow` | Badge-to-unlock row | composite | yes | 1 | 3 |
| `currentBadgeCard` | Current badge card (Rewards header) | composite | yes | 2 | 2 |
| `pointsHeader` | Points header (Rewards / Badges) | composite | yes | 5 | 5 |
| `earnRow` | Earn row (My Earns) | composite | yes | 4 | 16 |
| `activityRow` | Activity row (Daily streaks rewards log) | composite | yes | 1 | 15 |
| `summaryHeader` | Summary header (rewards detail screens) | composite | yes | 4 | 4 |
| `winCard` | Auction win card | composite | yes | 1 | 4 |
| `predictionHistoryCard` | Prediction history card | composite | yes | 1 | 3 |
| `questHistoryCard` | Quest history card | composite | yes | 1 | 5 |
| `predictionCard` | Prediction card (listing) | composite | yes | 1 | 3 |
| `predictionDetail` | Prediction detail screen | pattern | no | 1 | 1 |
| `profileScreen` | Profile screen | pattern | yes | 8 | 8 |
| `menuRow` | Menu row | primitive | yes | 8 | 48 |
| `editProfileForm` | Edit profile form | pattern | no | 1 | 1 |
| `referSheet` | Refer-a-friend sheet | pattern | no | 1 | 1 |
| `subscribeScreen` | Subscribe (paywall) screen | pattern | no | 1 | 1 |
| `streakIntro` | Daily Streak intro | pattern | no | 1 | 1 |
| `completionModal` | Weekly quest completion modal | pattern | yes | 1 | 1 |
| `successDrawer` | Success drawer (7-day ritual) — OFF-SYSTEM | pattern | no | 1 | 1 |
| `unlockOverlay` | Exclusive-content unlock overlay (Home) | pattern | yes | 4 | 4 |
| `exclusiveLibrary` | Exclusive content library | pattern | yes | 2 | 2 |
| `topUpSheet` | Top-up points sheet (pack picker + receipt) | pattern | yes | 2 | 2 |
| `auctionScreen` | Live auction screen — ONE-OFF concept | pattern | no | 1 | 1 |
| `splash` | Splash (placeholder only) | pattern | no | 1 | 1 |

## Specifications

### `btn.primary` — Button / Primary (gold CTA)
*primitive · reusable · 21 screen(s) · 24 instance(s)*

**Anatomy**
1. Container (auto-layout H, center/center, gap 8)
1. Label TEXT
1. optional trailing Icon 16×16 @0.7 opacity (chevron 5×8 {authSurface})

**Tokens**
- height: 52
- width: fill (333 onboarding / 325 auth+sheet / 341 quest)
- radius: 12
- fill: {goldCta} primary500
- label: {labelLarge} {authSurface} (Visuals) — {labelLarge} (GoldButton)
- shadow: DS(0,6,24,0,{gold@40%})
- padding: 0 (label centered) — GoldButton #130:574 uses 9/0/9/0

**Variants**
- **large** — h52 r12 glow — Continue/Unlock Now/Save Changes/Subscribe/Claim Reward (×13)
- **goldButton(auth)** — h54 r12 DS(0,6,24,{gold@30%}) {labelLarge} (×3: #128:95, #129:259, #130:574)
- **cardCTA** — h42 r12 no shadow {titleSmall} {surface} (Track Progress #165:1963 ×2)
- **small** — h34 r8 p8/14 fill {goldCta} {labelMedium} {surface} (Upgrade #429:23401 ×7)
- **mini** — h28 r8 p0/12 {labelMedium} {surface} (Watch #377:4008 ×2; gradient FFD700→C9A24B #382:6779 ×2)
- **gradient** — h50 r12 3-stop gold gradient, leading icon 16, {titleSmall} {surface} (Share Achievement #379:5077); h34 r8 gradient FFD966→E6CB86→C9A24B (#420:20131)
- **bid** — h39 r4 p0/15/0/18 {titleSmall} {surface} + icon (BID #418:18141) — odd radius

**States**
- **enabled** — fill {goldCta}, label {authSurface}, glow
- **disabled** — fill {gold@20%} (gold 25%), label {gold@50%} (or {gold@60%}), NO shadow — GoldButton#129:169 Get OTP, #129:146, #132:679
- **pressed/hover** — not designed
- **loading** — not designed

**Evidence:** `Button#85:1708`, `GoldButton#128:95`, `GoldButton#129:169 (disabled)`, `Button#432:24154`, `Button#379:5077`

**Notes**
- Label family disagrees: Poppins (×13) vs DM Sans (×3).
- Height disagrees: 52 (Home/onboarding) vs 54 (auth GoldButton). Recommend 52.
- Glow alpha disagrees 0x66 / 0x4D / 0x59.

**Screens:** 85:1662 (Intro Screen 1), 85:1733 (Intro Screen 2), 85:1803 (Intro Screen 3), 128:70 (Sign In (Filled)), 129:179 (Verify OTP (Filled)), 130:410 (User's name (Filled)), 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing), 432:24030 (Home (exclusive unlocked)), 92:4525 (Home (exclusive unlocked)), 432:24098 (Home (unlock overlay)), 92:4615 (Home (unlock overlay)), … +9 more

### `btn.secondary` — Button / Secondary (neutral outline)
*primitive · reusable · 2 screen(s) · 4 instance(s)*

**Anatomy**
1. Container H center
1. Label

**Tokens**
- height: 30
- radius: 8
- padding: 0/14
- fill: {surfaceRaised}
- stroke: {outline} 1
- label: {labelMedium} {textSecondary}

**Evidence:** `Button#165:1987 Start Quest`

**Notes**
- Only appears on Weekly Quest listing. Label grey {textSecondary} is a 4th secondary grey.

**Screens:** 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing)

### `btn.tonal` — Button / Tonal (dark with gold hairline)
*primitive · reusable · 2 screen(s) · 4 instance(s)*

**Anatomy**
1. Container H center gap 8
1. Label
1. optional trailing chevron 14 ({gold})

**Tokens**
- fill: {surfaceRaised}
- stroke: {gold@10%} 1
- radius: 10
- variants: h40 label {titleSmall} {gold} (Cast Your Vote); h56 label {titleMedium} {white} (YES/NO 166 wide, gap 10)

**Evidence:** `Button#406:9912`, `Button#408:10716`, `Button#408:10718`

**Notes**
- {surfaceRaised} is a warm grey inside the navy app — off-palette; consider {surfaceRaised}.

**Screens:** 406:9862 (Prediction Game listing), 408:10663 (Prediction game)

### `btn.outline` — Button / Outline gold
*primitive · reusable · 2 screen(s) · 5 instance(s)*

**Anatomy**
1. Container center
1. Label

**Tokens**
- variants: **bidIncrement** h32 r6 p7/18 stroke {gold@30%} 1, no fill, {numeralPill} {goldLight}, DS(0,2,8,{gold@10%}) (×4 #418:18146); **copyCode** h32 r8 p6/14 fill {gold@10%} stroke {gold} 1 {labelMedium} {gold} (#420:20186)

**Evidence:** `Button#418:18146`, `Button#420:20186`

**Screens:** 418:18052 (OPTION 1 - Auction), 420:20093 (Refer a friend)

### `btn.social` — Button / Social sign-in
*primitive · reusable · 2 screen(s) · 4 instance(s)*

**Anatomy**
1. Container H center gap 10
1. Icon 18×18 (Google 4-color vectors / Apple white)
1. Label

**Tokens**
- height: 50
- width: 325
- radius: 12
- fill: {authContainer}
- stroke: {authOutline} 1
- label: {bodyMedium} {white} (Google) — {bodyMedium} (Apple) — mismatch
- gap: 10

**Evidence:** `Button#97:5287`, `Button#97:5295`

**Screens:** 97:5251 (Sign In), 128:70 (Sign In (Filled))

### `btn.text` — Button / Text
*primitive · reusable · 17 screen(s) · 20 instance(s)*

**Anatomy**
1. Optional padding container
1. Label

**Tokens**
- variants: **skip** {bodyMedium} {gold}, p6/4 (Intro #85:1715); **editProfile** {bodySmall} {gold} (#429:23377); **viewMore** {labelMedium} underline {gold} (#418:18077); **reply** {caption} {textMuted} (#35:4301); **resend** {bodySmall} {white} + gold timer span (#129:145 MIX2); **backWithLabel** icon 20 + {bodySmall} {textMuted} gap 8 (#382:6638); **dismiss** {labelMedium} {textSecondary@70%} p8 (CONTINUE WATCHING #404:9840)

**Screens:** 85:1662 (Intro Screen 1), 85:1733 (Intro Screen 2), 85:1803 (Intro Screen 3), 429:23362 (Router (Profile)), 427:20440 (Profile), 429:21182 (Profile), 429:22118 (Profile), 429:22828 (Profile), 429:21072 (Profile), 433:781 (Profile), 418:18052 (OPTION 1 - Auction), 35:4491 (Video details), … +5 more

### `btn.icon.back` — IconButton / Back (disc)
*primitive · reusable · 35 screen(s) · 41 instance(s)*

**Anatomy**
1. Outer 36×36 hug wrapper (Button)
1. Disc 36×36 (Button)
1. Icon frame 18×18
1. Vector chevron 6×9 at (6,5)

**Tokens**
- size: 36
- radius: 10
- fill: {authContainer} (warm.800)
- stroke: {authOutline} 1
- icon: {gold} 6×9 in 18 frame

**Variants**
- **disc(default)** — ×25 #219:961 + copies; used as trailing chevron on P2P/Rewards game cards too (#376:3444 ×9)
- **auction** — fill {authContainer} (#418:18055)
- **plain24** — 24×24 no disc, chevron 7×12 {gold} (Daily Streaks header #397:9103)
- **calendarNav** — 24×24 p4 icon 16 chevron 5×8 {textMuted} (#397:9220/9223)

**Evidence:** `Button#219:960`, `Button#376:3444`, `Button#397:9103`

**Notes**
- Warm-palette disc ({authContainer}/{authOutline}) is used on navy screens — the one deliberate cross-palette element; keep as 'iconButton.surface'.

**Screens:** 85:1662 (Intro Screen 1), 85:1733 (Intro Screen 2), 85:1803 (Intro Screen 3), 97:5251 (Sign In), 128:70 (Sign In (Filled)), 129:125 (Verify OTP), 129:179 (Verify OTP (Filled)), 132:651 (User's name), 130:410 (User's name (Filled)), 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing), 377:3922 (Weekly quest track progress), … +23 more

### `btn.icon.close` — IconButton / Close
*primitive · reusable · 3 screen(s) · 3 instance(s)*

**Anatomy**
1. Frame 20×20
1. Icon 20 with 12×12 X vector

**Tokens**
- size: 20
- icon: {textSecondary} 12×12

**Evidence:** `Button#35:4644`, `Button#35:4280`, `Button#420:20177`

**Screens:** 35:4491 (Video details), 30:3890 (Video comments), 420:20093 (Refer a friend)

### `btn.icon.settings` — IconButton / Settings (profile header)
*primitive · reusable · 8 screen(s) · 8 instance(s)*

**Anatomy**
1. Frame 24×24
1. Vector 16×20

**Tokens**
- size: 24
- icon: {textSecondary}

**Evidence:** `Button#429:23368`

**Screens:** 429:23362 (Router (Profile)), 427:20440 (Profile), 429:21182 (Profile), 429:22118 (Profile), 429:22828 (Profile), 429:21072 (Profile), 433:781 (Profile), 420:20093 (Refer a friend)

### `btn.icon.actionRail` — ActionRail Button (like/comment/info/share)
*composite · reusable · 21 screen(s) · 96 instance(s)*

**Anatomy**
1. ActionBtn V center gap 3
1. Icon frame 24×24 (glyph 18–20 {white})
1. Text wrapper
1. Label {numeralAction} {textSecondary} centered

**Tokens**
- iconFrame: 24
- gap: 3
- label: {numeralAction} {textSecondary}
- railGap: 20
- railPosition: x=328 (right, 16 from edge + 29 wide), y=385

**States**
- **liked** — heart vector gradient {goldCta}→{goldDeep} (Vector#26:3123)

**Evidence:** `ActionBtn#25:2972`, `Container#25:2971 rail`

**Screens:** 25:2950 (Home), 26:3104 (Home (Liked Video)), 28:3202 (Home), 29:3649 (Home), 30:3803 (Home), 376:2650 (Home), 384:6948 (Home), 407:10391 (Home), 388:8310 (Home), 381:5991 (Home), 378:4399 (Home), 92:4859 (Home), … +9 more

### `input.text` — Input / Text (auth)
*primitive · reusable · 4 screen(s) · 8 instance(s)*

**Anatomy**
1. Label (optional) — Label wrapper with 8 bottom margin
1. Field container (auto-layout V, center)
1. Value/placeholder TEXT

**Tokens**
- height: 52
- radius: 10
- padding: 0/16
- fill: {authContainer}
- stroke: {authOutline} 1
- label: {overline} {authTextSecondary} (NAME) / {overline} {authTextSecondary} (Phone Number)
- labelGap: 8
- placeholder: {bodyLarge} AUTO {white@50%}
- value: {bodyLarge} {white}
- fieldGap: 18

**Variants**
- **phone** — country box 76×52 (+91 {numeralPill} {white} + chevron 12 {authTextSecondary}, p0/16 gap 4) + input 241×52 gap 8; placeholder {numeralPill} {white@40%} (#97:5271)
- **app(EditProfile)** — fill {surfaceRaised}, stroke transparent, label {labelMedium} {textSecondary} gap 8, value {bodyLarge} {white}, width 333 (#418:18864)
- **comment** — bar 63 tall P12/16 top hairline {outline}@0.55; field 40 tall r7 fill {surface} p8/16 gap 10; placeholder {bodySmall} {white@30%}; send icon 18 {textSecondary} (#35:4338)
- **bid** — 40 tall r8 fill {surfaceRaised} stroke {white@10%} p0/20; {numeralSm} {white} (#418:18133)

**States**
- **default** — stroke {authOutline}
- **focused/filled** — stroke {gold@20%} 1 + DS(0,0,16,0,{gold@20%}), value {white} (#130:430)
- **error** — not designed
- **disabled** — not designed

**Evidence:** `Text Input#132:671`, `Text Input#130:430`, `Phone Input#97:5277`, `Text Input#418:18864`, `Container#35:4339`

**Screens:** 132:651 (User's name), 130:410 (User's name (Filled)), 97:5251 (Sign In), 128:70 (Sign In (Filled))

### `input.otp` — Input / OTP box
*primitive · reusable · 2 screen(s) · 8 instance(s)*

**Anatomy**
1. Box 64×64 (auto-layout V center)
1. Digit TEXT

**Tokens**
- size: 64
- radius: 14
- fill: {authContainer}
- stroke: {authOutline} 1.5
- gap: 12
- digit: {numeralLg} {goldLight}

**States**
- **empty** — stroke {authOutline}
- **filled** — stroke {gold@20%} 1.5 + DS(0,0,16,0,{gold@20%})

**Evidence:** `Text Input#129:140`, `Text Input#129:196`

**Screens:** 129:125 (Verify OTP), 129:179 (Verify OTP (Filled))

### `chip.filter` — Chip / Filter
*primitive · reusable · 2 screen(s) · 8 instance(s)*

**Anatomy**
1. Container H center p0/16
1. Label {labelMedium}

**Tokens**
- height: 32
- radius: 16
- gap: 8

**States**
- **active** — fill {gold} label {surface}
- **inactive** — fill {surfaceRaised} label {textSecondary}

**Evidence:** `Button#429:23703`, `Button#429:23705`

**Screens:** 429:23676 (Exclusive content), 432:23967 (Exclusive content)

### `tag.genre` — Tag / Genre (meta)
*primitive · reusable · 21 screen(s) · 42 instance(s)*

**Anatomy**
1. Text frame 70–76×21 (NOT auto-layout; label absolutely placed at 10,3)
1. Label

**Tokens**
- height: 21
- radius: 12
- fill: {surfaceRaised}
- stroke: {outline} 1
- padding: ~10/3 (absolute)
- label: {labelSmall} {textSecondary}

**Evidence:** `Text#118:8`, `Text#118:10`

**Screens:** 25:2950 (Home), 26:3104 (Home (Liked Video)), 28:3202 (Home), 29:3649 (Home), 30:3803 (Home), 376:2650 (Home), 384:6948 (Home), 407:10391 (Home), 388:8310 (Home), 381:5991 (Home), 378:4399 (Home), 92:4859 (Home), … +9 more

### `tag.category` — Tag / Category over image
*primitive · reusable · 7 screen(s) · 21 instance(s)*

**Anatomy**
1. Container H p3/10
1. Text wrapper
1. Label

**Tokens**
- height: 22
- radius: 20
- padding: 3/10
- fill: {gold@20%}
- stroke: {gold@40%} 1
- label: {labelSmall} {goldLight} (QUEST/STREAK/PREDICT/AUCTION/BTS & TRAILERS)

**Evidence:** `Container#376:3344`, `Container#429:20764`

**Screens:** 376:3272 (P2P), 384:7013 (P2P), 407:10456 (P2P), 378:4464 (P2P), 429:20692 (Rewards), 429:23472 (Rewards), 432:23866 (Rewards)

### `tag.eyebrow` — Tag / Eyebrow with dot (onboarding)
*primitive · reusable · 3 screen(s) · 3 instance(s)*

**Anatomy**
1. Container H center gap 6 p4/12
1. Dot 5×5 r2.5 {gold}
1. Label

**Tokens**
- height: 25
- radius: 20
- fill: {gold@10%}
- stroke: {gold@30%} 1
- label: {labelSmall} {gold}

**Evidence:** `Container#85:1674`

**Screens:** 85:1662 (Intro Screen 1), 85:1733 (Intro Screen 2), 85:1803 (Intro Screen 3)

### `tag.exclusive` — Tag / Exclusive content (icon + label)
*primitive · reusable · 6 screen(s) · 6 instance(s)*

**Anatomy**
1. Container H center gap 6 p5/12
1. Icon 10 (7×9 {gold})
1. Label

**Tokens**
- height: 31–32
- radius: 20
- fill: {gold@20%}
- stroke: {gold@50%} 1
- label: {labelSmall} {gold}

**Evidence:** `Container#432:24038`, `Container#432:24119`

**Screens:** 432:24030 (Home (exclusive unlocked)), 92:4525 (Home (exclusive unlocked)), 432:24098 (Home (unlock overlay)), 92:4615 (Home (unlock overlay)), 432:24224 (Home (unlock confirm)), 92:4740 (Home (unlock confirm))

### `badge.status` — Badge / Status
*primitive · reusable · 10 screen(s) · 36 instance(s)*

**Anatomy**
1. Container H center gap 4–5 p3/10 (or 1/7, 2/8)
1. optional Icon 9–11
1. Label 8–10 Bold

**Tokens**
- height: 16–29
- radius: 20
- label: {labelSmall} (WON/CORRECT/CLAIMED/INCORRECT/PARTIAL) — {labelSmall} (✓ DONE/REWARD CLAIMED/2 ACTIVE, h16 r10 no stroke) — {labelSmall} (LIVE/ACTIVE/RESULT IN)

**Variants**
- **success** — fill {success@10%} (or {success@10%}) stroke {success@30%} (or {success@20%}) label {success} — WON/CLAIMED use {success} text with {success@10%}/{success@20%}
- **successPlain** — fill {success@10%} no stroke h16 r10 — ✓ DONE, REWARD CLAIMED, 2 ACTIVE
- **gold** — fill {gold@10%} stroke {gold@20%} label {gold} — PARTIAL, High Roller
- **error** — fill {error@10%} stroke {error@20%} label {error} — INCORRECT
- **neutral** — fill {white@10%} stroke {white@10%} label {white@60%} {labelSmall} — MEMORABILIA/EXPERIENCE/TICKET/CONTENT (h20 p2/8)
- **live** — fill {error} solid, white dot 6, label white {labelSmall} (h21)
- **active** — fill {pointsPillBg@80%} r12 h16 label {caption} white (hero quest card)
- **resultIn** — fill {surface@70%} stroke {success@40%} label {success} (over image)
- **claimedLarge** — h29 p6/12 fill {success@20%} stroke {success@40%} icon 11 label {labelSmall} {success} (#379:4990)

**Evidence:** `Container#429:21850 WON`, `Container#429:23260 CLAIMED`, `Container#429:22620 INCORRECT`, `Text#376:3916 REWARD CLAIMED`, `Container#418:18067 LIVE`, `Background+Border#165:1966 ACTIVE`

**Notes**
- 4 different success greens/tints for the same 'done' meaning ({success} vs {success}; 0x1F vs 0x14 fills).

**Implementation**
- One `StatusBadge` with four tones covers this and `chip.badgeEarned`, which the frames draw with the same tokens. The gold tone maps to `tag.goldSubtle` — the existing role for a gold@10% fill with a gold label — so its border takes the alpha scale's 30% rather than the frame's 20%.
- The naming pill (`neutral`) keeps the tighter 2/8 padding the frame gives it; the tinted tones take 4/12.
- Every label-on-tint pair is asserted in `test/core/theme/contrast_test.dart` with the tint composited over the card. The tightest is the error pill at 4.65:1. The neutral pill is exempt: it sits over a still, under the on-image convention.

**Screens:** 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing), 377:3922 (Weekly quest track progress), 406:9862 (Prediction Game listing), 429:21790 (Rewards / Live auction), 429:22526 (Rewards / Prediction Games), 429:23212 (Weekly Quest Rewards), 379:4980 (Completed weekly quest details), 418:18052 (OPTION 1 - Auction), 382:6636 (WeeklyQuestProgressScreen)

### `badge.level` — Badge / Level (LV 1 / LV 2)
*primitive · reusable · 1 screen(s) · 15 instance(s)*

**Anatomy**
1. Container center p1/7
1. Label {labelSmall}

**Tokens**
- height: 18
- radius: 20

**Variants**
- **lv2** — fill {yellow@10%} stroke {yellow@20%} label {yellow}
- **lv1** — fill {goldLevel1@10%} stroke {goldLevel1@20%} label {goldLevel1}

**Evidence:** `Container#416:15662`, `Container#416:15832`

**Implementation**
- Drawn inside `ActivityRow` from the same tints as its tile, so the pill and the square can never disagree about a day's level.

**Screens:** 416:15593 (Daily streaks rewards)

### `pill.points` — Pill / Points (header)
*composite · reusable · 22 screen(s) · 27 instance(s)*

**Anatomy**
1. Background+Border H center gap 8 p6/16
1. Icon container 12×14 (gold flame icon)
1. Paragraph (NOT auto-layout): '540 ' {numeralPill} + 'PTS' {labelSmall} at (28,5)

**Tokens**
- height: 29 (32 on P2P/Rewards Home copies)
- radius: 9999
- fill: {pointsPillBg@80%}
- stroke: gradient {goldCta}→{goldLevel1} @0.99, 1px
- padding: 6/16
- gap: 8
- value: {numeralPill} {white}
- unit: {labelSmall} {white}

**Evidence:** `Background+Border#25:3071`, `Background+Border#376:2660 (h32)`

**Notes**
- Two heights for the same pill (29 vs 32) because the value/unit row is absolutely positioned.
- Sora exists only for the 3-letter 'PTS'.

**Screens:** 25:2950 (Home), 26:3104 (Home (Liked Video)), 28:3202 (Home), 29:3649 (Home), 30:3803 (Home), 376:2650 (Home), 384:6948 (Home), 407:10391 (Home), 388:8310 (Home), 381:5991 (Home), 378:4399 (Home), 92:4859 (Home), … +10 more

### `pill.pointsOverImage` — Pill / Points reward over image
*primitive · reusable · 3 screen(s) · 5 instance(s)*

**Anatomy**
1. Container (absolute text)
1. Label

**Tokens**
- height: 23/29
- radius: 20
- fill: {surface@80%}
- stroke: {gold@40%} 1
- label: {numeralPill}–13/19.5 {goldLight} (500 PTS / +300 PTS)

**Evidence:** `Container#165:1969`, `Container#406:10039`

**Screens:** 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing), 406:9862 (Prediction Game listing)

### `pill.multiplier` — Pill / Multiplier over image
*primitive · reusable · 1 screen(s) · 3 instance(s)*

**Anatomy**
1. Text frame p3/10
1. Label

**Tokens**
- height: 23
- radius: 20
- fill: {surface@70%}
- stroke: {white@20%} 1
- label: {labelSmall} {white} (3X MULTIPLIER)

**Evidence:** `Text#406:9891`

**Screens:** 406:9862 (Prediction Game listing)

### `chip.counter` — Chip / Counter (2/3, 5/5)
*primitive · reusable · 2 screen(s) · 8 instance(s)*

**Anatomy**
1. Container V center p4/10
1. Label {numeralPill}

**Tokens**
- height: 30
- radius: 20
- padding: 4/10

**States**
- **inProgress** — fill {gold@10%} stroke {gold@20%} label {gold}
- **done** — fill {success@10%} stroke {success@30%} label {success}

**Evidence:** `Container#377:3970`, `Container#377:4023`

**Screens:** 377:3922 (Weekly quest track progress), 382:6636 (WeeklyQuestProgressScreen)

### `chip.badgeEarned` — Chip / Badge earned (icon + name)
*primitive · reusable · 4 screen(s) · 8 instance(s)*

**Anatomy**
1. Container H center gap 5 p4/10
1. Icon 11 (9×9 {gold})
1. Label {labelSmall} {gold}

**Tokens**
- height: 25
- radius: 20
- fill: {gold@10%}
- stroke: {gold@20%} 1

**Evidence:** `Container#429:21867 High Roller`, `Container#397:9182 23 min left (h27 p5/12 Inter Bold 10)`

**Screens:** 429:21790 (Rewards / Live auction), 429:22526 (Rewards / Prediction Games), 429:23212 (Weekly Quest Rewards), 397:9099 (Daily Streak)

### `chip.timeLeft` — Chip / Time left
*primitive · reusable · 3 screen(s) · 3 instance(s)*

**Anatomy**
1. Container H center gap 4–5 p3/10 or 6/12
1. Icon 10–11 {gold}
1. Label

**Tokens**
- variants: h23 fill {goldLight@10%} stroke {gold@30%} {labelSmall} {gold} (#165:1950) — h31 fill {gold@10%} stroke {gold@40%} {labelMedium} {gold} (#382:6649)

**Evidence:** `Container#165:1950`, `Container#382:6649`

**Screens:** 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing), 382:6636 (WeeklyQuestProgressScreen)

### `chip.legend` — Chip / Legend (dot + label)
*primitive · reusable · 1 screen(s) · 3 instance(s)*

**Anatomy**
1. Container H gap 5 p4/10
1. Dot 6×6 r3 ({goldLevel1}/{yellow}/{textDisabled})
1. Label {labelSmall} ({white} / {textDisabled} locked)

**Tokens**
- height: 25
- radius: 20
- fill: {surfaceCard}
- stroke: {outline} 1

**Evidence:** `Container#416:15634`

**Implementation**
- `StreakLevelChips` lays the three rungs out in a `Wrap`: they fill the width at the design's text size, so a scaled-up label has to be able to take a second line.
- Reached is a colour in the design and nothing else, so each chip carries a composed label saying 'reached' or 'not reached yet'. The unreached label steps from `{textDisabled}` to `text.muted`, which is legible.
- Whether a rung is reached is derived, not stored: it is true once one day in the log met its watch time.

**Screens:** 416:15593 (Daily streaks rewards)

### `segmented` — Segmented control (earns / badges)
*primitive · reusable · 6 screen(s) · 6 instance(s)*

**Anatomy**
1. Track H p3 gap 0
1. Item V center p5/16 (h27 r16)
1. Item label {labelMedium}

**Tokens**
- trackHeight: 35
- trackRadius: 20
- trackFill: {surface}
- trackStroke: {outline} 1
- itemHeight: 27
- itemRadius: 16

**States**
- **active** — fill gradient {goldLight}→{gold}, label {surface}
- **inactive** — no fill, label {textMuted}

**Evidence:** `Container#414:12377`, `Button#414:12380`

**Screens:** 414:12370 (Badges / Earned), 414:12502 (Badges / Locked), 486:1739 (My earns & rewards), 429:21290 (My earns & rewards), 486:1868 (My earns & rewards), 486:1997 (My earns & rewards)

### `tab.pill` — Tab pill (Earned / Locked)
*primitive · reusable · 2 screen(s) · 4 instance(s)*

**Anatomy**
1. Tabs row gap 8
1. Tab H center p6/12
1. Label {overline}

**Tokens**
- height: 27
- radius: 999
- padding: 6/12

**States**
- **active** — no fill, stroke primary200 (renders DARK {gold}) 1, label {gold}
- **inactive** — fill {surfaceCard} stroke {outline}, label {textMuted}

**Evidence:** `Tab - Earned (Active)#414:12419`, `Tab - Locked#414:12421`

**Notes**
- Only Visuals nodes bound to a library variable that render its DARK value. Text case differs between the two screens (Earned vs EARNED).

**Screens:** 414:12370 (Badges / Earned), 414:12502 (Badges / Locked)

### `avatar` — Avatar
*primitive · reusable · 12 screen(s) · 19 instance(s)*

**Anatomy**
1. Circle container (r = size/2)
1. Image fill child
1. optional stroke ring
1. optional edit badge 24 disc {gold} icon 10 {surface} at (60,56)

**Tokens**
- sizes: **profile** 80; **cast** 52; **comment** 36; **bidder** 36
- rings: **profile** {gold@30%} 1; **refer** {gold} 3; **cast** {outline} 1.66; **bidder** bg {pointsPillBg}, no ring

**Evidence:** `Container#429:23373`, `Image#35:4655`, `Image#35:4285`, `Container#418:18100`, `Container#418:18852 edit badge`

**Screens:** 429:23362 (Router (Profile)), 427:20440 (Profile), 429:21182 (Profile), 429:22118 (Profile), 429:22828 (Profile), 429:21072 (Profile), 433:781 (Profile), 418:18836 (Edit profile), 420:20093 (Refer a friend), 35:4491 (Video details), 30:3890 (Video comments), 418:18052 (OPTION 1 - Auction)

### `progress.linear` — Progress bar (linear)
*primitive · reusable · 19 screen(s) · 39 instance(s)*

**Anatomy**
1. Track (auto-layout V, fill child)
1. Fill (fixed width, same radius)

**Tokens**
- heights: **default** 4 (r2); **hero/P2P** 5 (r3); **rewardsHeader** 3 (r0)
- track: {outline} (My Earns rows: {surfaceRaised})
- fill: gradient {gold}→{yellow} (default) / {gold@60%}→{goldLight@90%} (My Earns) / {gold}→{goldLight} (badges to unlock) / {success} (complete) / {yellow} (vote share)

**Evidence:** `Container#165:1958`, `Container#376:3326`, `Container#486:1777`, `Container#414:12411`, `Container#382:6739`

**Notes**
- 5 different fills for one component; radius = height/2 except rewards header (r0).

**Screens:** 376:3272 (P2P), 384:7013 (P2P), 407:10456 (P2P), 378:4464 (P2P), 429:20692 (Rewards), 429:23472 (Rewards), 432:23866 (Rewards), 414:12370 (Badges / Earned), 414:12502 (Badges / Locked), 486:1739 (My earns & rewards), 429:21290 (My earns & rewards), 486:1868 (My earns & rewards), … +7 more

### `progress.steps` — Progress steps (7 bars)
*primitive · reusable · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Row H gap 4 padTop 14
1. 7× bar 40×6 r3

**Tokens**
- done: gradient {gold}→{yellow}
- todo: {outline}

**Evidence:** `Container#397:9130`

**Screens:** 397:9099 (Daily Streak)

### `progress.ring` — Progress ring (58)
*primitive · reusable · 2 screen(s) · 2 instance(s)*

**Anatomy**
1. Icon frame 58 with 2 arc vectors 46×46 stroke 5 ({outline} track, {gold} fill)
1. Center label {labelMedium} {goldLight}

**Tokens**
- size: 58
- strokeWidth: 5

**Evidence:** `Container#377:3945`

**Screens:** 377:3922 (Weekly quest track progress), 382:6636 (WeeklyQuestProgressScreen)

### `divider` — Divider
*primitive · reusable · 24 screen(s) · 24 instance(s)*

**Anatomy**
1. 1px frame fill

**Tokens**
- color: {outline} (main) / {authOutline} (auth) / {surfaceRaised} (modal)
- vertical: 1×62 {outline} with 2 vertical margin (P2P stat columns)

**Variants**
- **withLabel** — auth 'or continue with': two 108×1 lines + {caption} {authTextSecondary}, gap 12 (#97:5281)

**Evidence:** `Container#376:3315`, `Container#97:5282`, `Container#376:3292`

**Screens:** 376:3272 (P2P), 384:7013 (P2P), 407:10456 (P2P), 378:4464 (P2P), 429:20692 (Rewards), 429:23472 (Rewards), 432:23866 (Rewards), 486:1739 (My earns & rewards), 429:21290 (My earns & rewards), 486:1868 (My earns & rewards), 486:1997 (My earns & rewards), 97:5251 (Sign In), … +12 more

### `checkDisc` — Check disc
*primitive · reusable · 4 screen(s) · 14 instance(s)*

**Anatomy**
1. Disc
1. Icon

**Tokens**
- variants: **done16** 16 r8 fill {success} icon 9 (7×5 {surface}) — action title row; **done22** 22 r11 fill {success@20%} stroke {success} 1 icon 11 (8×6 {success}) — completed actions list; **feature18** 18 r9 fill {gold@20%} stroke {gold} 1 icon 10 (7×6 {gold}) — Why Subscribe bullets; **levelDone32** 32 r16 fill {gold} icon 14 (10×8 {surface})

**Evidence:** `Container#377:4018`, `Container#379:5045`, `Container#433:1044`, `Container#397:9146`

**Screens:** 377:3922 (Weekly quest track progress), 382:6636 (WeeklyQuestProgressScreen), 379:4980 (Completed weekly quest details), 433:1005 (Subscribe)

### `sheetHandle` — Sheet handle
*primitive · reusable · 6 screen(s) · 6 instance(s)*

**Anatomy**
1. Handle bar

**Tokens**
- size: 40×4
- radius: 2
- fill: {textMuted}
- padding: 12 top / 8 bottom

**Variants**
- **modal** — 36×3 {outline} r2 pad 14
- **success** — 40×4 {outline} r9999 pad 12/24
- **refer** — 40×4 {textMuted} pad 12/4

**Evidence:** `Container#36:4944`, `Container#382:6802`, `Background#404:9796`

**Screens:** 36:4835 (Share video), 35:4491 (Video details), 30:3890 (Video comments), 420:20093 (Refer a friend), 382:6636 (WeeklyQuestProgressScreen), 404:9787 (Successs state)

### `icon` — Icon (vector glyph in square frame)
*primitive · reusable · 1 screen(s) · 1214 instance(s)*

**Anatomy**
1. Square frame
1. VECTOR / BOOLEAN_OPERATION children

**Tokens**
- frames: 24 (×193), 22 (×67), 18 (×59), 16 (×53), 20, 14, 12, 11, 10, 9
- fillColors: {white} (94 vec), {gold} (128), {textSecondary} (15), {textMuted} (91), {success} (16), {textDisabled} (6), {error} (8)
- strokeIcons: nav inactive 1.5 {navInactive} / {textMuted}; My Earns icons 1.5 {gold}; streak icons 1 {gold}

**Notes**
- No icon library/component is used; every glyph is a loose vector. 1,214 vectors total.

**Screens:** (all)

### `appBar.back` — AppBar / Back header
*composite · reusable · 16 screen(s) · 18 instance(s)*

**Anatomy**
1. BackHeader H center gap 12 P48/16/16/16
1. btn.icon.back 36
1. Title TEXT (wrapper 115×24)

**Tokens**
- height: 113
- fill: {surface}
- padding: 48/16/16/16
- gap: 12
- title: {titleMedium} {white}

**Variants**
- **default** — 373×113 (×10)
- **dailyStreaks** — 88 tall, plain 24 chevron, {titleMedium} (#397:9102)
- **auction** — 72 tall P0/16 after a separate 59 status block (#429:21812)
- **auth** — P48/20/8/20, 80/92 tall, {titleMedium}, back button on OTP only (#97:5254, #129:126)
- **createAccount** — 44 tall P0/20/8/20 (status handled by root) (#132:653)

**Evidence:** `BackHeader#377:4222`, `BackHeader#97:5254`, `BackHeader#397:9102`

**Notes**
- Sign In has NO back button; Verify OTP and Create Account do — intentional?
- 5 header heights for the same role.

**Screens:** 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing), 377:3922 (Weekly quest track progress), 406:9862 (Prediction Game listing), 429:23676 (Exclusive content), 432:23967 (Exclusive content), 418:18836 (Edit profile), 486:1739 (My earns & rewards), 429:21290 (My earns & rewards), 486:1868 (My earns & rewards), 486:1997 (My earns & rewards), 416:15593 (Daily streaks rewards), … +4 more

### `appBar.profile` — AppBar / Profile header (label + settings)
*composite · reusable · 8 screen(s) · 8 instance(s)*

**Anatomy**
1. Container H SB center P48/16/16/16
1. 'Profile' eyebrow {overline} {textSecondary}
1. btn.icon.settings 24

**Tokens**
- height: 102 (88 on Refer)

**Evidence:** `Container#429:23365`

**Screens:** 429:23362 (Router (Profile)), 427:20440 (Profile), 429:21182 (Profile), 429:22118 (Profile), 429:22828 (Profile), 429:21072 (Profile), 433:781 (Profile), 420:20093 (Refer a friend)

### `appBar.overVideo` — AppBar / Over-video top bar
*composite · reusable · 17 screen(s) · 22 instance(s)*

**Anatomy**
1. Container 374×95 gradient topBarScrim, H SB center P48/16/0/16
1. Left: empty 28×20 container (logo slot)
1. (unlocked variant) tag.exclusive left
1. Right: pill.points

**Tokens**
- height: 95
- fill: gradient {surface}→{surface@50%}→{surface@10%}

**Evidence:** `Container#25:2957`, `Container#432:24037`

**Notes**
- Left 28×20 container is EMPTY on every Home — a missing logo/menu asset.

**Screens:** 25:2950 (Home), 26:3104 (Home (Liked Video)), 28:3202 (Home), 29:3649 (Home), 30:3803 (Home), 376:2650 (Home), 384:6948 (Home), 407:10391 (Home), 388:8310 (Home), 381:5991 (Home), 378:4399 (Home), 92:4859 (Home), … +5 more

### `bottomNav` — BottomNav (client-approved library Nav Bar colours)
*composite · reusable · 38 screen(s) · 38 instance(s)*

**Anatomy**
1. Nav Bar H P12/20/12/20 gap 48
1. 4 items V center P0/12 (48×38; active 48×43)
1. Item: icon frame 24 + label wrapper (gap 2/3) + active indicator 16×2 r1 gold with glow

**Tokens**
- height: 64
- fill: {navBar}
- border: top 1 {navBarOutline}
- active: {goldDeep} icon + label navLabel Bold
- inactive: {navInactive} icon (stroke 1.5) + label navLabel SemiBold
- indicator: 16×2 r1 {goldCta} + glow.navIndicator
- itemPadding: 0/12
- itemGap: space-between across 375 with 20 side padding
- iconFrame: 24

**Variants**
- **Active=Home** — ×14
- **Active=P2P** — ×4
- **Active=Rewards** — ×16 (design used hand-built nav B — restyle to these colours)
- **Active=Profile** — ×7 (same)

**Evidence:** `Nav Bar#376:3608`, `Nav Bar#376:3886`, `BottomNav#429:20882 (to be restyled)`

**Notes**
- Design had two navs (library instance on Home/P2P, hand-built on Rewards/Profile/Badges). Client keeps the library colours; the hand-built screens adopt them. Rewards/Profile active variants must be added to the library component.
- Built as `AppBottomNav`, not Material's `NavigationBar`: the indicator sits *below* the label, which a `NavigationDestination` cannot express.
- The four glyphs ship as SVGs under `assets/icons/nav_*.svg`, tinted at runtime, until the icon font exists. Home and P2P have a filled `_active` counterpart because the design draws one; Rewards and Profile do not, so their selected state is the same outline glyph in {goldDeep} plus the bolder label and the indicator. They gain a filled glyph when the library does.
- The bar is 12 of padding, the items, then 12 more, which is the 64 the frame draws (68 here: the icon frame is the library's 24 rather than the hand-built nav's 22). The lower 12 and the home indicator's strip are the same gap and never stack, so a `SafeArea` `minimum` takes whichever is larger: 68 where there is no indicator, 90 where there is. Reading the 64 as running to the screen edge instead left 30 for a 44-tall item, which pinned the glyphs to the top border and left the strip below them empty. The height is a minimum, not fixed, because the type scale raised nav labels from 9 to 10 and a user-scaled label has to grow the bar rather than be clipped. The upper 12 sits inside the item so it is part of the tap target, which keeps each one over 48dp; the design's own item is 38-43 tall.

**Screens:** 25:2950 (Home), 26:3104 (Home (Liked Video)), 28:3202 (Home), 29:3649 (Home), 30:3803 (Home), 376:2650 (Home), 376:3272 (P2P), 378:4399 (Home), 378:4464 (P2P), 381:5991 (Home), 384:6948 (Home), 384:7013 (P2P), … +26 more

### `videoOverlay` — Home / Video player overlay
*pattern · reusable · 17 screen(s) · 22 instance(s)*

**Anatomy**
1. HomeScreen 375×747 fill {surface}
1. Image (Neon Noir) full-bleed
1. Scrim heroVideoScrim
1. appBar.overVideo
1. Action rail (4× btn.icon.actionRail) at 328,385
1. Meta block P0/16/16/16 gap 8 at y=651: Heading 2 ({headlineLarge} {white}) + meta row P4/0/0/0 gap 8 (studio {caption} {textSecondary} + 2× tag.genre)

**Tokens**
- videoHeight: 747 (812 − 64 nav − 1)
- title: {headlineLarge} {white}
- metaGap: 8

**Evidence:** `HomeScreen#25:2953`, `Container#118:2`

**Screens:** 25:2950 (Home), 26:3104 (Home (Liked Video)), 28:3202 (Home), 29:3649 (Home), 30:3803 (Home), 376:2650 (Home), 384:6948 (Home), 407:10391 (Home), 388:8310 (Home), 381:5991 (Home), 378:4399 (Home), 92:4859 (Home), … +5 more

### `sheet.bottom` — BottomSheet (container)
*composite · reusable · 4 screen(s) · 4 instance(s)*

**Anatomy**
1. Backdrop (scrim)
1. Container fill {surfaceCard} r20/20/0/0 top hairline {outline} shadow
1. sheetHandle
1. Content P0/20/32/20

**Tokens**
- radius: 20/20/0/0
- fill: {surfaceCard} (comments: gradient {surfaceCard}→{surfaceCard})
- stroke: top 1 {outline}
- shadow: DS(0,-18,28,0,{black@60%}) / {black@50%}
- backdrop: {surface@80%} (share/details/comments) / {surface@80%} (refer)
- handle: 40×4 r2 {textMuted}, pad 12/8
- contentPadding: 0/20/32/20

**Variants**
- **share** — h180: title {titleMedium} + 5 app discs 52 r26 (brand colours) with {caption} labels gap 8, row margin 20/24 (#36:4942)
- **videoDetails** — h423: title {headlineSmall} + tag.genre row + btn.icon.close; paragraph {bodyMedium} {textSecondary} (pt16); 'Cast' eyebrow {overline} {textMuted} (pt20); cast row avatars 52 gap 16 + {caption} centered (#35:4628)
- **comments** — h484: header row P0/20/16/20 SB (Comments {titleMedium} + close); list P0/20 gap 20 of commentCard; input.comment bar (#35:4273)
- **refer** — h350 no hairline/shadow: see referSheet (#420:20170)

**Evidence:** `Container#36:4942`, `Container#35:4628`, `Container#35:4273`

**Screens:** 36:4835 (Share video), 35:4491 (Video details), 30:3890 (Video comments), 420:20093 (Refer a friend)

### `commentCard` — Comment card
*composite · reusable · 1 screen(s) · 3 instance(s)*

**Anatomy**
1. Row H gap 12
1. avatar 36
1. Column: header H gap 8 (@handle {titleSmall} {white}, time {caption} {textMuted}) → body Paragraph pt4 {bodySmall} {textSecondary} → actions row pt8 gap 16 (like icon 14 + count {caption} {textSecondary} gap 4; Reply 11 {textMuted})

**Tokens**
- gap: 12
- avatar: 36

**Evidence:** `Container#35:4284`

**Screens:** 30:3890 (Video comments)

### `onboardingSlide` — Onboarding slide
*pattern · reusable · 3 screen(s) · 3 instance(s)*

**Anatomy**
1. Root fill {authSurface}
1. Image @0.3 opacity
1. Scrim onboardingScrim + radial vignette
1. Top bar P48/20/0/20 SB: btn.icon.back + btn.text skip
1. Content group @ (20,326) w333 gap 28: [tag.eyebrow; Heading {displayLarge} {white}] pb12 → [Paragraph Inter 14/23.8 {authTextSecondary} pb14; stat pill h37 r8 {gold@10%} p7/12 gap 8 ({labelLarge} {goldLight} + Inter 12 {authTextMuted}/{authTextMuted})] pb28 → 3 stat tiles 106×76 r12 {white@10%} stroke {white@10%} p12/6/10/6 (emoji 22 pb6 + {caption} {white@80%}) gap 8
1. CTA btn.primary 333×52 @ (20,733) with chevron

**Tokens**
- contentWidth: 333
- sidePadding: 20
- ctaBottom: 812−733−52 = 27

**Evidence:** `OnboardingScreen#85:1664`, `Frame#85:1670`

**Notes**
- Implemented 2026-09-09 as the onboarding feature: a three-page PageView, one slide widget per frame. The three frames differ only in image and copy, so they are one widget driven by data rather than three screens.
- The frame places the copy at a fixed y=326 in an 810 frame; the build anchors it to the bottom above the CTA instead, so it holds on shorter and taller devices.
- Figma draws image opacity 0.35, stat pill {gold@8%} and tiles {white@5%}/{white@9%}/{white@75%}; these use the normalised tokens (0.30, {gold@10%}, {white@10%}, {white@80%}) the token set already records.
- Emoji take AppIconSize.lg (22 snaps to 24) since the system treats them as icons in the platform emoji font.

**Screens:** 85:1662 (Intro Screen 1), 85:1733 (Intro Screen 2), 85:1803 (Intro Screen 3)

### `authForm` — Auth form (Sign In / OTP / Create Account)
*pattern · reusable · 6 screen(s) · 6 instance(s)*

**Anatomy**
1. Root fill {authSurface}
1. appBar.back (auth variant)
1. Content P24/24/32/24 gap 28 (24 on Create Account)
1. Heading block: {headlineMedium} {white} + paragraph pt8 {bodySmall} {authTextSecondary} (Inter on OTP/Create)
1. Field group(s): label + input.text gap 8; fields gap 18
1. btn.primary goldButton 325×54 (disabled until valid)
1. divider.withLabel
1. 2× btn.social gap 10
1. Legal paragraph {caption} centered {authTextSecondary} with gold link spans (auto-margin to bottom)

**Tokens**
- sidePadding: 24
- contentWidth: 325
- blockGap: 28

**Variants**
- **otp** — 4× input.otp gap 12 centered; resend text Inter 13/19.5 centered; CTA Continue
- **createAccount** — gap 24; 2 fields (NAME, Referral Code (optional) lowercase span) gap 18; CTA Create Account outside content block

**Evidence:** `Container#97:5260`, `Container#129:132`, `Container#132:659`

**Notes**
- Built 2026-09-09 against a mocked service: the CTAs advance the flow, nothing is sent.
- Radius 10 and the 50/54 button heights take the recorded snaps (12, control 52); block gap 28→32, field gap 18→20, social gap 10→12.
- The input error state is still undesigned, so an invalid field takes the recorded error role and a focus-shaped glow in it, which is what the open item's derived-rules note calls for.
- The Google mark is `assets/icons/google.svg`, the vector layer of `97:5288`, rendered with flutter_svg as the icon decision here calls for. The legal document names open a placeholder URL until the real pages exist.
- Vertical centring of text takes two rules, both in the theme so every screen inherits them: text roles all set `leadingDistribution: even`, because Flutter's default splits a line's extra leading unevenly; and an input's 52 height comes from `AppSpacing.inputContent` rather than a `minHeight` alone, because the decorator anchors its text by baseline inside height a `minHeight` adds, leaving the value sitting high. A test in `test/core/theme` guards both.
- The dialling-code box is a menu of six markets rather than the static +91 the frame draws; the number's expected length follows the country chosen.

**Screens:** 97:5251 (Sign In), 128:70 (Sign In (Filled)), 129:125 (Verify OTP), 129:179 (Verify OTP (Filled)), 132:651 (User's name), 130:410 (User's name (Filled))

### `statCard` — Stat card (3-up)
*composite · reusable · 8 screen(s) · 24 instance(s)*

**Anatomy**
1. Container V P12 gap 0 (106×73)
1. Value {numeralMd} {goldLight} centered
1. Label pt2 {caption} {textSecondary} centered

**Tokens**
- size: 106×73
- radius: 12
- fill: {surfaceCard}
- stroke: {outline} 1
- padding: 12
- rowGap: 12

**Evidence:** `Container#429:23379`

**Screens:** 429:23362 (Router (Profile)), 427:20440 (Profile), 429:21182 (Profile), 429:22118 (Profile), 429:22828 (Profile), 429:21072 (Profile), 433:781 (Profile), 420:20093 (Refer a friend)

### `statRowCard` — Stat row card (P2P header: Rank / Streak / Points + badge progress)
*composite · reusable · 4 screen(s) · 4 instance(s)*

**Anatomy**
1. Card 341×165 r16 fill {surfaceCard} stroke {outline} P12/14
1. 3 columns (99/111/99) separated by 1×62 dividers: eyebrow {overline} {textMuted}; value {numeralMd} (#294) / 18/22 (5,000) {gold} or pill.points; sub {caption} {success} (+12 wk with 9 icon) / {caption} {textMuted}
1. Divider pt14
1. Badge row pt12 gap 10: emoji 20 + column (name {labelMedium} + 363/1000 {numeralPill} {white@60%} SB; progress.linear h5 pt5; caption {caption} {textMuted} pt4)

**Tokens**
- radius: 16
- padding: 12/14

**Evidence:** `Container#376:3278`

**Screens:** 376:3272 (P2P), 384:7013 (P2P), 407:10456 (P2P), 378:4464 (P2P)

### `gameCard` — Game card (P2P / Rewards list)
*composite · reusable · 7 screen(s) · 21 instance(s)*

**Anatomy**
1. Button wrapper 341×145 (V, fill)
1. Container 341×145 stroke {outline} r14 (clip)
1. Image 339×143 @1,1
1. Scrim A ({surface@90%}@0.3→{surface@20%}) + Scrim B ({surface@60%}→transparent@0.5)
1. Content H center P0/16 gap 12: column (tag.category in 33-tall slot; title {cardTitle} {Text-black/lg} {white}; subtitle pt4 {caption} {white@60%}) + btn.icon.back disc 36 as chevron
1. Ghost 20×20 container at (306,110)

**Tokens**
- size: 341×145
- radius: 14
- stroke: {outline} 1
- listGap: 10

**Evidence:** `Button#376:3336`, `Button#429:20756`

**Notes**
- Uses the BACK-button disc as a forward chevron (same asset, same glyph direction 6×9 — check the arrow points right). Built 2026-09-09 as `ForwardDisc` beside `BackDiscButton`, with the row carrying the tap so the disc is decorative.
- The two scrims run in different directions, which the gradient table did not record until the card was built: `gameCardScrim` goes left to right, holding down the side the copy sits on, and `gameCardScrimBottom` goes bottom to top. Painting both downwards left the still bright under the title and dark where the design keeps it visible. The second was named `…Top` until it was built; the name now says which edge it holds.
- Radius 14 and the 10 list gap take the documented snaps, 14→16 and 10→12.

**Screens:** 376:3272 (P2P), 384:7013 (P2P), 407:10456 (P2P), 378:4464 (P2P), 429:20692 (Rewards), 429:23472 (Rewards), 432:23866 (Rewards)

### `heroQuestCard` — Hero quest card (featured)
*composite · reusable · 2 screen(s) · 2 instance(s)*

**Anatomy**
1. Container 341×329 fill transparent stroke {gold@40%} 1 r16 DS(0,4,24,{gold@10%}) clip
1. Image 339×140 + scrim ({surface@20%}→{surface@80%})
1. badge.status ACTIVE @ (13,13); pill.pointsOverImage @ (263,13)
1. Body fill {surfaceCard} P14/16/16/16: title row SB ({titleMedium} {white} + chip.timeLeft); desc pt4 {bodySmall} {textSecondary}; progress row P12/0/14/0 gap 10 (progress.linear h5 + '4 / 10' {numeralAction} {gold}); btn.primary cardCTA h42 'Track Progress'

**Tokens**
- radius: 16
- imageHeight: 140

**Evidence:** `Container#165:1943`

**Screens:** 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing)

### `questListCard` — Quest list card
*composite · reusable · 2 screen(s) · 6 instance(s)*

**Anatomy**
1. Card 341×129 gradient {surfaceCard}→{surfaceCard} stroke {outline} r10 (P0/12/10/12 gap 10)
1. Image 88×126 left (bleed)
1. Content P12/14 SB: pts {numeralPill} {gold}; title pt4 {titleSmall} {white}; desc pt3 {caption} {textMuted}; btn.secondary 'Start Quest' (pt10) or badge.status REWARD CLAIMED

**Tokens**
- radius: 10
- listGap: 12

**States**
- **available** — Start Quest button
- **claimed** — image @0.4 + overlay {success@10%} + check 20 {success}; title {textMuted}; REWARD CLAIMED badge

**Evidence:** `Container#165:1974`, `Container#165:2004`

**Notes**
- Middle card (#165:1989) is wrapped in a second {surfaceCard} r14 container — inconsistent nesting.

**Screens:** 165:1931 (Weekly Quest listing), 378:4290 (Weekly Quest listing)

### `actionCard` — Quest action card (with curated content)
*composite · reusable · 2 screen(s) · 8 instance(s)*

**Anatomy**
1. Card 341 fill {surfaceCard} stroke {outline} (or {success@30%} done / {success@30%}) r16
1. Header H center P14/14/12/14 gap 12: thumb 42 r10 image; column (title row gap 6: {titleSmall} {white} (+checkDisc 16 when done) ; desc pt3 {caption} {textMuted}); chip.counter
1. progress.linear h4 (P0/14)
1. Curated section pt12 (top hairline {outline}, P12/14/14/14): eyebrow {overline} {textMuted}; rows pt10 gap 8, each 36 tall gap 10–12: thumb 56×36 r6 (+ done overlay {goldCta@30%} check 12 {goldCta} / play overlay {surface@40%} icon 14 white); title {caption} ({textMuted} done / {white} todo); badge.status ✓ DONE or btn.primary mini 'Watch'

**Tokens**
- radius: 16
- headerPadding: 14/14/12/14
- thumb: 42

**States**
- **inProgress** — stroke {outline}, counter gold
- **complete** — stroke {success@30%}, title {textMuted}, checkDisc 16, counter success, bar {success} full

**Evidence:** `Container#377:3960`, `Container#377:4010`, `Container#382:6723`

**Screens:** 377:3922 (Weekly quest track progress), 382:6636 (WeeklyQuestProgressScreen)

### `progressSummaryCard` — Progress summary card (ring + text)
*composite · reusable · 2 screen(s) · 2 instance(s)*

**Anatomy**
1. Card 341×88 fill {surfaceCard} stroke {outline} r14 H center P14/16 gap 16
1. progress.ring 58
1. Column: {labelLarge} {white} + pt3 {caption} {textMuted} (MIX gold span)

**Tokens**
- radius: 14

**Evidence:** `Container#377:3944`

**Screens:** 377:3922 (Weekly quest track progress), 382:6636 (WeeklyQuestProgressScreen)

### `streakLevelCard` — Streak current-level card
*composite · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Card gradient {gold@10%}→{gold@10%} stroke {gold@40%} r16 P16
1. Row SB: [eyebrow {overline} {textMuted}; row pt5 gap 10: level disc 36 r10 {gold@20%} stroke {gold@40%} ({titleMedium} {yellow}) + column ({titleMedium} {white}; {caption} {gold})] / right column right-aligned (Inter 9 {textMuted}; {headlineSmall} {yellow}; Inter 9)
1. progress.steps pt14
1. caption pt10 {caption} MIX3

**Tokens**
- radius: 16
- padding: 16

**Evidence:** `Container#397:9109`

**Screens:** 397:9099 (Daily Streak)

### `levelTrack` — Level track (4 steps)
*composite · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Card {surfaceCard} stroke {outline} r14 P14/16
1. Eyebrow
1. Row pt14: 4 steps [disc 32 r16 + label Inter 9 gap 5] with 36×2 connectors ({gold} done / {outline})

**Tokens**
- disc: **done** {gold} fill, icon 14 {surface}; **current** {gold@20%} fill stroke 2 {gold}, {labelMedium} {yellow}, label {labelSmall} {gold}; **locked** {surfaceRaised} fill stroke {outline}, {labelMedium} {textDisabled}, label {textDisabled}

**Evidence:** `Container#397:9140`

**Screens:** 397:9099 (Daily Streak)

### `miniStatCard` — Mini stat card (Streak now / Best / Active days)
*composite · reusable · 2 screen(s) · 6 instance(s)*

**Anatomy**
1. Card 107×90 (107×79 on claimed screen) {surfaceCard} stroke {outline} r12 P12/14 (18/10/12/10)
1. Eyebrow {overline} {textMuted}
1. Value row pt4: optional 🔥 emoji 16; {headlineSmall} ({yellow} highlight / {white}); unit {caption} {textMuted}

**Tokens**
- size: 107×90
- radius: 12
- rowGap: 10

**Evidence:** `Container#397:9193`, `Container#379:5011`

**Screens:** 397:9099 (Daily Streak), 379:4980 (Completed weekly quest details)

### `sessionCard` — Today's session card
*composite · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Card {surfaceCard} stroke {outline} r14 P14/16
1. Row SB: [eyebrow; value 22 {headlineMedium} {white} + '/ 45 min' Inter 12 {textMuted}] + chip.badgeEarned '23 min left' (h27 p5/12 {labelSmall})
1. progress.linear h5 pt10
1. caption pt6 Inter 10 {textMuted}

**Tokens**
- radius: 14

**Evidence:** `Container#397:9173`

**Screens:** 397:9099 (Daily Streak)

### `streakCalendar` — Streak calendar
*composite · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Card {surfaceCard} stroke {outline} r16 P16
1. Header SB: month {titleSmall} {white} + 2× btn.icon.back calendarNav 24 gap 4
1. Weekday row pt14: 7× {labelSmall} {textMuted} centered
1. Grid pt6: 7 cols × 5 rows of day tiles 41×30 r7 (col step 44, row step 33): level1 gradient {goldLevel1}→{goldLevel1} / level2 gradient {yellow}→{goldLight} with {caption} {surface} + 4×4 dot ({black@40%} / {surface}) at (35,24); future: no fill, label {textMuted}
1. Legend pt12 (top hairline, P12/0/0/0 gap 10): 12×12 r3 swatch + Inter 9 {textMuted}

**Tokens**
- dayTile: 41×30 r7
- gridGap: 3 / 3

**Evidence:** `Container#397:9215`

**Screens:** 397:9099 (Daily Streak)

### `badgeTile` — Badge tile (2-col grid)
*composite · reusable · 3 screen(s) · 15 instance(s)*

**Anatomy**
1. Card 166 wide fill {surfaceCard} stroke {outline} r14 P14/12
1. Icon disc 40 r10 (fill {gold@20%} stroke {gold@30%}, icon 18 {gold})
1. Name pt10 {labelMedium} {white}
1. Desc pt2 {caption} {textMuted}

**Tokens**
- width: 166
- radius: 14
- padding: 14/12
- gridGap: 10 / 10

**Variants**
- **streakCentered** — 166×135 P14/12 center: disc 44 r12 fill {gold@10%} stroke {gold@20%} icon 24; name pt10 {labelMedium} {goldLight}; desc pt3 Inter 10 centered; card stroke {gold@20%} (#397:9362)

**States**
- **earned** — h113 as above
- **locked** — h124; disc {surfaceRaised} stroke {outline} icon 16 {textMuted}; name {textMuted} (frame draws both {textDisabled}, which reads 2.38:1 for the name and 2.19:1 for the glyph — below AA's 4.5:1 and 1.4.11's 3:1, so both moved up one role; see §10)
- **current** — fill {gold@10%} stroke {gold@30%}; disc {gold@10%}; name {goldLight} (Expert #427:20568)

**Evidence:** `Container#414:12424`, `Container#414:12556`, `Container#427:20568`, `Container#397:9362`

**Screens:** 414:12370 (Badges / Earned), 414:12502 (Badges / Locked), 397:9099 (Daily Streak)

### `badgeUnlockRow` — Badge-to-unlock row
*composite · reusable · 1 screen(s) · 3 instance(s)*

**Anatomy**
1. Card 341×100 {surfaceCard} stroke {outline} r14 H center P14 gap 14
1. Locked disc 44 r12 {surfaceRaised} stroke {outline} (icon 22 {outline}/{textDisabled})
1. Column: row SB ({titleSmall} {white} + '5d to go' Inter 10 {textMuted}); desc pt3 Inter 11 {textMuted}; progress.linear h4 pt8 (fill {gold}→{goldLight}); caption pt4 Inter 9 {textMuted}

**Tokens**
- radius: 14
- padding: 14
- listGap: 10

**Evidence:** `Container#397:9388`

**Screens:** 397:9099 (Daily Streak)

### `currentBadgeCard` — Current badge card (Rewards header)
*composite · reusable · 2 screen(s) · 2 instance(s)*

**Anatomy**
1. Card 341×105 gradient highlightCardBg stroke {gold@30%} r14 H center P14/16 gap 14
1. Disc 52 r14 gradient {gold}→{goldLight} icon 26 {surface}
1. Column: eyebrow {overline} {textMuted}; Expert pt3 {titleMedium} {goldLight}; progress.linear h4 pt6; caption pt5 Inter 10 {textMuted}

**Tokens**
- radius: 14

**Evidence:** `Container#414:12401`

**Screens:** 414:12370 (Badges / Earned), 414:12502 (Badges / Locked)

### `pointsHeader` — Points header (Rewards / Badges)
*composite · reusable · 5 screen(s) · 5 instance(s)*

**Anatomy**
1. Header block gradient {surfaceCard}→{surface} (headerFade) bottom hairline {outline}, P50/16/0/16 gap 18
1. Top row SB: eyebrow 'Rewards' {overline} {textMuted} + segmented (Badges) — Rewards has empty paragraph slot
1. Points row P14/0/16/0 SB max-align: [Total Points Inter 11 {textMuted}; 7,082 {numeralDisplay} gradient {yellow}→{gold} + 'pts' Inter 12 {textMuted}] / right-aligned [Badge Inter 10; Expert {titleSmall} {gold}; 918 pts to Loyalist Inter 10]
1. (Badges) progress.linear h3 r0 fill {gold}→{yellow} full width

**Tokens**
- topPadding: 50

**Evidence:** `Container#429:20695`, `Container#414:12373`

**Implementation**
- The block paints `overlay.header` and takes the status bar inset itself, so the fade starts at the screen top as the design draws it; the screen around it carries no top SafeArea.
- Rewards was first read as a flat {surface}→{surface} block because the hex map collapses both of the frame's stops onto `surface`. The frame does fade, so it uses `headerFade` like P2P and Badges — with the warm start (#131008) normalised to `surfaceCard`, which trades the design's warm tint for a cool one at the same lightness.
- The design's 50 top pad plus its empty eyebrow slot leaves 35 above the balance, snapped to 32. Below it, the 16 that closes the balance row belongs to the header and the 12 that opens the section belongs to the screen.

**Notes**
- Built 2026-09-09 for the Rewards tab. The 50 top padding is measured from the frame edge and is mostly the 44 status bar, so under a safe area only the remainder plus the empty eyebrow slot is left; the block takes 24 and lands where the frame draws it.
- The Rewards variant's header gradient runs `{surface}`→`{surface}`, so it is painted as the flat scaffold background rather than a gradient.

**Screens:** 429:20692 (Rewards), 429:23472 (Rewards), 432:23866 (Rewards), 414:12370 (Badges / Earned), 414:12502 (Badges / Locked)

### `earnRow` — Earn row (My Earns)
*composite · reusable · 4 screen(s) · 16 instance(s)*

**Anatomy**
1. Button 341×82 {surfaceCard} stroke {outline} r14 V center P14/14/12/14
1. Row gap 10: icon 24 stroke 1.5 {gold}; column ({titleSmall} {white}; pt2 {caption} {textMuted}); right column right-aligned ({numeralMd} {goldLight}; pt2 {caption} {textMuted} 'pts · 38%')
1. progress.linear h4 pt10 track {surfaceRaised} fill {gold@60%}→{goldLight@90%}

**Tokens**
- radius: 14
- listGap: 10

**Evidence:** `Button#486:1760`

**Screens:** 486:1739 (My earns & rewards), 429:21290 (My earns & rewards), 486:1868 (My earns & rewards), 486:1997 (My earns & rewards)

### `activityRow` — Activity row (Daily streaks rewards log)
*composite · reusable · 1 screen(s) · 15 instance(s)*

**Anatomy**
1. Card 341×68 (86 with badge line) {surfaceCard} stroke {outline} ({gold@30%} badge days) r14 V P12/14 gap 0
1. Row gap 10 center: tile 42 r10 ({yellow@10%} stroke {yellow@20%} icon stroke {gold} + '15d' {labelSmall} {yellow} | LV1: {goldLevel1@10%} stroke {goldLevel1@20%}, 🔥 emoji 14, {labelMedium} {goldLevel1}); column (row gap 6: {titleSmall} {white} date + badge.level; pt3 Inter 11 {textMuted}; optional pt5 row gap 4: icon 11 {gold} + {labelSmall} {gold}); right column ({numeralSm} {goldLight} + pt2 Inter 10 {textMuted})

**Tokens**
- radius: 14
- listGap: 8

**Evidence:** `Container#416:15651`, `Container#416:15676`, `Container#416:15821`

**Implementation**
- The 42 tile is a minimum rather than a fixed square. Fixed, it clipped the day count at a 1.3 text scale; the glyph and the count now push it wider instead.
- The date and its level pill sit in a `Wrap`, so a scaled-up date drops the pill to its own line rather than squeezing it off the row.
- Level 1 takes `badge.level1`, every level above it `badge.level2`; the design draws no third tint. The 🔥 the frame sets on the level-1 tile is the `fire` glyph tinted, per §8's rule against shipping emoji as images.
- The whole row is one semantics stop: five texts and a tile otherwise read as six, and the tile only repeats the day count.

**Screens:** 416:15593 (Daily streaks rewards)

### `summaryHeader` — Summary header (rewards detail screens)
*composite · reusable · 4 screen(s) · 4 instance(s)*

**Anatomy**
1. Block fill {surface} bottom hairline {outline}, P0–1/16/16–45/16
1. Row SB max-align: [eyebrow {overline} {textMuted}; value row {numeralXl} {goldLight} + 'pts earned' Inter 12 {textMuted}] / right [label Inter 10 {textMuted}; value {numeralMd} ({yellow}/{success}/{success}); optional sub Inter 10]
1. (Daily streaks) legend row pt12 gap 8: 3× chip.legend

**Evidence:** `Container#416:15619`, `Container#429:21819`, `Container#429:22552`, `Container#429:23238`

**Implementation**
- The block sits under a real `AppBar` at the theme's 56 toolbar, which centres the back button's 48
  tap target 4 below the status inset — the same place the other back-header screens put it, and
  within half a pixel of the frames. My Earns above it was padding 8 and had to come down to match.
- One `SummaryHeader` behind all four screens. Both blocks are `Flexible` under `spaceBetween`, so the leftover width falls between them instead of being handed to the total; the total scales down as a whole, keeping 'pts earned' on the numeral's baseline.
- The eyebrow is a plain `Text`, not a `SectionLabel`: it repeats the app-bar title, and ranking it as a heading would give a screen reader two of them. Weekly Quest passes none, as the frame leaves the slot empty.
- The stat's accent is a tone rather than a colour: `warning` for the streak and win counts, `success` for accuracy and completion. Both blocks are one semantics stop each.

**Screens:** 416:15593 (Daily streaks rewards), 429:21790 (Rewards / Live auction), 429:22526 (Rewards / Prediction Games), 429:23212 (Weekly Quest Rewards)

### `winCard` — Auction win card
*composite · reusable · 1 screen(s) · 4 instance(s)*

**Anatomy**
1. Card 341×161/165 {surfaceCard} stroke {outline} ({gold@30%} when badge) r16 clip
1. Image 339×80 + scrim {surface@90%}@0.4→{surface@30%} + overlay row P12/14 SB: [badge.status neutral h20 + {titleSmall} {white} title] + badge.status WON
1. Body P10/14/12/14: row SB (Inter 11 {textMuted} date; 'Winning bid: 12,500 CP' Inter 11 MIX2); hairline pt8; row pt10 SB: (+200 {numeralMd} {goldLight} + 'pts awarded' Inter 11 {textMuted}) + optional chip.badgeEarned

**Tokens**
- radius: 16
- listGap: 10

**Evidence:** `Container#429:21838`

**Implementation**
- One scrim, not two. Stacking `overlay.gameCard` and `overlay.gameCardBottom` read visibly darker than the frame; the card takes only the first, which darkens the end the lot's name sits on and leaves the still visible at the other.
- The 80 image band is a minimum height, so a scaled-up lot name grows it instead of clipping.
- The bid is one `Text.rich`: the design colours the figure `{gold}` and leaves its label muted, and splitting them into two widgets would let the pair break apart.

**Screens:** 429:21790 (Rewards / Live auction)

### `predictionHistoryCard` — Prediction history card
*composite · reusable · 1 screen(s) · 3 instance(s)*

**Anatomy**
1. Card 341×199/202 {surfaceCard} stroke {outline} ({gold@30%}) r14 V P13/14
1. Row SB: date Inter 11 {textMuted} + [2X {labelSmall} {goldLight} + badge.status CORRECT/INCORRECT]
1. Title pt8 {titleSmall} {white}; question pt2 Inter 11 {textMuted}
1. Row pt10 gap 8: 2× box 152×50 {surface} r8 P7/10 (eyebrow {overline} {textMuted}; pt2 {titleSmall} {white} / {success} / {error})
1. hairline pt12; footer pt10 SB: +250 {numeralMd} {goldLight} (— {textDisabled} when lost) + pts awarded + chip.badgeEarned

**Tokens**
- radius: 14
- listGap: 8

**Evidence:** `Container#429:22575`

**Implementation**
- The two panels are stretched inside an `IntrinsicHeight`, so they match the taller of them. Without it, a `Row` asked to stretch inside a `Column` has no height to fill.
- The panels' 'YOUR VOTE' and 'RESULT' carry their case in the string: Figma applies `uppercase` as a style and the `overline` role has no transform.
- A prediction that paid nothing shows the design's dash, stepped from `{textDisabled}` to `text.muted` so it is legible; the composed label says 'no points awarded' outright.

**Screens:** 429:22526 (Rewards / Prediction Games)

### `questHistoryCard` — Quest history card
*composite · reusable · 1 screen(s) · 5 instance(s)*

**Anatomy**
1. Card 341×151/152 {surfaceCard} stroke {outline} ({gold@30%}) r16 V P14
1. Row SB: date range Inter 11 {textMuted} + badge.status CLAIMED / PARTIAL
1. Title pt10 {titleSmall} {white}; sub pt4 Inter 11 {textMuted}
1. hairline pt12; footer pt12 SB: +500 {numeralMd} {goldLight} + pts awarded Inter 11 + optional chip.badgeEarned

**Tokens**
- radius: 16
- listGap: 10

**Evidence:** `Container#429:23256`

**Implementation**
- A part-finished week takes the gold pill rather than the error one: unclaimed is not failed, which is how the frame tints it. Its glyph is `star`, the simpler five-point star the frame draws there.
- Claimed is derived from the actions, not stored: `actionsCompleted >= actionsTotal`. The header's 4/5 is the count of claimed weeks in the list.

**Screens:** 429:23212 (Weekly Quest Rewards)

### `predictionCard` — Prediction card (listing)
*composite · reusable · 1 screen(s) · 3 instance(s)*

**Anatomy**
1. Card 341×287 stroke {white@10%} ({outline} resolved) r16 clip
1. Image 339×130 + scrim {surface@40%}→{surface@90%}; top row @ (12,10) SB: pill.multiplier + pill.pointsOverImage; title @ (12,102) {labelLarge} {white}
1. Body {surfaceCard} P12/14/14/14: question Inter 13/19.5 {white}; pt12 block: YES/NO row {caption} ({yellow} / {error}; resolved {success}) SB; progress.linear h5 pt5 fill {yellow} ({success}); '80% of players voted' pt4 Inter 10 {textMuted}; btn.tonal 'Cast Your Vote' h40 pt12 or Reward Claimed banner h38 {success@10%} stroke {success@20%} r10 P9/14 gap 8 (icon 14 + {labelMedium} {success})

**Tokens**
- radius: 16
- listGap: 12

**Evidence:** `Container#406:9886`, `Container#406:9946`

**Screens:** 406:9862 (Prediction Game listing)

### `predictionDetail` — Prediction detail screen
*pattern · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Hero 373×256: image 180 + scrim {surface@60%}→{surface}; btn.icon.back @ (16,52); title row @ (16,186) SB: [eyebrow {labelSmall} {textMuted}; 'Neon Noir' {displaySmall} {Text-extrabold/3xl}] + multiplier card 86×46 {goldLight@10%} stroke {goldLight@30%} r8 P6/12 (2X {titleMedium} {goldLight}; MULTIPLIER Inter 9 +0.72 {goldLight@60%})
1. Body P0/16/189/16 gap 59: countdown card {surfaceCard} stroke {outline} r12 P12/16 SB (live dot 7 r3.5 {success} glow + 'Voting closes in' {caption} {textSecondary}; 06:14:22 {numeralMd} {white}); question block (eyebrow {overline}; pt10 {headlineSmall} {white}); 'What others think' + '12.4K voted' Inter 11; split bar h6 r4 ({success} 211 / {error} 130) pt8; YES — 62% / NO — 38% {titleSmall} ({success}/{error}) pt8; paragraph pt10 Inter 12/19.2 {textMuted}; 'Cast your vote · +500 pts' eyebrow; 2× btn.tonal vote 166×56 gap 10 pt12

**Evidence:** `Prediction game#408:10663`

**Screens:** 408:10663 (Prediction game)

### `profileScreen` — Profile screen
*pattern · reusable · 8 screen(s) · 8 instance(s)*

**Anatomy**
1. appBar.profile
1. Header block P16 center: avatar 80 (pb10) + name {titleLarge} {white} + btn.text 'Edit profile'
1. 3× statCard row P0/16 gap 12
1. Upgrade row P16/16/0/16: {surfaceRaised} r12 P14/16 SB (Upgrade Subscription {titleSmall} + pt2 {caption} {textSecondary}; btn.primary small 'Upgrade')
1. Menu list P16/16/32/16: 5× menuRow + destructive Logout row
1. bottomNav Active=Profile

**Evidence:** `ProfileScreen#429:23364`

**Notes**
- Built 2026-09-09 from `429:23362`. Two frames disagree on the menu: this one lists 6 rows, `420:20093` lists 7 (My Earns & Rewards renamed, plus Exclusive Content). The 6-row list is what the app builds, per the user.
- The header glyph is a **bell**, not the gear this component's name implies. Rendered as drawn; the glyph inventory has no bell entry.
- My Earns, Notifications and Logout have no destination yet and render inert. Terms and Privacy open the same placeholder link the sign-in legal text uses. Upgrade opens the subscribe sheet.
- No avatar asset exists, so the avatar falls back to the name's initials; the model carries an `avatarUrl` for when one does.
- The counters take a thousands separator ('2,500'), as the frame writes them.
- The title row takes no top padding. The frame leaves 11 between the status bar and the bell glyph, and the bell's 48 tap target already carries 12 around its 24 glyph; a gap on top of that put the avatar 88 below the status bar where the frame draws it at 72.

**Screens:** 429:23362 (Router (Profile)), 427:20440 (Profile), 429:21182 (Profile), 429:22118 (Profile), 429:22828 (Profile), 429:21072 (Profile), 433:781 (Profile), 420:20093 (Refer a friend)

### `menuRow` — Menu row
*primitive · reusable · 8 screen(s) · 48 instance(s)*

**Anatomy**
1. Button H SB center P16/0 h54, bottom hairline {outline}
1. Label {bodyMedium} {white}
1. Chevron icon 16 (5×8 {textMuted})

**Tokens**
- height: 54
- divider: bottom 1 {outline}

**Variants**
- **destructive** — h53, gap 8, leading icon 18 {error} + label {error}, no hairline (Logout #429:23429)

**Evidence:** `Button#429:23404`, `Button#429:23429`

**Screens:** 429:23362 (Router (Profile)), 427:20440 (Profile), 429:21182 (Profile), 429:22118 (Profile), 429:22828 (Profile), 429:21072 (Profile), 433:781 (Profile), 420:20093 (Refer a friend)

### `editProfileForm` — Edit profile form
*pattern · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. appBar.back
1. Content P0/20 gap 49: avatar block P16/0 center (avatar 80 ring {gold@30%} + camera badge; change-photo button slot 93×28 EMPTY)
1. 'About You' eyebrow {overline} {textSecondary}; fields pt14 gap 16: input.text app variant ×3 (Full Name / Email ID / Phone No.)
1. btn.primary 325×52 'Save Changes' (SB-aligned label — centered visually) pb16

**Evidence:** `EditProfileScreen#418:18839`

**Notes**
- Button#418:18855 (93×28) is an empty frame — missing 'Change photo' label.
- Built 2026-09-09. The empty change-photo frame is left out rather than given invented copy.
- The frame draws no bottom nav, so the route sits outside the shell and covers it while the path still nests under `/profile`.
- Field labels and the 'About You' eyebrow render upper-case, as the frame draws them, though this entry records the label role as {labelMedium}.
- The avatar badge glyph is a **pencil**; the glyph inventory calls this one 'camera (edit avatar)'.

**Screens:** 418:18836 (Edit profile)

### `referSheet` — Refer-a-friend sheet
*pattern · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Scrim {surface@80%}
1. Sheet {surfaceCard} r20/20/0/0 h350; handle P12/4
1. Content P0/20/32/20: title row SB ({titleMedium} + btn.icon.close); code card pt16 {surfaceRaised} r12 P14/16 SB (Your Referral Code {caption} {textSecondary} pb4; CH8362 {numeralLg} {goldLight}; btn.outline copyCode); apps row P20/0/24/0: 4× disc 48 r24 ({brand.whatsapp} / {brand.telegram} / {brand.instagram} / {textMuted}) {titleMedium} white letter + {caption} {textSecondary} label gap 8; btn.primary 'Refer a friend'

**Evidence:** `Container#420:20170`

**Notes**
- Built 2026-09-09. The share targets are the coloured letter discs the frame draws, not brand marks, so no brand SVGs were needed; the marks stay on the icon-font list.
- Every target and the CTA copy the code, since no share intent is wired yet.
- The route is transparent and full-height with the block painted at the bottom, so the sheet can hug its content and still carry the messenger its copy confirmation needs — a sheet sized to its content puts that confirmation behind itself.

**Screens:** 420:20093 (Refer a friend)

### `subscribeScreen` — Subscribe (paywall) screen
*pattern · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Root {surface} (free-form absolute layout)
1. 'PREMIUM ACCESS' {labelSmall} {gold} @ (16,61); title {displaySmall} {Text-extrabold/3xl} {white} 341 wide @ (16,88)
1. Feature rows @ (16,188) gap 12: 341×71 {surfaceCard} stroke {outline} r12 H SB P14/16 ({titleSmall} {white} + pt2 {caption} {textSecondary}; UNLOCK chip h25 r20 {gold@10%} stroke {gold} {labelSmall} {gold})
1. 'Why Subscribe?' {titleSmall} {textSecondary} @ (16,457); bullets pt12 gap 12: checkDisc feature18 + {bodySmall} {textSecondary}
1. btn.primary 325×52 'Subscribe Now' @ (24,730)

**Evidence:** `P2PUnsubscribedScreen#433:1007`

**Notes**
- No app bar / close affordance on the paywall.
- CTA inset 24 while content inset 16.
- Built 2026-09-09 as the last step of sign-up. The absolute y positions become a scrolling column and the CTA stays pinned beneath it, so the screen holds on shorter and taller devices.
- Feature-row and benefit copy is placeholder; the frame's own text was not available when this was built.
- The feature18 check disc renders at 20 (18 snaps to 20).
- The sign-up flow's paywall is `777:2871` (inside section 97:5036), a newer frame than the `433:1005` this entry was written from, and that is what the app builds. Its off-system values were normalised onto the existing token set rather than added to it: the warm surface makes it an auth screen, so cards are {authContainer} on {authOutline} at radius 16 (design: {white@4%} blurred, {white@8%} stroke) and every text colour is an auth role (design: #94A3B8 / #CBD5E1); the 26px Inter title takes headlineMedium per the 26→24 auth-heading rule; the UNLOCK pill follows this entry's own chip spec ({gold@10%} on {gold}) rather than the frame's {gold@70%} border on {black@20%}; the eyebrow gold is {gold}, not #F5C518. Dropped for want of a role: the 6px backdrop blur, the {white@10%} inset top highlight and the eyebrow's glow. The frame also adds a 'Skip for now' action and carries five bullets, both built.
- The same offer also appears as a sheet, `777:3481` (`777:3504` is its body), for an upgrade action taken later from a screen the user stays on. Built 2026-09-09 as `showSubscribeSheet`; the headline, cards and bullets are the screen's own widgets, so only the chrome differs. It carries no skip beside the eyebrow — 'Skip for now' becomes a full-width `btn.text` under the CTA — and closes rather than navigating. Chrome comes from `sheet.bottom` and the theme's `bottomSheetTheme` (radius `sheetTop`, top hairline, 40x4 handle, `{surface@80%}` scrim), not the frame's own values: the fill keeps the warm `{authSurface}` so the two paywalls match, as the dial-code sheet already does. Dropped for want of a role, on top of the screen's list: the 20px backdrop blur, the smoked-glass gradient, the 32 top radius (the token is 24), the `{white@20%}` side rim and the three amber radial glows.

**Screens:** 433:1005 (Subscribe)

### `streakIntro` — Daily Streak intro
*pattern · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Root {surface}; image @0.5; 3 scrims (radial + 2 linear)
1. Content @ y452 P0/24/48/24 gap 19: [eyebrow {labelSmall} {textSecondary}; 'The Daily Ritual' {displayLarge} {Text-black/4xl}] gap 8; info card {surfaceCard} stroke {outline} r12 P14/16 gap 12 ({titleSmall} {primary300 → {goldDeep}} + pt4 Inter 12/19.2 {textMuted}); paragraph Inter 13/21.45 {textMuted}; btn.primary 'Start My Streak'

**Tokens**
- sidePadding: 24
- bottomPadding: 48

**Evidence:** `DailyStreaksIntroScreen#396:8688`

**Screens:** 396:8686 (Daily Streak Intro)

### `completionModal` — Weekly quest completion modal
*pattern · reusable · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Scrim {surface@90%} (bottom-aligned)
1. Sheet {surfaceCard} top hairline {outline} r24/24/0/0 P8/24/40/24 DS(0,-8,32,{black@50%}); handle 36×3 {outline} pt14
1. Icon row pt28 gap 16: box 64 r16 {surfaceCard} stroke {outline} icon 34 (trophy gold); column (dot 6 {success} + 'Quest Completed' {overline} {success}; 'Congratulations' {headlineMedium} {Text-bold/2xl})
1. Paragraph pt20 Inter 13/22.1 MIX3
1. Divider {surfaceRaised} pt20
1. Stat cards P20/0/24/0 gap 10: 158×78 {surfaceCard} stroke {outline} r12 P14 (eyebrow {overline}; +500 {numeralLg} {goldLight} + pts Inter 11 | Badge Unlocked / Cinematic Visionary {labelMedium} {Text-semibold/xs} {gold})
1. btn.primary 'Claim Reward'

**Tokens**
- radius: 24
- padding: 8/24/40/24

**Evidence:** `WeeklyCompletionModal#382:6799`

**Screens:** 382:6636 (WeeklyQuestProgressScreen)

### `successDrawer` — Success drawer (7-day ritual) — OFF-SYSTEM
*pattern · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Root 390×812 fill {white} + {surface}; bg image + {black@60%} blur 4
1. Backdrop {black@40%}; Drawer Shell 390×490 {surface@80%} bg-blur 32 top stroke {outline@30%} r24/24/0/0; handle 40×4 {outline} r9999 P12/24
1. Glowing badge @ (155,0): disc 80 {yellow} r9999 icon 32×36 {surface} + halo 80 {yellow@20%} layer-blur 64
1. Headline @ y104 {titleLarge} {white} DS(0,0,20,{yellow@40%}); body @ y140 {bodyMedium} {textSecondary@80%} centered
1. Bento row @ y210 gap 16: 2× 152×79 {surfaceRaised} stroke {outline@20%} r8 P8/0 center (REWARD Inter 10/15 +1 {textSecondary@70%}; +500 {numeralSm} {yellow} + Points Inter 10/18 {textSecondary@60%} | NEW STATUS; icon 15×14 {yellow} + Streak Master {caption} {Text-medium/xs} {white})
1. btn.primary 325×52 'Claim Reward' @ (33,313); btn.text dismiss 'CONTINUE WATCHING' @ y361

**Evidence:** `Successs state#404:9787`

**Notes**
- Frame is 390 wide (not 375), uses 9 hexes that appear nowhere else ({surface}, {surfaceRaised}, {outline}, {outline}, {textSecondary}, {textSecondary}, {white}, {yellow}, {surface}) and a 7th font family. Treat as a concept, not a spec.

**Screens:** 404:9787 (Successs state)

### `unlockOverlay` — Exclusive-content unlock overlay (Home)
*pattern · reusable · 4 screen(s) · 4 instance(s)*

**Anatomy**
1. Router: overlay Container 373×812 gradient unlockOverlay @0.81 over a Home copy (HomeScreen 375×747 + BottomNav B 375×64)
1. Header slot 373×83: tag.exclusive @ (16,56)
1. Center block 456 tall P0/0/8/0 center: lock disc 60 r30 {gold@10%} stroke 1.5 {gold@50%} icon 26 (17×23 {gold}) pb14; 'BTS Video' {headlineSmall} {white} pb6; gap 33; 'Unlocks for' Inter 12/18 {textSecondary} pb4 + '500 Points' {numeralMd} {goldLight} (MIX2)
1. Preview card P0/16/14/16: {surfaceCard} stroke {outline} r14 P14/16 (Preview eyebrow {labelSmall} {textMuted}; pt6 {bodySmall} {textSecondary}; divider pt12; Cast & Crew eyebrow pt10; pt5 {titleSmall} {gold})
1. btn.primary 333×52 'Unlock Now' @ (16,0) in 80-tall slot

**Variants**
- **confirm** — replaces preview card with ExclusiveUnlockSheet P0/20/32/20: {headlineSmall} title; pt8 {bodyMedium} {textSecondary} paragraph; pt20 row {surfaceRaised} r12 P14/16 SB (Point Deduction {overline} {textSecondary}; 500 POINTS {numeralMd} {goldLight}); btn.primary 'Confirm & Unlock'

**Evidence:** `Container#432:24117`, `ExclusiveUnlockSheet#432:24260`

**Notes**
- Built 2026-09-09 as a pushed screen off the exclusive library rather than an overlay: the Home copy the design dims behind it does not exist yet. When Home is built this becomes a transparent route over it and the scrim goes back on top.
- The overlay's own gradient is not in the gradient table; the frame's 0.81 dim is what the recorded `sheet.scrim` `{surface@80%}` amounts to.
- Revalidated 2026-09-10. The screen was painting that scrim as its own background, which composites 80% of `{surface}` over black and comes out *darker* than the app's surface, not lighter — the opposite of a dimmed image. With nothing behind it, it now paints plain `{surface}`.
- The exclusive tag was drawn as an outline with no fill and half the height: the frame fills it `{gold@20%}` and sets it 32 tall, which is 8 of vertical padding around the label, not 4. Its stroke is `tag.gold.border` `{gold@40%}`, the nearest kept alpha to the `{gold@50%}` the frame draws.
- 'Unlock Now' is a large `btn.primary`, so it carries `elevation.glow.cta`. It had none. That glow cannot go in the button theme — a Material elevation is not this shape — so it is a `DecoratedBox` around the button, as on the auth CTA. Three screens now do this; a shared gold-CTA widget is worth extracting.
- The frame's preview paragraph is `#B0BEC8`, a lighter grey than the `#8FA0B3` the palette keeps for `{textSecondary}`. Both fold to that one token, so the built card reads dimmer than the frame. Left as the token, since `{textSecondary}` is app-wide.
- The confirm variant is not built. Unlocking goes straight from this screen to Home, which is the flow the product asked for.

**Screens:** 432:24098 (Home (unlock overlay)), 92:4615 (Home (unlock overlay)), 432:24224 (Home (unlock confirm)), 92:4740 (Home (unlock confirm))

### `exclusiveLibrary` — Exclusive content library
*pattern · reusable · 2 screen(s) · 2 instance(s)*

**Anatomy**
1. appBar.back 'Exclusive Content'
1. chip.filter row P0/16/16/16 gap 8 (Recommended active + Horror/Thriller/New)
1. Grid 373 wide: 3 cols × 3 rows of 119×179 r12 tiles (x 4/127/250, y 0/183/365 → gap 4): image tile or locked tile {outline} with lock icon 24 (16×21 {textMuted})

**Tokens**
- tile: 119×179 r12
- gap: 4

**Evidence:** `ExclusiveLibraryScreen#429:23677`

**Notes**
- Grid has 4px outer inset instead of the app's 16 — likely unfinished.
- **Open question.** The frame's lock glyph is the warm `#9B8D6D`, which the hex map folds onto `{textMuted}` `#7A93AB`. That is a cool blue-grey, and against the navy tile the difference reads clearly. The warm muted tones the system kept all sit in the auth palette (`authTextMuted`), which does not belong on this screen. Left on `{textMuted}` pending a decision.
- Built 2026-09-09. The 4 inset is kept as drawn; only a locked tile is tappable, because the player an open one would start does not exist yet.
- Revalidated 2026-09-10. A locked tile was built on `surfaceRaised`, against the `{outline}` in the anatomy above; it is now `card.background.locked` and matches the frame exactly. The glyph is the filled padlock the frame draws, not an outlined one.
- The header's back disc sat 12 right of the margin and the title 28 right of the disc, where the frame leaves 12. An icon button lays out its 48 tap target around the 36 disc, so the leading padding now starts 6 short of the margin and the slot is sized on the target rather than a rounded-up 60; `titleSpacing` is zeroed because the slot already ends where the title starts.
- The frame's header runs 69 below the status bar against the app bar's 56, and a filter chip paints 32 while laying out 48. Both gaps around the chip row are set short of the frame's numbers to land on them: 4 above, 8 below.

**Screens:** 429:23676 (Exclusive content), 432:23967 (Exclusive content)

### `topUpSheet` — Top-up points sheet (pack picker + receipt)
*pattern · reusable · 2 screen(s) · 2 instance(s)*

**Anatomy**
1. `sheet.bottom` container over the auction, sized to its content (h395 of 812), P21 → screen padding 20
1. Top row 32 tall, pt21→20 pb12: sheetHandle centred (modal variant, `sheet.handleModal`) + close button level with it — a 32 disc `sheet.closeBackground` around a 10.5→12 glyph
1. Title {headlineSmall} {white} centred; subtitle pt3→4 {bodySmall} {textSecondary} centred; pb24
1. Pack row gap 10→12: 3 equal cards r20 P14→16 (unselected {surfaceCard} stroke {outline}; selected {surfaceRaised} stroke `tab.activeBorder` 2), each a disc 32 ({surfaceRaised}, selected {gold@10%}) + icon 16; value pt8 {titleMedium} {white}; 'POINTS' pt2 {labelSmall} ({textSecondary}, selected {gold}); divider pt12; price pt9→8 {titleSmall} {white}. pb24
1. `btn.primary` h50→52 r12 'Continue to Pay {price}' with a trailing 12 arrow

**Variants**
- **receipt** — replaces the picker with a 128 radial wash → `elevation.glow.cta`, an 80 ring {gold@10%} stroke {gold@30%}, a 56 disc filled `gradient.goldSegment` and a check 32 {surface}; 'Payment Successful' pt20 {headlineMedium} {white}; credited pill pt12 {gold@10%} stroke {gold@30%} r-pill with icon 16 {gold} + {titleSmall} {gold}; the action becomes 'Done'

**Evidence:** `OPTION 1 - Auction#760:1611`, `OPTION 1 - Auction#760:1948`

**Notes**
- Added to this catalogue on 2026-09-09, when it was built. The two frames sit outside the Visuals page the rest of the system was extracted from, so no entry existed; every value above is a kept token, and none was invented for it.
- The frames put a payment-method screen (`760:1240`) between the picker and the receipt. It is deliberately not built: a third-party gateway takes that step, so the sheet goes straight from the pack to the receipt.
- Both frames draw 'Continue to Pay ₹79' on the receipt's button, which is a copy oversight in the frame; the built receipt says 'Done', since the payment is finished by then.
- The sheet sizes to its content. `ContentContainer` cannot wrap it: its `Align` fills the height it is offered, and a scroll-controlled sheet is offered the whole screen, which stands the sheet full height instead of stopping under the CTA. The same trap catches anything inside it that centres: a bare `Center` around the loading spinner, and the `Center` inside `ErrorView`, each opened the sheet at the full screen and dropped it to a third of that when the packs landed.
- Revalidated 2026-09-10. The states before the packs now draw the real chrome — handle, close, title, subtitle — and hold both the pack row (155) and the CTA's slot open, so the sheet opens at the height it keeps and the packs drop in without moving anything. `AnimatedSize` covers the one height change left, from the picker to the receipt.
- The receipt stands its CTA further off than the picker does (the frame leaves 52 where the picker leaves 24), which keeps the two variants close to the same height. The scale stops at 32, so that is what it uses; the remaining slack is free space in a frame with no auto-layout.
- A pack is a selectable option, so it takes the `tab` roles for chosen and unchosen rather than a card's.
- **Open question.** These two frames introduce four hexes the extraction never saw: `#F5C518` (selected border, 'POINTS', the receipt's check disc and credited pill), `#1F242C` (selected card), `#21262D` (close disc) and `#2D333B` (handle, divider). The last three land on `surfaceRaised` and `outline` within a few units and are used as such. `#F5C518` does not: it is a saturated yellow, and the nearest kept token in use here, `{gold}` `#C9A24B`, reads visibly duller — `{yellow}` `#FFD700` is far closer. Changing it means either re-pointing `tab.activeBorder`, which is shared, or giving the pack card accent roles of its own. Left on `{gold}` pending that decision.

### `auctionScreen` — Live auction screen — ONE-OFF concept
*pattern · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Root 375×812 gradient auctionBg (free-form, no auto-layout)
1. Hero image 375×229 + scrim auctionHeroScrim; btn.icon.back (fill {authContainer}) @ (16,36); pill.points @ (244,40)
1. LIVE badge + '1,204 watching' {caption} {textSecondary} @ (16,149); eyebrow {labelSmall} {textSecondary} @ y195; title {headlineMedium} -1 {white}; desc {bodySmall} {textSecondary}; 'View More' Golos Bold 12 underline {gold}
1. Bid cards @ y341 gap 12: 2× 166×88 gradient auctionBidCard stroke {gold@30%} r12 P14/16 DS(0,4,16,{gold@10%}) (label {caption} {textSecondary} pb4; value {numeralLg} gradient {goldCta}→{goldLight}→{gold})
1. Bid History eyebrow {overline} {textSecondary}; rows gap 8: 343×59 r10 P10/12 gap 10 (top: {goldCta@10%} stroke {goldLight@20%} DS(0,4,16,{goldLight@10%}); others gradient {surfaceCard}→{surfaceCard} stroke {outline}): avatar 36 bg {pointsPillBg} + name {titleSmall} ({gold} top) / Golos SemiBold 13 + time {caption} {textMuted} + amount {numeralPill} ({goldLight} / {textSecondary})
1. Bid sheet 375×132 @ y680 gradient auctionBidSheet top stroke {gold@30%} r16/16/0/0 DS(0,-3,30,{gold@20%}) P0/0/0/16: input.bid 325×40 + btn.primary bid 85×39 gap 142; increments row 4× btn.outline bidIncrement

**Evidence:** `OPTION 1 - Auction#418:18052`

**Notes**
- Labelled 'OPTION 1' — exploratory. Mixed fonts (Golos), unique gradients, absolute positioning. Do not tokenize beyond what is shared (back button, points pill, LIVE badge).
- Built 2026-09-09 under the decisions-log rule that this screen's one-off hexes and gradients map onto kept tokens. The background is flat `{surface}` (all four of its stops map there). Golos becomes its DM Sans equivalent, and the title's -1 tracking is dropped because no text role carries tracking of its own.
- Revalidated 2026-09-10 against the frame. Three of the gradients were wrongly given up as having nowhere to land: every stop in the hero scrim, the bid-card wash and the bid-bar fill resolves to a kept token, so they are now `auctionHeroScrim`, `auctionBidCard` and `auctionBidBar` in the system. Substituting `heroScrim` for the first was the costliest of the three — it opens a clear band at 40% for a video to read through, which left the still bright behind the points pill and, because that pill's fill is translucent, turned the pill olive.
- The bid bar is laid out as a pinned footer rather than at an absolute y, and the bid field takes a hint so it has an accessible name the frame's bare box does not give it. The action sits inside the field's own border, as the frame draws it, rather than beside it.
- The still is pinned to its 229 with the copy running down over its lower half, which is how the frame stacks them: the LIVE row starts at y149, inside the image. Laying the still out as a block above the copy pushed everything a tenth of a screen down and squeezed the bid history to one row. That y149 is measured from the top of the screen and set as one: the frame draws no status bar, so stacking the copy under the top bar instead moved it by whatever inset the device happened to have — 22 points up on a 47-point bar.
- The frame's own y-offsets (LIVE 149, eyebrow 195, title 218, cards 341) are not reproducible on the spacing scale, and this screen is a one-off with no auto-layout, so the copy is set on the scale (LIVE→eyebrow 24, eyebrow→title 8, title→blurb 4, blurb→View More 16) and lands within a few points of each.
- The bid field is the frame's 40, not the input theme's 52: that height is the full-width form field's, and the theme applies it through a minimum the field has to clear explicitly. A quick-add paints the frame's 32 but lays out 48 to keep its tap target, so the gap above the row is set 8 short to read as the 12 the frame draws.
- View More is underlined, which the frame draws on this one control and nothing else on the screen. It expands the blurb, which is clamped to the two lines the frame draws. The frame's copy happens to fit in two, so an inert control would have looked broken for no reason.

**Screens:** 418:18052 (OPTION 1 - Auction)

### `splash` — Splash (placeholder only)
*pattern · one-off · 1 screen(s) · 1 instance(s)*

**Anatomy**
1. Frame 360×800 with gradient fill splashBg
1. Pasted screenshot 260×80 at (50,360) (logo)

**Tokens**
- background: gradient `splashBg` ({surface}@0 → {surfaceCard}@0.62 → {surfaceRaised}@1; the design's 12 stops ramp into gold past the viewport and never render)
- logo: `assets/images/splash-logo.png`, 260x80

**Evidence:** `OPTION 1 - Auction#36:5658`, `Screenshot#36:5659`

**Notes**
- Not a real design — a screenshot import. Splash needs to be designed; only the background gradient is usable.
- Implemented 2026-09-08 on the startup route: background gradient plus the supplied raster logo, centred and alone as the design draws it. The wordmark and tagline have no text roles; a vector logo and a real layout are still outstanding.

**Screens:** 36:5658 (OPTION 1 - Auction (splash screenshot))

## Component × screen matrix
| Screen | Components |
|---|---|
| `85:1662` Intro Screen 1 | `btn.primary`, `btn.text`, `btn.icon.back`, `tag.eyebrow`, `onboardingSlide` |
| `85:1733` Intro Screen 2 | `btn.primary`, `btn.text`, `btn.icon.back`, `tag.eyebrow`, `onboardingSlide` |
| `85:1803` Intro Screen 3 | `btn.primary`, `btn.text`, `btn.icon.back`, `tag.eyebrow`, `onboardingSlide` |
| `128:70` Sign In (Filled) | `btn.primary`, `btn.social`, `btn.icon.back`, `input.text`, `divider`, `authForm` |
| `129:179` Verify OTP (Filled) | `btn.primary`, `btn.text`, `btn.icon.back`, `input.otp`, `divider`, `authForm` |
| `130:410` User's name (Filled) | `btn.primary`, `btn.icon.back`, `input.text`, `divider`, `authForm` |
| `165:1931` Weekly Quest listing | `btn.primary`, `btn.secondary`, `btn.icon.back`, `badge.status`, `pill.pointsOverImage`, `chip.timeLeft`, `progress.linear`, `appBar.back`, `heroQuestCard`, `questListCard` |
| `378:4290` Weekly Quest listing | `btn.primary`, `btn.secondary`, `btn.icon.back`, `badge.status`, `pill.pointsOverImage`, `chip.timeLeft`, `progress.linear`, `appBar.back`, `heroQuestCard`, `questListCard` |
| `432:24030` Home (exclusive unlocked) | `btn.primary`, `btn.icon.actionRail`, `tag.genre`, `tag.exclusive`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `92:4525` Home (exclusive unlocked) | `btn.primary`, `btn.icon.actionRail`, `tag.genre`, `tag.exclusive`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `432:24098` Home (unlock overlay) | `btn.primary`, `btn.icon.actionRail`, `tag.genre`, `tag.exclusive`, `pill.points`, `divider`, `bottomNav`, `unlockOverlay` |
| `92:4615` Home (unlock overlay) | `btn.primary`, `btn.icon.actionRail`, `tag.genre`, `tag.exclusive`, `pill.points`, `divider`, `bottomNav`, `unlockOverlay` |
| `432:24224` Home (unlock confirm) | `btn.primary`, `btn.icon.actionRail`, `tag.genre`, `tag.exclusive`, `pill.points`, `bottomNav`, `unlockOverlay` |
| `92:4740` Home (unlock confirm) | `btn.primary`, `btn.icon.actionRail`, `tag.genre`, `tag.exclusive`, `pill.points`, `bottomNav`, `unlockOverlay` |
| `418:18836` Edit profile | `btn.primary`, `btn.icon.back`, `avatar`, `appBar.back`, `editProfileForm` |
| `420:20093` Refer a friend | `btn.primary`, `btn.outline`, `btn.icon.close`, `btn.icon.settings`, `avatar`, `sheetHandle`, `appBar.profile`, `sheet.bottom`, `statCard`, `profileScreen`, `menuRow`, `referSheet` |
| `433:1005` Subscribe | `btn.primary`, `checkDisc`, `subscribeScreen` |
| `396:8686` Daily Streak Intro | `btn.primary`, `streakIntro` |
| `382:6636` WeeklyQuestProgressScreen | `btn.primary`, `btn.text`, `badge.status`, `chip.counter`, `chip.timeLeft`, `progress.linear`, `progress.ring`, `divider`, `checkDisc`, `sheetHandle`, `actionCard`, `progressSummaryCard`, `completionModal` |
| `404:9787` Successs state | `btn.primary`, `btn.text`, `sheetHandle`, `successDrawer` |
| `379:4980377:3922`  | `btn.primary` |
| `406:9862` Prediction Game listing | `btn.tonal`, `btn.icon.back`, `badge.status`, `pill.pointsOverImage`, `pill.multiplier`, `progress.linear`, `appBar.back`, `predictionCard` |
| `408:10663` Prediction game | `btn.tonal`, `btn.icon.back`, `predictionDetail` |
| `418:18052` OPTION 1 - Auction | `btn.outline`, `btn.text`, `btn.icon.back`, `badge.status`, `pill.points`, `avatar`, `auctionScreen` |
| `760:1611` Auction (top up points) | `btn.primary`, `btn.icon.close`, `sheet.bottom`, `divider`, `auctionScreen`, `topUpSheet` |
| `760:1948` Auction (payment successful) | `btn.primary`, `btn.icon.close`, `sheet.bottom`, `auctionScreen`, `topUpSheet` |
| `97:5251` Sign In | `btn.social`, `btn.icon.back`, `input.text`, `divider`, `authForm` |
| `429:23362` Router (Profile) | `btn.text`, `btn.icon.settings`, `avatar`, `appBar.profile`, `bottomNav`, `statCard`, `profileScreen`, `menuRow` |
| `427:20440` Profile | `btn.text`, `btn.icon.settings`, `avatar`, `appBar.profile`, `bottomNav`, `statCard`, `profileScreen`, `menuRow` |
| `429:21182` Profile | `btn.text`, `btn.icon.settings`, `avatar`, `appBar.profile`, `bottomNav`, `statCard`, `profileScreen`, `menuRow` |
| `429:22118` Profile | `btn.text`, `btn.icon.settings`, `avatar`, `appBar.profile`, `bottomNav`, `statCard`, `profileScreen`, `menuRow` |
| `429:22828` Profile | `btn.text`, `btn.icon.settings`, `avatar`, `appBar.profile`, `bottomNav`, `statCard`, `profileScreen`, `menuRow` |
| `429:21072` Profile | `btn.text`, `btn.icon.settings`, `avatar`, `appBar.profile`, `bottomNav`, `statCard`, `profileScreen`, `menuRow` |
| `433:781` Profile | `btn.text`, `btn.icon.settings`, `avatar`, `appBar.profile`, `bottomNav`, `statCard`, `profileScreen`, `menuRow` |
| `35:4491` Video details | `btn.text`, `btn.icon.close`, `btn.icon.actionRail`, `tag.genre`, `pill.points`, `avatar`, `sheetHandle`, `appBar.overVideo`, `videoOverlay`, `sheet.bottom` |
| `30:3890` Video comments | `btn.text`, `btn.icon.close`, `btn.icon.actionRail`, `tag.genre`, `pill.points`, `avatar`, `sheetHandle`, `appBar.overVideo`, `videoOverlay`, `sheet.bottom`, `commentCard` |
| `129:125` Verify OTP | `btn.text`, `btn.icon.back`, `input.otp`, `divider`, `authForm` |
| `132:651` User's name | `btn.icon.back`, `input.text`, `divider`, `authForm` |
| `377:3922` Weekly quest track progress | `btn.icon.back`, `badge.status`, `chip.counter`, `progress.linear`, `progress.ring`, `divider`, `checkDisc`, `appBar.back`, `actionCard`, `progressSummaryCard` |
| `429:23676` Exclusive content | `btn.icon.back`, `chip.filter`, `appBar.back`, `exclusiveLibrary` |
| `432:23967` Exclusive content | `btn.icon.back`, `chip.filter`, `appBar.back`, `exclusiveLibrary` |
| `486:1739` My earns & rewards | `btn.icon.back`, `segmented`, `progress.linear`, `divider`, `appBar.back`, `bottomNav`, `earnRow` |
| `429:21290` My earns & rewards | `btn.icon.back`, `segmented`, `progress.linear`, `divider`, `appBar.back`, `bottomNav`, `earnRow` |
| `486:1868` My earns & rewards | `btn.icon.back`, `segmented`, `progress.linear`, `divider`, `appBar.back`, `bottomNav`, `earnRow` |
| `486:1997` My earns & rewards | `btn.icon.back`, `segmented`, `progress.linear`, `divider`, `appBar.back`, `bottomNav`, `earnRow` |
| `416:15593` Daily streaks rewards | `btn.icon.back`, `badge.level`, `chip.legend`, `appBar.back`, `activityRow`, `summaryHeader` |
| `429:21790` Rewards / Live auction | `btn.icon.back`, `badge.status`, `chip.badgeEarned`, `divider`, `appBar.back`, `summaryHeader`, `winCard` |
| `429:22526` Rewards / Prediction Games | `btn.icon.back`, `badge.status`, `chip.badgeEarned`, `divider`, `appBar.back`, `summaryHeader`, `predictionHistoryCard` |
| `429:23212` Weekly Quest Rewards | `btn.icon.back`, `badge.status`, `chip.badgeEarned`, `divider`, `appBar.back`, `summaryHeader`, `questHistoryCard` |
| `397:9099` Daily Streak | `btn.icon.back`, `chip.badgeEarned`, `progress.linear`, `progress.steps`, `appBar.back`, `streakLevelCard`, `levelTrack`, `miniStatCard`, `sessionCard`, `streakCalendar`, `badgeTile`, `badgeUnlockRow` |
| `379:4980` Completed weekly quest details | `btn.icon.back`, `badge.status`, `checkDisc`, `miniStatCard` |
| `376:3272` P2P | `btn.icon.back`, `tag.category`, `progress.linear`, `divider`, `bottomNav`, `statRowCard`, `gameCard` |
| `384:7013` P2P | `btn.icon.back`, `tag.category`, `progress.linear`, `divider`, `bottomNav`, `statRowCard`, `gameCard` |
| `407:10456` P2P | `btn.icon.back`, `tag.category`, `progress.linear`, `divider`, `bottomNav`, `statRowCard`, `gameCard` |
| `378:4464` P2P | `btn.icon.back`, `tag.category`, `progress.linear`, `divider`, `bottomNav`, `statRowCard`, `gameCard` |
| `429:20692` Rewards | `btn.icon.back`, `tag.category`, `progress.linear`, `divider`, `bottomNav`, `gameCard`, `pointsHeader` |
| `429:23472` Rewards | `btn.icon.back`, `tag.category`, `progress.linear`, `divider`, `bottomNav`, `gameCard`, `pointsHeader` |
| `432:23866` Rewards | `btn.icon.back`, `tag.category`, `progress.linear`, `divider`, `bottomNav`, `gameCard`, `pointsHeader` |
| `25:2950` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `26:3104` Home (Liked Video) | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `28:3202` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `29:3649` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `30:3803` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `376:2650` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `384:6948` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `407:10391` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `388:8310` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `381:5991` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `378:4399` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `92:4859` Home | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `appBar.overVideo`, `bottomNav`, `videoOverlay` |
| `36:4835` Share video | `btn.icon.actionRail`, `tag.genre`, `pill.points`, `sheetHandle`, `appBar.overVideo`, `videoOverlay`, `sheet.bottom` |
| `414:12370` Badges / Earned | `segmented`, `tab.pill`, `progress.linear`, `bottomNav`, `badgeTile`, `currentBadgeCard`, `pointsHeader` |
| `414:12502` Badges / Locked | `segmented`, `tab.pill`, `progress.linear`, `bottomNav`, `badgeTile`, `currentBadgeCard`, `pointsHeader` |
| `36:5658` OPTION 1 - Auction (splash screenshot) | `splash` |

## Build order (by reuse)

1. **1 tokens** — ThemeData: ColorScheme (semantic.json) + TextTheme (typography.json) + spacing/radius/elevation constants (layout.json)
2. **2 primitives (by reuse)** — icon (1214) → btn.icon.actionRail (96) → menuRow (48) → tag.genre (42) → btn.icon.back (41) → progress.linear (39) → badge.status (36) → pill.points (27) → btn.primary (24) → statCard (24) → divider (24) → tag.category (21) → btn.text (20) → avatar (19) → badge.level (15) → checkDisc (14) → input.text (8) → input.otp (8) → chip.filter (8) → chip.counter (8) → chip.badgeEarned (8) → segmented (6) → tag.eyebrow (6) → tag.exclusive (6) → sheetHandle (6) → pill.pointsOverImage (5) → btn.outline (5) → btn.social (4) → btn.tonal (4) → tab.pill (4) → btn.icon.close (3) → chip.timeLeft (3) → chip.legend (3) → pill.multiplier (3) → progress.ring (2) → progress.steps (1)
3. **3 composites (by reuse)** — bottomNav (38) → appBar.overVideo (22) → videoOverlay (22) → gameCard (21) → appBar.back (18) → earnRow (16) → activityRow (15) → badgeTile (15) → appBar.profile (8) → profileScreen (8) → actionCard (8) → questListCard (6) → miniStatCard (6) → pointsHeader (5) → questHistoryCard (5) → sheet.bottom (4) → statRowCard (4) → summaryHeader (4) → winCard (4) → unlockOverlay (4) → commentCard (3) → predictionCard (3) → predictionHistoryCard (3) → badgeUnlockRow (3) → heroQuestCard (2) → progressSummaryCard (2) → currentBadgeCard (2) → exclusiveLibrary (2)
4. **4 patterns / one-offs** — onboardingSlide (6) → authForm (6) → completionModal → streakLevelCard, levelTrack, sessionCard, streakCalendar (Daily Streak) → predictionDetail → editProfileForm → referSheet → subscribeScreen → streakIntro → splash → (defer) auctionScreen, successDrawer