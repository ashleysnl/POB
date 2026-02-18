# Offshore Rotation Rush

**Offshore Rotation Rush** is a retro pixel-art browser game about surviving an offshore crew-change shift in rough Newfoundland-style conditions.

You pilot a helicopter onto a tight helideck to send workers home, keep morale up, and stop production from sliding off a cliff. When weather blocks flights, you can dispatch a supply boat and run a short boat minigame through waves and ice.

Everything is static: vanilla HTML/CSS/JS with one canvas, procedural pixel art, and synthesized audio via WebAudio.

## Features

- Pixel-art style at internal resolution **320x180** with crisp nearest-neighbor scaling
- Dynamic weather systems: fog, wind, sea state
- Helicopter landing loop with drift, hard landings, and incident penalties
- Boat dispatch fallback (30 seats) via 20-30 second minigame
- Shift management systems: backlog, happiness, production
- Day progression: Day 1 calm, Day 2 fog, Day 3 wind + crane hazard, Day 4 ice/mauzy chaos, then endless mode
- Deterministic RNG seed and Daily Challenge mode
- WebAudio retro synth effects (no audio files)
- Touch + desktop controls
- LocalStorage persistence for best score, last run, and settings

## Controls

### Desktop

- `WASD` or `Arrow Keys`: Move helicopter / steer boat
- `Space`: Hover assist (important for soft landings)
- `L`: Toggle landing lights (helps in fog)
- `B`: Call boat (if available)
- `P`: Pause/unpause

### Mobile / Touch

- Left thumb virtual stick: movement/steering
- Right `Hover` button: hover assist
- Right `Land` button: landing input (works with hover)
- HUD `Call Boat` button: launch boat minigame

## Core Gameplay Rules

- Backlog starts as workers waiting to go home.
- Helicopter trip sends up to **12 seats** each successful landing.
- Boat trip sends up to **30 seats** on successful dock.
- High backlog lowers happiness over time.
- Low happiness drags production down.
- Crashes, hard landings, and delays cause incidents and penalties.
- Keep the shift alive: if `Happiness` or `Production` reaches `0`, game over.

## Helicopter Seats (12) vs Boat Seats (30)

- **Helicopter**
  - Faster turnaround
  - More precise skill requirement
  - Heavily impacted by fog/wind and ops hazards
  - Landing requires low speed + accurate helideck placement + hover/land input

- **Boat**
  - Slower strategic fallback
  - Better option when flying is blocked
  - Minigame affected by sea state and icebergs
  - Can clear bigger chunks of backlog in one go

## Weather Effects

- **Fog**
  - Reduces visibility with dither overlay
  - Strong fog makes approaches riskier
  - Landing lights improve visibility

- **Wind**
  - Adds helicopter drift and unstable handling
  - Harder approach tracking and precision

- **Sea State**
  - Increases boat minigame difficulty (wave motion + iceberg danger)
  - Higher roughness lowers control and increases risk

## Newfoundland Flavor Included

The game includes playful, respectful references and events like:

- Puffin fly-bys
- Mauzy fog bank
- Screech-in confidence buff
- Capelin roll dock hazard
- “B’y, she’s some thick out!” style lines
- Iceberg drift hazards
- Jellybean-row-inspired HUD palette
- Signal Hill radio tower cameo
- Kitchen party playlist morale boost
- Townie vs Bayman joke popups
- Tea & toutons repair break
- Crane swing hazard
- Sea smoke effect

## Run Locally

1. Download or clone the repository.
2. Open `index.html` directly in a browser.
3. Click/tap once to unlock audio.
4. Press **Start Shift**.

No server or build step needed.

## Deploy To GitHub Pages (Beginner Friendly)

1. Create a new GitHub repository.
2. Upload all files from `Offshore-Rotation-Rush/` to the repository root.
3. Commit and push.
4. In GitHub repo, go to **Settings** -> **Pages**.
5. Under **Build and deployment**, choose:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or `master`) and `/ (root)`
6. Save.
7. Wait for GitHub Pages to publish.
8. Open the provided URL.

## Daily Challenge Seed

- Default seed can come from query string: `?seed=12345`
- The **Daily Challenge** button uses UTC date seed (deterministic daily run).

## Saved Data (LocalStorage)

- `orr_best`: best score
- `orr_last`: last run stats
- `orr_settings`: sound/touch settings

## Troubleshooting

### Blank page

- Confirm all required files exist in `/src` and paths are unchanged.
- Check browser console for missing files.
- Ensure JavaScript is enabled.

### Game looks blurry

- Make sure browser zoom is 100%.
- Keep canvas CSS `image-rendering: pixelated` enabled.

### No sound on mobile

- Tap the screen once after load to unlock WebAudio.
- iOS Safari requires user interaction before sound playback.
- Make sure Sound toggle is `On`.

### Changes not showing after deploy

- Hard refresh (`Ctrl+F5` / `Cmd+Shift+R`).
- Wait for GitHub Pages to finish redeploying.

## Tech

- HTML5 Canvas
- Vanilla JavaScript (no frameworks)
- WebAudio API synth
- Static site compatible with GitHub Pages
