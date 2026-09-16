# Matinee consumer app — Design system (final tokens)

> Source: Figma `vVGHTFgrIRYQBTZaRZCYe0`, page **Visuals** (`3:1066`, 71 frames) only. Dark-only app. Units: Flutter logical px. Colour syntax: `{primitive}` or `{primitive@NN%}` (opacity applied to a primitive — there are no extra hexes); `gradient.<name>`. Machine-readable twin: `design-system.json`. Extracted values were simplified on 2026-09-03 per the decisions log at the end.

## 1. Colour primitives (29)
| Token | Hex | Meaning | Evidence |
|---|---|---|---|
| `surface` | `#0C0F16` | Screen background; also ink on gold (onPrimary) | HomeScreen#25:2953, RewardsSubscribedScreen#414:12372 |
| `surfaceCard` | `#13171F` | Cards, sheets, modals, stat tiles | Container#429:23379, Container#36:4942, Container#382:6800 |
| `surfaceRaised` | `#1A1F2B` | Raised rows, inactive chips, genre tags, app inputs, tracks | Container#429:23395, Button#429:23705, Text#118:8 |
| `surfaceRow` | `#111B27` | Quest-row fill, top stop — cooler than `surfaceCard` | Container#165:1974, Container#165:2004 |
| `surfaceRowDeep` | `#0F1820` | Quest-row fill, bottom stop | Container#165:1974, Container#165:2004 |
| `outline` | `#1F2535` | All 1px borders, dividers, progress tracks | Container#376:3337, Container#376:3315 |
| `navBar` | `#0D1C25` | Bottom-nav background (client-approved library Nav Bar) | Nav Bar#376:3608 |
| `navBarOutline` | `#112532` | Bottom-nav top hairline | Nav Bar#376:3608 stroke |
| `navInactive` | `#67899E` | Bottom-nav inactive icon + label | P2P#I376:3608;11699:378 |
| `pointsPillBg` | `#0F2D44` | Points-pill background (used @70%) and bidder avatar bg | Background+Border#25:3071 |
| `authSurface` | `#0D0B08` | Auth/onboarding screen background | Container#97:5253, OnboardingScreen#85:1664 |
| `authContainer` | `#141008` | Auth inputs, social buttons, back-button disc | Phone Input#97:5277, Button#97:5287, Button#418:18055 |
| `authOutline` | `#2A2018` | Auth borders and dividers | Button#97:5287 stroke, Container#97:5282 |
| `white` | `#FFFFFF` | Primary text, primary icons | Neon Noir#118:4 |
| `textSecondary` | `#8FA0B3` | Secondary text (body meta, chip labels, inactive filter) | Apex Films#118:7 |
| `textMuted` | `#7A93AB` | Captions, eyebrows, sheet handle, row chevrons | Rank#376:3282, Vector#429:23408 |
| `textDisabled` | `#4A5568` | Disabled / locked text and icons | Cinematic Loyalist#414:12561 |
| `authTextSecondary` | `#A8998A` | Auth/onboarding secondary text and field labels | Phone Number#97:5269 |
| `authTextMuted` | `#7A6A58` | Onboarding stat captions, 'or continue with' | earnable per day#85:1760 |
| `gold` | `#C9A24B` | Brand gold: icons, links, labels, active chip fill, tints (primary role) | Icon#25:3073, Button#429:23703 |
| `goldCta` | `#FFDC78` | CTA fill, small button fill, nav indicator | Button#85:1708, Button#429:23401 |
| `goldLight` | `#E6CB86` | Numerals / points, tag text over images | 2,691#486:1773, QUEST#376:3346 |
| `goldDeep` | `#B99C48` | Bottom-nav active icon + label (client-approved) | HOME#I376:3608;11699:305 |
| `goldLevel1` | `#A8874A` | Level-1 streak tint (calendar, LV1 badge) | LV 1#416:15833 |
| `yellow` | `#FFD700` | Streak/level accent, warning, YES vote | 2/7#397:9127, LV 2#416:15663 |
| `success` | `#2ECC71` | Done / claimed / won / correct | +12 wk#376:3290, CLAIMED#429:23264 |
| `error` | `#EB5757` | Destructive (logout), incorrect, NO | Logout#429:23433, INCORRECT#429:22624 |
| `errorDeep` | `#C43A3A` | Solid red carrying white text: the LIVE badge | derived from `error` for contrast |
| `black` | `#000000` | Shadow base only | Container#35:4628 shadow |

Brand constants (third-party, not theme tokens): whatsapp `#25D366`, telegram `#0088CC`, instagram `#E1306C`, messages `#34B7F1`, twitter `#1DA1F2`, googleBlue `#4285F4`, googleGreen `#34A853`, googleYellow `#FBBC05`, googleRed `#EA4335`

### Alpha scale
Opacity is applied to primitives, never new hexes. Design alphas were snapped to the nearest 10%. Levels: 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90%.

| Convention | Value |
|---|---|
| tint fill | 10% (subtle) / 20% (over images) |
| tint border | 30% / 40% (over images) |
| disabled fill | 30% |
| disabled label | 50% |
| glow | 40% CTA / 20% focus / 50% nav indicator |
| scrim | 80% |
| placeholder text | 50% |
| text on image | 60% |
| hairline on image | 10% |

## 2. Flutter `ColorScheme` (dark)
Dark-only. Roles not listed here (surfaceDim/Bright, inverse*, info, fixed/dim variants) come from ColorScheme.fromSeed(seedColor: gold, brightness: dark) and get overridden as the product matures. Auth/onboarding uses a scoped warm palette (auth.*), not a second ColorScheme.

| Role | Token |
|---|---|
| `brightness` | `dark` |
| `seedColor` | `{gold}` |
| `primary` | `{goldCta}` |
| `onPrimary` | `{surface}` |
| `primaryContainer` | `{gold@10%}` |
| `onPrimaryContainer` | `{gold}` |
| `secondary` | `{gold}` |
| `onSecondary` | `{surface}` |
| `secondaryContainer` | `{surfaceRaised}` |
| `onSecondaryContainer` | `{textSecondary}` |
| `tertiary` | `{yellow}` |
| `onTertiary` | `{surface}` |
| `tertiaryContainer` | `{yellow@10%}` |
| `onTertiaryContainer` | `{yellow}` |
| `error` | `{error}` |
| `onError` | `{white}` |
| `errorContainer` | `{error@10%}` |
| `onErrorContainer` | `{error}` |
| `surface` | `{surface}` |
| `onSurface` | `{white}` |
| `onSurfaceVariant` | `{textSecondary}` |
| `surfaceContainerLow` | `{surface}` |
| `surfaceContainer` | `{surfaceCard}` |
| `surfaceContainerHigh` | `{surfaceRaised}` |
| `surfaceContainerHighest` | `{surfaceRaised}` |
| `outline` | `{outline}` |
| `outlineVariant` | `{outline}` |
| `scrim` | `{surface@80%}` |
| `shadow` | `{black}` |
| `surfaceTint` | `{gold}` |

## 3. App roles
| Role | Token |
|---|---|
| `text.primary` | `{white}` |
| `text.secondary` | `{textSecondary}` |
| `text.muted` | `{textMuted}` |
| `text.disabled` | `{textDisabled}` — inactive controls only; 2.0-2.6:1 on every surface, so never for content |
| `text.inverse` | `{surface}` |
| `text.link` | `{gold}` |
| `text.numeral` | `{goldLight}` |
| `text.numeralGradient` | `gradient.goldNumeral` |
| `text.onImageSubtitle` | `{white@60%}` |
| `text.success` | `{success}` |
| `text.warning` | `{yellow}` |
| `text.error` | `{error}` |
| `icon.primary` | `{white}` |
| `icon.secondary` | `{textSecondary}` |
| `icon.muted` | `{textMuted}` |
| `icon.accent` | `{gold}` |
| `icon.disabled` | `{textDisabled}` |
| `appBar.background` | `{surface}` |
| `appBar.title` | `{white}` |
| `appBar.backButton.background` | `{authContainer}` |
| `appBar.backButton.border` | `{authOutline}` |
| `appBar.backButton.icon` | `{gold}` |
| `bottomNav.background` | `{navBar}` |
| `bottomNav.border` | `{navBarOutline}` |
| `bottomNav.active` | `{goldDeep}` |
| `bottomNav.inactive` | `{navInactive}` |
| `bottomNav.indicator` | `{goldCta}` |
| `bottomNav.indicatorGlow` | `{goldCta@50%}` |
| `card.background` | `{surfaceCard}` |
| `card.border` | `{outline}` |
| `card.border.highlight` | `{gold@30%}` |
| `card.border.success` | `{success@30%}` |
| `card.background.raised` | `{surfaceRaised}` |
| `card.background.goldTint` | `{gold@10%}` |
| `card.background.highlight` | `gradient.highlightCard` |
| `card.background.locked` | `{outline}` |
| `card.imageHairline` | `{white@10%}` |
| `button.primary.background` | `{goldCta}` |
| `button.primary.label` | `{surface}` |
| `button.primary.glow` | `{gold@40%}` |
| `button.primary.disabled.background` | `{gold@30%}` |
| `button.primary.disabled.label` | `{gold@50%}` |
| `button.secondary.background` | `{surfaceRaised}` |
| `button.secondary.border` | `{outline}` |
| `button.secondary.label` | `{textSecondary}` |
| `button.tonal.background` | `{surfaceRaised}` |
| `button.tonal.border` | `{gold@10%}` |
| `button.tonal.label` | `{gold}` |
| `button.outline.border` | `{gold@30%}` |
| `button.outline.label` | `{goldLight}` |
| `button.outlineGold.background` | `{gold@10%}` |
| `button.outlineGold.border` | `{gold}` |
| `button.outlineGold.label` | `{gold}` |
| `button.social.background` | `{authContainer}` |
| `button.social.border` | `{authOutline}` |
| `button.social.label` | `{white}` |
| `button.text.label` | `{gold}` |
| `button.destructive.label` | `{error}` |
| `chip.filter.active.background` | `{gold}` |
| `chip.filter.active.label` | `{surface}` |
| `chip.filter.inactive.background` | `{surfaceRaised}` |
| `chip.filter.inactive.label` | `{textSecondary}` |
| `tag.genre.background` | `{surfaceRaised}` |
| `tag.genre.border` | `{outline}` |
| `tag.genre.label` | `{textSecondary}` |
| `tag.gold.background` | `{gold@20%}` |
| `tag.gold.border` | `{gold@40%}` |
| `tag.gold.label` | `{goldLight}` |
| `tag.goldSubtle.background` | `{gold@10%}` |
| `tag.goldSubtle.border` | `{gold@30%}` |
| `tag.goldSubtle.label` | `{gold}` |
| `badge.success.background` | `{success@10%}` |
| `badge.success.border` | `{success@30%}` |
| `badge.success.label` | `{success}` |
| `badge.error.background` | `{error@10%}` |
| `badge.error.border` | `{error@30%}` |
| `badge.error.label` | `{error}` |
| `badge.level2.background` | `{yellow@10%}` |
| `badge.level2.border` | `{yellow@30%}` |
| `badge.level2.label` | `{yellow}` |
| `badge.level1.background` | `{goldLevel1@10%}` |
| `badge.level1.border` | `{goldLevel1@30%}` |
| `badge.level1.label` | `{goldLevel1}` |
| `badge.neutral.background` | `{white@10%}` |
| `badge.neutral.border` | `{white@10%}` |
| `badge.neutral.label` | `{white@60%}` |
| `badge.live.background` | `{errorDeep}` |
| `badge.live.label` | `{white}` |
| `badge.discGradient` | `gradient.goldDisc` |
| `pill.points.background` | `{pointsPillBg@70%}` |
| `pill.points.border` | `gradient.pointsPillStroke` |
| `pill.points.icon` | `{gold}` |
| `pill.points.value` | `{white}` |
| `pill.overImage.background` | `{surface@70%}` |
| `pill.overImage.border` | `{gold@40%}` |
| `pill.overImage.label` | `{goldLight}` |
| `segmented.track.background` | `{surface}` |
| `segmented.track.border` | `{outline}` |
| `segmented.active.background` | `gradient.goldSegment` |
| `segmented.active.label` | `{surface}` |
| `segmented.inactive.label` | `{textMuted}` |
| `tab.active.border` | `{gold}` |
| `tab.active.label` | `{gold}` |
| `tab.inactive.background` | `{surfaceCard}` |
| `tab.inactive.border` | `{outline}` |
| `tab.inactive.label` | `{textMuted}` |
| `input.background` | `{surfaceRaised}` |
| `input.border` | `transparent` |
| `input.text` | `{white}` |
| `input.placeholder` | `{white@50%}` |
| `input.label` | `{textSecondary}` |
| `input.focus.border` | `{gold@30%}` |
| `input.focus.glow` | `{gold@20%}` |
| `input.error.border` | `{error}` |
| `input.error.glow` | `{error@20%}` |
| `auth.surface` | `{authSurface}` |
| `auth.surfaceContainer` | `{authContainer}` |
| `auth.outline` | `{authOutline}` |
| `auth.onSurface` | `{white}` |
| `auth.onSurfaceVariant` | `{authTextSecondary}` |
| `auth.onSurfaceMuted` | `{authTextMuted}` |
| `auth.input.background` | `{authContainer}` |
| `auth.input.border` | `{authOutline}` |
| `auth.input.placeholder` | `{white@50%}` |
| `auth.input.label` | `{authTextSecondary}` |
| `auth.otp.digit` | `{goldLight}` |
| `onboarding.statTile.background` | `{white@10%}` |
| `onboarding.statTile.border` | `{white@10%}` |
| `onboarding.statTile.label` | `{white@80%}` |
| `onboarding.statPill.background` | `{gold@10%}` |
| `onboarding.statPill.value` | `{goldLight}` |
| `onboarding.statPill.caption` | `{authTextSecondary}` |
| `progress.track` | `{outline}` |
| `progress.track.raised` | `{surfaceRaised}` |
| `progress.fill` | `gradient.progressGold` |
| `progress.fill.soft` | `gradient.progressGoldSoft` |
| `progress.fill.success` | `{success}` |
| `progress.fill.warning` | `{yellow}` |
| `divider` | `{outline}` |
| `divider.auth` | `{authOutline}` |
| `avatar.ring` | `{gold@30%}` |
| `avatar.ring.emphasis` | `{gold}` |
| `avatar.background` | `{pointsPillBg}` |
| `sheet.background` | `{surfaceCard}` |
| `sheet.border` | `{outline}` |
| `sheet.handle` | `{textMuted}` |
| `sheet.handleModal` | `{outline}` |
| `sheet.closeBackground` | `{surfaceRaised@60%}` |
| `sheet.shadow` | `{black@60%}` |
| `sheet.scrim` | `{surface@80%}` |
| `overlay.hero` | `gradient.heroScrim` |
| `overlay.topBar` | `gradient.topBarScrim` |
| `overlay.gameCard` | `gradient.gameCardScrim` |
| `overlay.gameCardBottom` | `gradient.gameCardScrimBottom` |
| `overlay.questCard` | `gradient.questCardScrim` |
| `overlay.predictionCard` | `gradient.predictionCardScrim` |
| `overlay.onboarding` | `gradient.onboardingScrim` |
| `overlay.imageDim` | `opacity 0.30 (onboarding bg) / 0.50 (streak intro bg) / 0.40 (claimed quest still)` |
| `status.success` | `{success}` |
| `status.warning` | `{yellow}` |
| `status.error` | `{error}` |
| `status.live` | `{error}` |
| `status.liveDot` | `{success}` |
| `status.info` | `seed-derived (not used in design)` |
| `voteBar.yes` | `{success}` |
| `voteBar.no` | `{error}` |
| `calendar.day.level1` | `{goldLevel1}` |
| `calendar.day.level2` | `gradient.progressGold` |
| `calendar.day.future` | `transparent` |
| `calendar.day.today` | `{gold@10%} + border {gold@40%}` |

## 4. Gradients (18)
| Name | Type | Stops | Use | Evidence |
|---|---|---|---|---|
| `heroScrim` | linear top→bottom | `{goldCta@10%}`@0, `{surface@30%}`@0.2, `{surface@0%}`@0.4, `{surface@40%}`@0.6, `{surface@85%}`@0.85, `{surface}`@1 | over full-bleed video/poster on Home | Container#25:2956 |
| `topBarScrim` | linear top→bottom | `{surface}`@0, `{surface@50%}`@0.52, `{surface@0%}`@1 | behind the over-video top bar (95dp) | Container#25:2957 |
| `questCardScrim` | linear top→bottom | `{surface@20%}`@0, `{surface@80%}`@1 | over a quest card's still — washes the top so the pills laid on it hold their contrast, where `gameCardScrimBottom` clears the top half entirely | Container#165:1965 (design end 75% snapped to 80%) |
| `gameCardScrim` / `gameCardScrimBottom` | linear, two layers: `gameCardScrim` left→right, `gameCardScrimBottom` bottom→top | `{surface@90%}`@0.3, `{surface@25%}`@1 + layer 2: `{surface@60%}`@0, `{surface@0%}`@0.5 | over game/reward card images | Container#376:3339 + #376:3340 |
| `predictionCardScrim` | linear top→bottom | `{surface@40%}`@0, `{surface@90%}`@1 | over a prediction card's still, which carries the title on the image itself | Container#406:9889 (design 35%→92%, snapped) |
| `questRowCard` | linear top→bottom | `{surfaceRow}`@0, `{surfaceRowDeep}`@1 | fill of a quest row in the all-quests list, every state | Container#165:1974, #165:1989, #165:2004 (design 160.6°; on a 341×129 card corner-to-corner would read as a lean, so it is taken vertically) |
| `onboardingScrim` | linear + radial vignette  | `{authSurface@30%}`@0, `{authSurface@50%}`@0.33, `{authSurface}`@0.56 + radial: `{authSurface@0%}`@0.4, `{authSurface@70%}`@1 | onboarding background | Container#85:1667, #85:1668 |
| `progressGold` | linear left→right | `{gold}`@0, `{yellow}`@1 | progress fills, level-2 calendar tiles, nav indicator variant | Container#165:1959 |
| `goldSegment` | linear  | `{goldLight}`@0, `{gold}`@1 | segmented-control active item, badge discs, gradient CTA variant | Button#414:12380 |
| `goldDisc` | linear top-left→bottom-right | `{gold}`@0, `{goldLight}`@1 | badge disc on the current-badge card — `goldSegment` reversed, light falling bottom-right | Container#414:12402 (design 135°) |
| `progressGoldSoft` | linear left→right | `{gold@60%}`@0, `{goldLight@90%}`@1 | My Earns row progress bars, held under `progressGold` so a stack of them reads as a set | Container#486:1778 |
| `highlightCard` | linear top-left→bottom-right | `{gold@14%}`@0, `{gold@4%}`@1 | wash behind a card the design singles out (current badge) | Container#414:12401 (design 162.9°; the only stops in the system off the 10% alpha grid — snapping them to `a10`→`a0` washed the card out against the frame, so the design's pair is kept) |
| `pointsPillStroke` | linear top→bottom | `{goldCta}`@0, `{goldLevel1}`@1 | 1px stroke of the points pill (design: #FFD067→#635025; approximated to kept tokens) | Background+Border#25:3071 |
| `goldNumeral` | linear  | `{yellow}`@0, `{gold}`@1 | hero total-points numeral text fill; reached through the `text.numeralGradient` role | 7,082#429:20868 |
| `auctionHeroScrim` | linear top→bottom | `{surface@20%}`@0.02, `{surface@50%}`@0.44, `{surface@85%}`@0.69, `{surface}`@0.98 | over the auction still — darkens throughout, where `heroScrim` clears a band for video | Container#418:18054 (first stop 15% snapped to 20%) |
| `auctionBidCard` | linear top-left→bottom-right | `{goldLight@10%}`@0, `{surfaceRaised@70%}`@0.4, `{surfaceCard@90%}`@0.5, `{surfaceCard}`@1 | fill of the auction's two bid cards | Container#418:18079 (design runs it at 152°; corner to corner is the nearest angle expressible without a per-card alignment) |
| `auctionBidBar` | linear top→bottom, running to 210% of the box | `{surfaceCard}`@0, `{surfaceRaised@60%}`@1 | fill of the auction's pinned bid bar | Container#418:18131 (design end `#423F36@56%`; the warm tone normalises to `surfaceRaised`, so the bar lightens where the design also warms) |
| `headerFade` | linear top→bottom | `{surfaceCard}`@0, `{surface}`@1 | P2P/Rewards/Badges header block background, painted from the screen top | Container#414:12373, Container#429:20695 (both warm-start #131008 frames → normalised) |
| `splashBg` | linear top→bottom | `{surface}`@0, `{surfaceCard}`@0.62, `{surfaceRaised}`@1 | splash screen background (design: 12 stops #0C0E16→#F6D471 running to 467%; only the first fifth renders inside an 800dp frame, so the visible band is normalised onto the surface tokens) | Frame#36:5658 |

### Design hex → token map
`#0C0F16`→`surface`, `#0C0E16`→`surface`, `#0A1119`→`surface`, `#0A0E14`→`surface`, `#131008`→`surface`, `#0D0E10`→`surface`, `#080B10`→`surface`, `#101419`→`surface`, `#241A00`→`surface`, `#162D29`→`surface`, `#0E141E`→`surface`, `#0F1419`→`surface`, `#0F1117`→`surfaceCard`, `#101923`→`surfaceCard`, `#13171F`→`surfaceCard`, `#13161E`→`surfaceCard`, `#111B27`→`surfaceRow`, `#0F1820`→`surfaceRowDeep`, `#111A24`→`surfaceCard`, `#14171F`→`surfaceCard`, `#1A1F2B`→`surfaceRaised`, `#292828`→`surfaceRaised`, `#161920`→`surfaceRaised`, `#181C21`→`surfaceRaised`, `#3C3E3A`→`surfaceRaised`, `#423F36`→`surfaceRaised`, `#1E252B`→`surfaceRaised`, `#282D2E`→`surfaceRaised`, `#313432`→`surfaceRaised`, `#1F2535`→`outline`, `#232938`→`outline`, `#2A3040`→`outline`, `#1C2A38`→`outline`, `#31353B`→`outline`, `#4D4634`→`outline`, `#3D3D3D`→`outline`, `#3A4050`→`textDisabled`, `#4A5568`→`textDisabled`, `#0F2D44`→`pointsPillBg`, `#0D1C25`→`navBar`, `#112532`→`navBarOutline`, `#67899E`→`navInactive`, `#FFFFFF`→`white`, `#FEFEFF`→`white`, `#C8D4E0`→`white`, `#FFF5E1`→`white`, `#8FA0B3`→`textSecondary`, `#B0BEC8`→`textSecondary`, `#A3B1C1`→`textSecondary`, `#8A9AB0`→`textSecondary`, `#D0C6AE`→`textSecondary`, `#C6C6C9`→`textSecondary`, `#CACACA`→`textSecondary`, `#7A93AB`→`textMuted`, `#848F99`→`textMuted`, `#9B8D6D`→`textMuted`, `#0D0B08`→`authSurface`, `#141008`→`authContainer`, `#1D170C`→`authContainer`, `#3F392C`→`authContainer`, `#2A2018`→`authOutline`, `#5D5032`→`authOutline`, `#514730`→`gold@30`, `#4C3B16`→`gold`, `#A8998A`→`authTextSecondary`, `#9A8878`→`authTextSecondary`, `#A0907E`→`authTextSecondary`, `#7A6A58`→`authTextMuted`, `#867159`→`authTextMuted`, `#C9A24B`→`gold`, `#D2AE5D`→`gold`, `#BF9A49`→`gold`, `#997D3D`→`gold`, `#957B30`→`gold`, `#D8B76A`→`gold`, `#DAB96D`→`gold`, `#564D33`→`gold`, `#7B6C41`→`gold`, `#95824B`→`gold`, `#B69E58`→`gold`, `#D6B964`→`gold`, `#F6D471`→`goldLight`, `#99823D`→`goldDeep`, `#B99C48`→`goldDeep`, `#FFDC78`→`goldCta`, `#FFD966`→`goldCta`, `#FFD067`→`goldCta`, `#E6CB86`→`goldLight`, `#FFD700`→`yellow`, `#FFD54F`→`yellow`, `#F2CA14`→`yellow`, `#A8874A`→`goldLevel1`, `#8B6914`→`goldLevel1`, `#635025`→`goldLevel1`, `#2ECC71`→`success`, `#6FCF97`→`success`, `#3D8C5F`→`success`, `#1B4D38`→`success@30`, `#FF4444`→`error`, `#EB5757`→`error`, `#E05252`→`error`, `#FF3333`→`error`, `#7A3030`→`error`, `#000000`→`black`, `#25D366`→`brand.whatsapp`, `#0088CC`→`brand.telegram`, `#E1306C`→`brand.instagram`, `#34B7F1`→`brand.messages`, `#1DA1F2`→`brand.twitter`, `#4285F4`→`brand.googleBlue`, `#34A853`→`brand.googleGreen`, `#FBBC05`→`brand.googleYellow`, `#EA4335`→`brand.googleRed`

Added 2026-09-10 while revalidating the auction against its frame: `auctionHeroScrim`, `auctionBidCard`, `auctionBidBar` and `glow.bidBar`. The first extraction dropped all four as per-screen one-offs, but every stop in them resolves to a kept token, so what was lost was the composition, not any colour. Without them the auction reads flat: the still stayed bright enough to turn the points pill olive, and the bid cards and bid bar lost the warmth the frame gives them.

Dropped: #0D1019 (canvas labels); #0A0A0A (emoji glyph fill); #444444 (hidden frame remnants); library variables not painted on Visuals (61 of 67 (only 6 were bound; their rendered values are covered by navBar/navBarOutline/goldDeep/navInactive/gold)); Success-state & Auction one-off hexes (mapped to nearest kept token (concept screens))

## 5. Typography

| Family | Weights | Role |
|---|---|---|
| DM Sans | 400, 600, 700, 800, 900 | UI text — titles, body, labels, tags, nav |
| Poppins | 600, 700 | Display voice — display, headlines, CTA label |
| Inter | 400, 500, 700 | Small print — captions, overlines |
| Oswald | 500, 600, 700 | Numerals — points, ranks, timers, OTP |

Dropped families: **Sora** — only the 3-letter 'PTS' unit on the points pill (26 nodes) → labelSmall; **Golos Text** — 3 nodes on the Auction concept screen → DM Sans equivalents; **Plus Jakarta Sans** — 1 node on the Success-state concept screen → headlineSmall; **DM Sans '9pt Regular' optical variant** — ship one DM Sans Regular

Line heights are fixed multipliers (TextStyle.height): 1.5 for body/labels, 1.2 display, 1.333 app-bar title, solid (1.0) for large numerals. 'absorbs' lists which design combinations collapse into each role. Minimum 10sp for labels/overlines/nav, 11sp for captions, 13sp for body. Design's 8px and 9px text is raised accordingly.

### TextTheme (18 roles)
| Role | Family | Weight | Size | LH | `height` | Tracking | Case | Use | Absorbs (design combinations) |
|---|---|---|---|---|---|---|---|---|---|
| `displayLarge` | Poppins | 700 | 34 | 40.8 | 1.2 | 0 | — | Onboarding headline | DM Sans Black 36 'The Daily Ritual' (36→34) |
| `displaySmall` | DM Sans | 800 | 30 | 36 | 1.2 | 0 | — | Prediction-game hero title, paywall title | (library Text-extrabold/3xl; auto line height fixed at 1.2) |
| `headlineLarge` | Poppins | 700 | 26 | 39 | 1.5 | 0 | — | Home video title | Poppins 26/39 ×21; DM Sans Bold 26/28.6 auction title |
| `headlineMedium` | DM Sans | 700 | 24 | 31.2 | 1.3 | 0 | — | Auth headings, modal 'Congratulations', 'Track Progress' | DM Sans Bold 26/120% auth headings (26→24 — Sign In (Filled) already uses 24); Poppins Bold 24 |
| `headlineSmall` | Poppins | 700 | 22 | 33 | 1.5 | 0 | — | Sheet titles, section heroes, big streak numbers | DM Sans Bold 22/33 'BTS Video'; Poppins 22/30.8, 22/26.4 |
| `titleLarge` | DM Sans | 700 | 20 | 30 | 1.5 | 0 | — | Profile name, share-app letters | Poppins Bold 20 numerals → numeralMd |
| `titleMedium` | DM Sans | 600 | 18 | 24 | 1.3333 | 0 | — | App-bar title, sheet titles, auth screen headers | Poppins SemiBold 16/24 auth headers (16→18); DM Sans Bold 16/24 sheet titles; DM Sans Bold 18/27; Poppins Bold 18/27 |
| `cardTitle` | DM Sans | 900 | 18 | 24 | 1.3333 | 0 | — | Game / reward card titles over images | library Text-black/lg |
| `titleSmall` | DM Sans | 600 | 14 | 21 | 1.5 | 0 | — | Card row titles, badge names, comment handles, dates | Poppins SemiBold 14/21 ×26; DM Sans SemiBold 13 ×13; Poppins Bold 13 ×18; Inter SemiBold 13 ×19; Poppins SemiBold 13; DM Sans Bold 13 |
| `bodyLarge` | DM Sans | 400 | 15 | 22.5 | 1.5 | 0 | — | Input values | Inter Regular 15; Oswald Regular 15 phone input |
| `bodyMedium` | DM Sans | 400 | 14 | 21 | 1.5 | 0 | — | Body copy, menu-row labels (Medium weight variant allowed) | DM Sans Regular 14/23.1, 14/22.4; Inter Regular 14/23.8; DM Sans Medium 14/21 ×51; Inter Medium 14 |
| `bodySmall` | DM Sans | 400 | 13 | 19.5 | 1.5 | 0 | — | Comments, paragraphs, questions | Inter Regular 13 (all leadings); DM Sans 13/20.15, 13/21.45, 13/138% |
| `labelLarge` | Poppins | 600 | 15 | 22.5 | 1.5 | 0.6 | — | CTA / button labels | DM Sans SemiBold 15 GoldButton; Poppins 15 +0.9/+1; Poppins SemiBold 14 Share Achievement |
| `labelMedium` | DM Sans | 700 | 12 | 18 | 1.5 | 0 | — | Small buttons, filter chips, 'Copy Code', form labels (UPPER +0.7) | Inter Bold 11 Watch/Start Quest (11→12); DM Sans SemiBold 12; DM Sans Medium 12 |
| `labelSmall` | DM Sans | 700 | 10 | 15 | 1.5 | 1.0 | UPPER | Tags, badges, chips (genre, category, status, level, eyebrow tag) | DM Sans Bold 10 +0.6/+0.8/+1.2/+1.6; DM Sans Bold 9 +0.9 category tags (9→10); DM Sans Bold 8 badges (8→10); Inter Bold 9 badges (9→10); DM Sans Medium 10; Sora Bold 10 'PTS' |
| `caption` | Inter | 400 | 11 | 16.5 | 1.5 | 0 | — | Captions, meta, timestamps, 'pts' units, subtitles on images | Inter Regular 11 ×71; Inter Regular 10 ×58 (10→11); Inter Regular 9 (9→11); Inter Medium 10/11/12; Inter Regular 12; DM Sans Regular 11/12 meta; Inter SemiBold 10 (Medium weight allowed for emphasis) |
| `overline` | Inter | 700 | 10 | 15 | 1.5 | 1.2 | UPPER | Section eyebrows (ALL WEEKLY QUESTS, YOUR ACTIONS, RANK…) | Inter Bold 10 +1.2/+1.4; Inter Bold 9 +1.08/+0.9 (9→10); Inter SemiBold 10/11 UPPER; DM Sans Bold 11 +1.1 UPPER 'Profile'/'GAMES' (11→10); DM Sans SemiBold 11 +1.1 auth labels |
| `navLabel` | DM Sans | 700 | 10 | 13.5 | 1.35 | 0.7 | UPPER | Bottom-nav labels (Bold active, SemiBold inactive) | library Nav Bar Selected / Nav bar (9→10 for accessibility) |

### Numerals — Oswald (7 roles)
| Role | Weight | Size | LH | `height` | Use | Absorbs |
|---|---|---|---|---|---|---|
| `numeralDisplay` | 600 | 38 | 38 | 1.0 | Hero total points | — |
| `numeralXl` | 600 | 34 | 34 | 1.0 | Section totals (1,190 pts earned) | Oswald SemiBold 34; Poppins Bold 34 |
| `numeralLg` | 600 | 26 | 39 | 1.5 | OTP digits, referral code, bid values | Oswald Medium 26; Oswald Bold 26 +3.9 (tracking dropped) |
| `numeralMd` | 600 | 20 | 30 | 1.5 | Stat cards (#260, 2,500), +500 awarded, prediction accuracy | Oswald SemiBold 20/20; Oswald Bold 19/22, 18/22 rank; Poppins Bold 20/20 stats; Oswald SemiBold 17/33; Oswald Bold 24/28 |
| `numeralSm` | 600 | 18 | 18 | 1.0 | Row values (2,691), +200 awarded, +120 activity pts | Oswald SemiBold 16/16 (16→18); Oswald Light 16/24 bid input |
| `numeralPill` | 700 | 14 | 14 | 1.0 | Points pill value, chip counters (2/3), pts over images, bid history | Oswald SemiBold 13/19.5 (13→14); Oswald SemiBold 12 (12→14); Oswald Medium 15 (15→14); Oswald Light 13 bid increments |
| `numeralAction` | 500 | 11 | 16.5 | 1.5 | Video action-rail counts (12.4K, 847), progress fractions (4 / 10, 363 / 1000) | Oswald SemiBold 11/12 |

### Every design combination → role
| Design (family weight size/lh +tracking case) | Count | Role |
|---|---|---|
| Oswald Medium 11/16.5 | 84 | `numeralAction` |
| DM Sans Bold 9/13.5 +0.72 | 80 | `navLabel` |
| Inter Regular 11/16.5 | 71 | `caption` |
| Inter Regular 10/15.0 | 58 | `caption` |
| DM Sans SemiBold 9/auto UPPER | 54 | `navLabel` |
| DM Sans Medium 14/21.0 | 51 | `bodyMedium` |
| Inter Semi Bold 11/16.5 | 45 | `caption` |
| DM Sans Bold 10/15.0 +0.6 UPPER | 44 | `labelSmall` |
| DM Sans 9pt Regular 10/15.0 | 33 | `caption` |
| Inter Bold 9/13.5 +0.72 | 31 | `labelSmall` |
| Oswald Bold 14/14.0 | 26 | `numeralPill` |
| Sora Bold 10/10.0 | 26 | `labelSmall` |
| DM Sans 9pt Regular 12/18.0 | 26 | `caption` |
| Poppins SemiBold 14/21.0 | 26 | `titleSmall` |
| DM Sans 9pt Regular 11/16.5 | 25 | `caption` |
| Oswald SemiBold 20/30.0 | 24 | `numeralMd` |
| Inter Regular 9/13.5 | 23 | `caption` |
| Oswald SemiBold 18/18.0 | 23 | `numeralMd` |
| Inter Bold 10/15.0 +1.2 UPPER | 22 | `overline` |
| Poppins Bold 26/39.0 | 21 | `headlineLarge` |
| Inter Bold 9/13.5 +1.08 UPPER | 21 | `overline` |
| DM Sans Bold 11/16.5 +1.1 UPPER | 20 | `overline` |
| Inter Semi Bold 13/19.5 | 19 | `titleSmall` |
| Inter Medium 12/18.0 | 19 | `caption` |
| DM Sans Bold 9/auto UPPER | 18 | `navLabel` |
| DM Sans Bold 9/13.5 +0.9 | 18 | `labelSmall` |
| DM Sans Black 18/auto | 18 | `cardTitle` |
| Inter Regular 12/18.0 | 17 | `caption` |
| DM Sans Bold 12/18.0 | 17 | `labelMedium` |
| Oswald SemiBold 13/19.5 | 16 | `numeralPill` |
| Inter Medium 11/16.5 | 16 | `caption` |
| Inter Medium 10/15.0 | 16 | `caption` |
| DM Sans SemiBold 18/24.0 | 15 | `titleMedium` |
| Inter Semi Bold 10/15.0 | 15 | `labelSmall` |
| Oswald SemiBold 16/16.0 | 15 | `numeralSm` |
| Poppins SemiBold 15/22.5 +0.6 | 13 | `labelLarge` |
| DM Sans Bold 20/30.0 | 13 | `titleLarge` |
| DM Sans SemiBold 13/19.5 | 13 | `titleSmall` |
| Inter Bold 9/13.5 +0.9 UPPER | 12 | `overline` |
| Inter Bold 11/16.5 TITLE | 12 | `labelMedium` |
| Poppins Bold 13/19.5 | 11 | `titleSmall` |
| DM Sans Bold 10/15.0 +1.2 UPPER | 11 | `labelSmall` |
| DM Sans Bold 13/19.5 | 10 | `titleSmall` |
| Inter Regular 12/16.8 | 10 | `caption` |
| Inter Bold 10/15.0 +1.4 UPPER | 10 | `overline` |
| Poppins SemiBold 12/15.6 | 10 | `labelMedium` |
| Inter Semi Bold 11/16.5 +0.22 | 9 | `caption` |
| Inter Regular 13/19.5 | 9 | `bodySmall` |
| Poppins Bold 10/11.0 | 9 | `labelSmall` |
| DM Sans Regular 11/17.6 | 8 | `caption` |
| Inter Bold 10/15.0 | 8 | `labelSmall` |
| DM Sans Medium 13/19.5 | 8 | `bodySmall` |
| Inter Regular 13/21.45 | 7 | `bodySmall` |
| Poppins Bold 22/33.0 | 7 | `headlineSmall` |
| DM Sans Bold 18/27.0 | 7 | `titleMedium` |
| Poppins Bold 20/20.0 | 7 | `numeralMd` |
| Poppins Bold 13/16.9 | 7 | `titleSmall` |
| Poppins SemiBold 16/24.0 | 6 | `titleMedium` |
| DM Sans Regular 11/16.5 | 6 | `caption` |
| DM Sans Bold 8/12.0 +0.48 | 6 | `labelSmall` |
| Poppins Bold 11/11.0 | 6 | `labelMedium` |
| DM Sans Bold 26/31.2 | 5 | `headlineMedium` |
| Poppins Bold 12/18.0 | 5 | `labelMedium` |
| Oswald SemiBold 38/38.0 | 5 | `numeralDisplay` |
| Poppins Bold 14/18.2 | 5 | `titleSmall` |
| Oswald SemiBold 20/20.0 | 5 | `numeralMd` |
| DM Sans 9pt Regular 13/20.15 | 5 | `bodySmall` |
| Poppins Bold 15/22.5 | 4 | `labelLarge` |
| Oswald Medium 26/39.0 | 4 | `numeralLg` |
| Inter Semi Bold 11/16.5 +1.1 UPPER | 4 | `overline` |
| Inter Regular 15/auto | 4 | `bodyLarge` |
| Inter Bold 11/16.5 +0.33 | 4 | `labelMedium` |
| Oswald Bold 19/22.0 | 4 | `numeralMd` |
| Inter Semi Bold 9/13.5 | 4 | `caption` |
| Oswald Bold 18/22.0 | 4 | `numeralMd` |
| DM Sans SemiBold 12/18.0 | 4 | `labelMedium` |
| Oswald SemiBold 12/18.0 | 4 | `numeralPill` |
| Inter Bold 11/16.5 | 4 | `labelMedium` |
| Poppins Bold 18/27.0 | 4 | `titleMedium` |
| Poppins SemiBold 13/19.5 | 4 | `titleSmall` |
| Oswald Light 13/18.0 | 4 | `numeralPill` |
| DM Sans Bold 22/33.0 | 4 | `headlineSmall` |
| Oswald SemiBold 34/34.0 | 4 | `numeralXl` |
| DM Sans Bold 10/15.0 +1.6 | 3 | `labelSmall` |
| Inter Regular 14/23.8 | 3 | `bodyMedium` |
| Inter Medium 14/19.5 UPPER | 3 | `bodyMedium` |
| DM Sans SemiBold 15/22.5 +1.0 | 3 | `labelLarge` |
| DM Sans 9pt Regular 13/19.5 | 3 | `bodySmall` |
| DM Sans Bold 10/15.0 | 3 | `labelSmall` |
| Inter Semi Bold 12/18.0 | 3 | `labelMedium` |
| DM Sans Bold 10/15.0 +0.6 | 3 | `labelSmall` |
| Oswald SemiBold 12/19.5 | 3 | `numeralPill` |
| Poppins Bold 15/18.0 | 3 | `labelLarge` |
| Oswald Medium 15/22.5 | 3 | `numeralPill` |
| DM Sans SemiBold 12/18.0 +0.72 UPPER | 3 | `labelMedium` |
| DM Sans 9pt Regular 15/22.5 | 3 | `bodyLarge` |
| DM Sans SemiBold 14/21.0 | 3 | `titleSmall` |
| DM Sans Bold 10/15.0 +0.8 | 3 | `labelSmall` |
| Poppins Bold 34/40.8 | 2 | `displayLarge` |
| DM Sans Regular 13/21.45 | 2 | `bodySmall` |
| DM Sans SemiBold 11/16.5 +1.1 UPPER | 2 | `overline` |
| Oswald Regular 14/21.0 +1.0 | 2 | `numeralPill` |
| Oswald Regular 15/auto +1.0 | 2 | `numeralPill` |
| DM Sans Regular 12/18.0 | 2 | `caption` |
| Inter Medium 14/21.0 | 2 | `bodyMedium` |
| DM Sans Bold 24/auto | 2 | `headlineMedium` |
| Poppins SemiBold 15/22.5 +0.9 | 2 | `labelLarge` |
| Poppins SemiBold 15/22.5 +1.0 | 2 | `labelLarge` |
| Inter Regular 11/16.5 LOWER | 2 | `caption` |
| DM Sans Bold 16/24.0 | 2 | `titleMedium` |
| DM Sans Regular 13/17.94 | 2 | `bodySmall` |
| Oswald SemiBold 11/16.5 | 2 | `numeralAction` |
| DM Sans Medium 10/14.0 +1.0 | 2 | `caption` |
| Poppins SemiBold 15/22.5 | 2 | `labelLarge` |
| Poppins SemiBold 12/18.0 | 2 | `labelMedium` |
| Poppins SemiBold 13/19.5 +0.26 | 2 | `titleSmall` |
| DM Sans ExtraBold 30/auto | 2 | `displaySmall` |
| Inter Regular 12/19.2 | 2 | `caption` |
| Poppins Bold 16/24.0 +0.64 | 2 | `titleMedium` |
| DM Sans Medium 10/15.0 +1.0 UPPER | 2 | `caption` |
| Oswald SemiBold 26/39.0 | 2 | `numeralLg` |
| Oswald Bold 20/30.0 | 2 | `numeralMd` |
| Oswald Bold 20/30.0 UPPER | 2 | `numeralMd` |
| DM Sans Regular 13/21.45 +0.5 | 2 | `bodySmall` |
| DM Sans 9pt Regular 14/22.4 | 2 | `bodyMedium` |
| Oswald SemiBold 17/33.0 | 2 | `numeralMd` |
| Inter Bold 10/15.0 +0.6 | 2 | `labelSmall` |
| Inter Regular 10/15.0 +1.0 | 2 | `caption` |
| Inter Regular 13/22.1 | 2 | `bodySmall` |
| Poppins Bold 34/40.8 | 1 | `displayLarge` |
| DM Sans SemiBold 15/22.5 | 1 | `labelLarge` |
| DM Sans 9pt Regular 14/23.1 | 1 | `bodyMedium` |
| DM Sans 9pt Regular 13/auto | 1 | `bodySmall` |
| DM Sans SemiBold 16/24.0 | 1 | `titleMedium` |
| Poppins Bold 16/24.0 | 1 | `titleMedium` |
| Inter Bold 9/13.5 | 1 | `labelSmall` |
| Poppins Bold 24/24.0 | 1 | `headlineMedium` |
| Inter Semi Bold 10/15.0 +1.2 UPPER | 1 | `labelSmall` |
| Poppins ExtraBold 16/16.0 | 1 | `titleMedium` |
| Inter Regular 9/13.5 +0.72 | 1 | `caption` |
| Oswald SemiBold 22/33.0 +1.32 | 1 | `numeralMd` |
| Poppins Bold 22/30.8 | 1 | `headlineSmall` |
| Golos Text Bold 10/15.0 +1.2 UPPER | 1 | `labelSmall` |
| DM Sans Bold 26/28.6 +-1.0 | 1 | `headlineMedium` |
| DM Sans Regular 13/17.16 | 1 | `bodySmall` |
| Golos Text Bold 12/18.0 | 1 | `labelMedium` |
| Golos Text SemiBold 13/19.5 | 1 | `titleSmall` |
| Oswald Light 16/24.0 | 1 | `numeralSm` |
| DM Sans SemiBold 13/22.5 +1.5 | 1 | `titleSmall` |
| Oswald Bold 26/39.0 +3.9 | 1 | `numeralLg` |
| DM Sans Bold 10/15.0 +1.0 UPPER | 1 | `labelSmall` |
| DM Sans Bold 13/19.5 +1.3 UPPER | 1 | `titleSmall` |
| DM Sans Black 36/auto | 1 | `displayLarge` |
| Plus Jakarta Sans SemiBold 20/28.0 +0.5 | 1 | `titleLarge` |
| Inter Regular 14/22.75 | 1 | `bodyMedium` |
| Oswald SemiBold 16/24.0 | 1 | `numeralSm` |
| Inter Regular 10/18.0 | 1 | `caption` |
| DM Sans Medium 12/auto | 1 | `caption` |
| Inter Semi Bold 12/16.0 +1.2 | 1 | `labelMedium` |
| Inter Medium 13/19.5 | 1 | `bodySmall` |
| Poppins Bold 24/28.8 | 1 | `headlineMedium` |
| Poppins Bold 11/16.5 | 1 | `labelMedium` |
| Inter Medium 13/22.1 | 1 | `bodySmall` |
| Oswald Bold 24/28.0 | 1 | `numeralLg` |
| DM Sans SemiBold 12/auto | 1 | `labelMedium` |
| DM Sans Bold 10/15.0 +1.0 | 1 | `labelSmall` |
| Poppins Bold 22/26.4 | 1 | `headlineSmall` |
| Inter Regular 13/20.8 | 1 | `bodySmall` |

## 6. Layout

Base 375×812, status inset 48, bottom nav 64. 373-wide frames are treated as 375 with 16 side padding. Add device safe-area insets in Flutter; the design draws none.

Screen padding: main 16, auth 24, onboarding 20, sheet 20, modal 24

**Spacing** `xxs` 2, `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 20, `xxl` 24, `xxxl` 32. Snap: 3→4, 5→4, 6→8, 9/10→12, 14→16, 18→20, 28→32. Semantic: sectionGap 16; cardGap 12; listGap 8; chipGap 8; inlineGap 8; labelToField 8; cardPadding 16 sides / 14 top-bottom; statCardPadding 12; sheetContent 0/20/32/20; modalContent 8/24/40/24

**Radius** `xs` 4, `sm` 8, `md` 12, `lg` 16, `pill` 20, `sheet` 24, `full` 9999. Snap: 2/3→4 (except progress = height/2), 6/7→8, 10→12, 14→16, 20→pill, 24→sheet, 999→full.

| Radius role | Value |
|---|---|
| CTA / input / card row | 12 |
| card | 16 |
| small & mini button / OTP box / calendar day | 8 |
| OTP box | 12 |
| chip h32 / segment item | 16 |
| tag / badge / pill | pill (20) |
| tab pill / points pill / avatar | full |
| bottom sheet & modal | 24/24/0/0 |
| progress bar | height/2 |

**Border** hairline 1, focus 1.5, emphasis 2 (snap: 0.55/0.59 → 1, 1.66 → 1.5, 3 → 2).

**Icon sizes** `xs` 12, `sm` 16, `md` 20, `lg` 24, `xl` 32. Snap: 9–11→12, 14→16, 18→20, 22→24, 26→24, 34→32.

| Icon role | Size |
|---|---|
| chip leading / check glyph | 12 |
| row chevron / small disc icon | 16 |
| back chevron frame / close / badge-tile icon | 20 |
| action rail / nav / badge disc | 24 |
| modal / hero badge | 32 |

**Avatars** profile 80, cast 52, comment 36, ring 1 (profile) / 2 (emphasis); badge discs sm 40, md 48, lg 56, xl 64

| Control | Height / size |
|---|---|
| cta | 52 |
| button | 32 |
| buttonMini | 28 |
| input | 52 |
| otpBox | 64 |
| chip | 32 |
| tag | 20 |
| badge | 20 |
| pill | 28 |
| appBarContent | 56 |
| appBarWithStatus | 104 |
| bottomNav | 64 |
| listRow | 54 |
| statCard | 72 |
| gameCard | 144 |
| progressBar | 4 |
| progressBarHero | 5 |
| progressBarThick | 6 |
| sheetHandle | 40×4 |
| navIndicator | 16×2 |

**Elevation**
| Level | Offset | Blur | Colour |
|---|---|---|---|
| `glow.cta` | [0, 6] | 24 | `{gold@40%}` |
| `glow.focus` | [0, 0] | 16 | `{gold@20%}` |
| `glow.navIndicator` | [0, 1] | 6 | `{goldCta@50%}` |
| `glow.card` | [0, 4] | 24 | `{gold@10%}` |
| `glow.smallButton` | [0, 2] | 8 | `{gold@10%}` |
| `glow.bidBar` | [0, -3] | 30 | `{gold@20%}` |
| `sheet` | [0, -18] | 28 | `{black@60%}` |

Backdrop blur 4. Modal shadow (0,-8,32 @50%) merged into sheet; success-state blurs dropped with the concept screen.

**Bottom sheet** radius 24/24/0/0; handle 40×4 pill {textMuted}, 12 top / 8 bottom; content 0/20/32/20; border top 1 {outline}; shadow elevation.sheet; scrim {surface@80%}

**Grids** badgeTiles: 2 columns, gap 12; exclusiveLibrary: 3 columns 119×179, gap 4, r12; shareApps: 5 × 52 discs; calendar: 7 × 41×30, gap 4

## 7. Component states (derived)
Every interactive component derives its states from its own primary colour (fill for filled controls, border/label colour for outlined/text controls). No extra hexes.

| State | Rule |
|---|---|
| enabled | as tokenised |
| hover (web/desktop only) | state layer 8% of the on-colour over the fill |
| pressed | state layer 12% of the on-colour over the fill (Material 3); text/outline buttons: 12% of the label colour as background |
| focused | pressed layer + glow.focus in the component's primary colour at 20% (matches the design's focused input glow) |
| disabled | fill at 30%, label/icon at 50% — taken from the design's disabled GoldButton (#40C9A24B fill / #80C9A24B label); outlined/text: label at 50% |
| selected / active | filled with primary colour, label = surface (filter chip active, segmented active) |
| loading | disabled visual + indicator in the label colour |
| error (inputs) | border {error} 1.5, glow {error@20%}, helper text {error} caption |
| success (inputs) | border {success@30%}, no glow |

Examples: **button.primary** — enabled: {goldCta} / {surface} / glow.cta, pressed: {goldCta} + 12% {surface} overlay, disabled: {gold@30%} / {gold@50%}, no glow; **chip.filter** — inactive: {surfaceRaised} / {textSecondary}, active: {gold} / {surface}, pressed: +12% label overlay; **bottomNav.item** — inactive: {navInactive}, active: {goldDeep} + indicator {goldCta}, pressed: +12% {goldDeep} overlay

Left to `ColorScheme.fromSeed(seedColor: {gold}, brightness: dark)` for now: light theme (none designed), info colour, surfaceDim/Bright, surfaceContainerLowest/Highest, inverse*, toggle/checkbox/radio/switch (none designed), snackbar/toast (none designed), empty/loading/error screens (none designed)

## 8. Icons
**Icon font for the single-colour UI glyphs (~40), SVG only for multi-colour marks.** The design's glyphs are 1,214 loose single-colour vectors (fill or 1.5 stroke) in 12–32 frames. Rendered as a font they are one small asset, cached by the text engine, tinted with `color:` at zero cost and scaled crisply — cheaper than flutter_svg's parse+raster per size. SVG is kept for the Google logo (4 colours), brand discs and any future illustration.

Pipeline: Export each glyph frame from Figma at 24×24 (normalise all to a 24 grid, strokes outlined) → fantasticon / FlutterIcon → `MatineeIcons` IconData class; fonts are variable-tint so no per-state assets.

Until that font exists, glyphs already needed ship as individual SVGs in `assets/icons/` and are tinted with a `colorFilter` — the four bottom-nav glyphs (`nav_home`, `nav_p2p`, `nav_rewards`, `nav_profile`, plus `_active` fills for the first two), and the nine My Earns / Badges glyphs (`fire`, `help_circle`, `puzzle`, `trophy_cup`, `trophy_medal`, `check`, `lock`, `star`, `close`) exported from the frames themselves so they match 1:1 — `puzzle` is the same glyph as `nav_p2p`, exported again at content size, and the two fold together in the font. `star` and `close` came with the My Earns history screens: `star` marks a badge a card earned and doubles as the partial-quest glyph, which the frame draws as a second, simpler star, and `close` is the cross on an incorrect prediction. `check` is the same path the history frames use at 9, so it was reused rather than exported again. Their paths are listed in `AppIconAssets` and they are drawn through the one `SvgIcon` widget, so folding them into the font later is a change to that class and that widget.

Glyph inventory: home, p2p (puzzle), rewards (coins), profile, chevron-left, chevron-right, chevron-down, close, settings, like/heart (outline + filled), comment, info, share, send, ticket (points), star/badge, lock, check, play, fire (streak), trophy, calendar-prev/next, camera (edit avatar), logout, copy, clock, target, external-link. Multi-colour as SVG: Google G, brand discs (WhatsApp/Telegram/Instagram/Messages/X), app logo.

Emoji (🔥 🎖️ 🏆 🎬 🌍 ✨ 🧠 🔮 🎟️ 🤝 💎 🔗) are used as icons on onboarding tiles, streak stats and modals — render with the platform emoji font or replace with glyphs; do not ship them as images.

## 9. Decisions log
| Topic | Decision |
|---|---|
| **Bottom safe area** | The design's frames are the full device screen and draw no home indicator of their own, so the gap under a bottom-anchored element already contains it — Create Account leaves 42 to the frame bottom, Subscribe 46, the Sign In legal line 32, the onboarding CTA 25.5, and the bottom nav 0. A bottom `SafeArea` plus that gap therefore reserves the inset twice and lifts the content ~34 off the bottom. Screens drop `bottom` from their SafeArea and pass the design's gap to `context.bottomInset`, which returns the larger of the gap and the device inset. `AppSpacing.screenBottom` (40) is that gap for auth and paywall screens; onboarding uses 24. The bottom nav is the exception that keeps its SafeArea: its bar fill has to bleed behind the indicator. |
| **Library scope** | Only the gluestack 'Semantic colors' collection Visuals binds is kept, and only the 6 variables actually painted — recorded as their rendered hex under final token names (navBar, navBarOutline, goldDeep, navInactive, gold). The 61 unbound variables and all Light/Dark columns are gone: the app is dark-only, so 'mode' is a library artefact, and the rendered value is the truth. |
| **Bottom nav** | Library Nav Bar colours kept per client preference (bg #0D1C25, hairline #112532, active #B99C48, inactive #67899E). Hand-built nav on Rewards/Profile/Badges/Unlock screens is restyled to them; structure/auto-layout from the library component; indicator colour normalised to goldCta. |
| **Fonts** | Four families kept: Poppins (display voice), DM Sans (UI), Inter (small print), Oswald (numerals). Dropped Sora (3-letter 'PTS' only), Golos Text (Auction concept), Plus Jakarta Sans (Success concept) — each was one font file for ≤26 glyph instances. |
| **Type scale** | 174 design combinations → 18 text roles + 7 numeral roles. Poppins is confined to display/headline/CTA; every 13–14px title becomes DM Sans SemiBold 14; every caption becomes Inter 11; auth headings 26→24 (the design already uses 24 on Sign In (Filled)); auth screen headers 16→18 to share the app-bar title role. |
| **Accessibility** | 8px and 9px text raised to 10 (labels/overlines/nav) and 11 (captions). Nothing under 10sp remains. Two colour pairs measured under WCAG AA's 4.5:1 for normal-size text and were moved: the LIVE badge's white-on-`error` gave 3.5:1, so the badge alone takes `errorDeep` #C43A3A (5.2:1) while `error` keeps the frame's red everywhere it carries no white text; the onboarding stat caption's `authTextMuted` on the gold-tinted pill gave 3.3:1, so it takes the adjacent `authTextSecondary` (6.2:1) rather than a new colour. |
| **Secondary text** | Two greys: textSecondary #8FA0B3 and textMuted #7A93AB. #C8D4E0 (prediction questions) promoted to white; #B0BEC8/#A3B1C1/#8A9AB0 → textSecondary; #848F99 → textMuted. Auth: authTextSecondary #A8998A (absorbs #9A8878, #A0907E) and authTextMuted #7A6A58 (absorbs #867159). |
| **Dark surfaces** | Navy: surface #0C0F16, surfaceCard #13171F, surfaceRaised #1A1F2B, outline #1F2535 — 4 tokens replace 20 hexes (#0F1117 modal → surfaceCard; #292828 vote buttons → surfaceRaised; #232938/#2A3040/#1C2A38 → outline). Warm: authSurface #0D0B08, authContainer #141008, authOutline #2A2018 (#1D170C back-button disc → authContainer). |
| **Gold family** | gold #C9A24B (brand/primary), goldCta #FFDC78 (fills; absorbs #FFD966), goldLight #E6CB86 (numerals), goldDeep #B99C48 (nav active), goldLevel1 #A8874A (absorbs #8B6914, #635025), yellow #FFD700 (absorbs #FFD54F, #F2CA14). #D2AE5D/#BF9A49/#997D3D/#957B30 → gold; #514730 avatar ring → gold@30%. |
| **Status** | success #2ECC71 (absorbs #6FCF97, #3D8C5F); error #EB5757 (absorbs #FF4444 logout, #E05252, #FF3333 LIVE, #7A3030). errorDeep #C43A3A is `error` darkened for the one place white text sits on solid red. Warning = yellow. Info = seed-derived. |
| **Alpha** | Design alphas snapped to 10% steps; conventions: tint fill 10/20%, tint border 30/40%, disabled 30/50%, glow 40/20/50%, scrim 80%, placeholder 50%, on-image text 60%, hairline 10%. |
| **onPrimary** | #0C0F16 (surface) on all gold — the design split 13 large CTAs (#0D0B08) vs 17 small buttons (#0C0F16); one ink is enough and matches the app surface. |
| **Gradients** | 10 kept, re-expressed in final tokens; per-screen unique gradients on Auction/Success/Streak-intro collapsed into heroScrim / onboardingScrim / headerFade. Points-pill stroke approximated goldCta→goldLevel1 (design #FFD067→#635025). splashBg added 2026-09-08: the splash frame's 12-stop ramp into gold is normalised to surface→surfaceCard→surfaceRaised because the gold stops sit below the 800dp viewport and never render. goldDisc, progressGoldSoft and highlightCard added 2026-09-10 for My Earns & Badges: the catalogue already specified all three on currentBadgeCard, earnRow and progress.linear but none was tabulated as a named gradient, so only highlightCard needed a decision. It was first snapped to gold@10%→gold@0%, but on the device that read visibly fainter than the frame, so the design's own gold@14%→gold@4% is kept — the one exception to the 10% alpha grid besides the existing 25/85 steps. |
| **Geometry** | Spacing 2/4/8/12/16/20/24/32; radius 4/8/12/16/20/24/full (card 16, CTA & input 12, small button 8); icons 12/16/20/24/32; CTA 52, button 32, input 52, app bar 56 + status. |
| **States** | Derived from each component's own colour (Material state layers 8/12%, disabled 30/50%, focus glow 20%). Light theme, info, toggles, toasts, empty/loading states left to ColorScheme.fromSeed(gold, dark) for now. |
| **Icons** | Icon font for single-colour glyphs, SVG for multi-colour marks. |
| **Weekly quest listing revalidated** | 2026-09-11, against 165:1931. The hero's still was taking `overlay.gameCardBottom`, which darkens from the bottom and leaves the top half clear — so the ACTIVE and reward pills sat on an undimmed photograph. The frame washes the whole still, which is now `questCardScrim`; it is the one token this pass added, and both its stops were already kept. `badge.status` gained the `successPlain` variant the catalogue had documented and no screen had used: DONE, REWARD CLAIMED and the open-prediction count are drawn with the green wash and no stroke. The claimed still's 0.4 dim moved off a widget literal onto `overlay.imageDim`. |
| **Prediction card's scrim named** | 2026-09-11, against 406:9862. The card had been drawing `overlay.gameCardBottom`, which darkens from the foot upward and clears the top half — so the multiplier and reward pills sat on an undimmed still, the same defect the hero quest card had. The catalogue's anatomy already specified `{surface@40%}→{surface@90%}` for it; it just had no named gradient, which is now `predictionCardScrim`. |
| **Quest row keeps its own wash** | 2026-09-11. The row fill had been normalised away: both stops of the frame's #111B27→#0F1820 landed on `surfaceCard`, so the extraction recorded `gradient {surfaceCard}→{surfaceCard}` and the app painted it flat. The two stops are only a few levels apart, but they are also a few levels off `surfaceCard` itself, so the flat row read warmer than the frame as well as unwashed. Both are kept as `surfaceRow` and `surfaceRowDeep` — the same call `highlightCard` got, where snapping to the nearest token lost what the design was doing. |
| **P2P and its games** | Built 2026-09-11 with no new tokens. Every value the six sections use resolved to a kept role: the card scrims to `overlay.gameCardBottom` and `overlay.auctionHero`, the tinted cards to `card.background.goldTint` and `badge.success.background`, the curated thumbnails' two states to `tag.gold.background` and `pill.overImage.background`. Two existing roles gained a first use — `progress.fill.success` for a finished action's bar, and `badge.status`'s `active` variant for the pill over a running quest. The frames' five CTA heights (30/40/42/50/52) collapse onto the documented `cta` 52 and `button` 32. |
| **Out of scope** | Auction (418:18052), Success state (404:9787) and the splash screenshot (36:5658) are concepts; their unique values are mapped to the nearest kept token, not tokenised. The splash background was later tokenised as `splashBg` so the screen could be built. |

## 10. Open items for design

- Nav Bar library component needs Rewards/Profile active variants (only Home/P2P exist).
- Home top-left 28×20 slot is empty on every Home — logo or menu?
- Edit Profile 'change photo' button (93×28) is an empty frame.
- Splash screen is a screenshot placeholder — needs a design. Built 2026-09-08 from the normalised `splashBg` gradient plus a supplied `assets/images/splash-logo.png` wordmark; the wordmark and tagline still have no text roles, so a vector logo and a real layout are outstanding.
- Input error state, toggles/checkbox/radio, toast, empty/loading/error screens, Notifications screen — not designed; seed/derived rules apply until they are.
- Confirm the points-pill stroke gradient approximation and the 8/9px → 10/11px size bumps with design.
- Confirm the two contrast moves with design: the LIVE badge's fill (`error` #EB5757 → `errorDeep` #C43A3A) and the onboarding stat caption's colour (`authTextMuted` → `authTextSecondary`). Both were forced by WCAG AA at the sizes the frames draw; a redesign that enlarges the LIVE label to 14pt semibold or heavier would let it keep the frame's red at the 3:1 large-text ratio.
- P2P's stat card writes figures that contradict the balance every other screen reads (5,000 points, Cinematic Visionary, 363/1000, where the ladder puts the user on Expert at 7,082). The shipped screen reads the shared ladder; confirm the card is meant to show the same standing and not a second one.
- The weekly quest hero writes '4 / 10' while the tracker for the same quest writes '2 of 4 actions done' with a 50% ring. The action count is what shipped; confirm the hero is meant to show actions rather than trailers.
- The claimed-quest frame writes 500 pts for Comment Connoisseur, which the listing prices at 300, and credits its badge to Trailer Marathon. The quest's own reward and its own badge shipped.
- The prediction detail frame writes a 2X multiplier for the card that writes 3X. The card's value shipped.
- The prediction analysis sheet labels both shares 'Option-A' and reverses the split against the card. YES and NO with their real percentages shipped.
- The prediction detail's disabled Submit is `{goldCta@50%}` in the frame, where the documented `button.primary` disabled state is `{gold@30%}`. The documented state shipped, since changing it would move every disabled primary in the app; confirm whether this screen is meant to differ.
- The analysis sheet's option cards are `{white@4%}` on a `{white@6%}` stroke with a `{white@10%}` track, all off the 10% alpha grid, and snapping them collapses fill into stroke. The card tokens shipped instead. Their bars are also a flat `{goldCta}` with a `{goldCta@40%}` glow rather than the documented `progress.linear` gold ramp, and their percentages `{goldCta}` rather than `{goldLight}`. Confirm whether the sheet is meant to have its own bar treatment.
- The listing's 'Cast Your Vote' and the detail's YES/NO buttons are `#292828` in the frames, a warm neutral that normalises to the cool `surfaceRaised`. The hue shift is visible side by side; confirm the normalisation holds or the warm tone becomes a token.
- Only one of the four weekly quests is given a badge name. The other three took names matching their titles; real names are outstanding.
- No frame draws an affordance that advances a streak day, so the level-complete drawer (404:9787) had no way in. A Complete Today CTA was added below the streak's stats, on the documented `cta` control, so the drawer is reachable; the design has not drawn it. Confirm whether the day is advanced by the user at all or reported by the server, and if by the user, where the control belongs.
- Confirm the third contrast move: the locked badge tile's name and padlock (`textDisabled` → `textMuted`). The frame knocks the name back *below* its own caption, which cannot be kept — `textDisabled` is 2.38:1 against the card where AA needs 4.5:1, and the glyph is 2.19:1 where 1.4.11 needs 3:1. Both now sit at the caption's tone, so the locked tile reads dimmer than an earned one (white name) but its name no longer sits under its caption. If that hierarchy matters, a token in the 4.6-5:1 band is needed; `textDisabled` itself has to stay where it is because it labels inactive controls, which WCAG exempts.