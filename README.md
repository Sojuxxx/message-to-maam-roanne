# A Little Surprise for You, Ma’am! 💜

A complete static greeting-card adventure made with HTML, CSS, and vanilla JavaScript. No build step, account, database, or backend is needed.

## Run locally

Open this folder in VS Code and choose **Open with Live Server** on `index.html`, or run:

```sh
python -m http.server 4173
```

Then visit http://localhost:4173. Use a local server for the best clipboard and download experience.

## Personalize

Edit `js/config.js` to set the instructor name, title, message, student names, section, colors, quiz questions, and challenge answers. `{name}` in the greeting is replaced with the instructor name. Word answers should contain letters only. Quiz `correct` values are zero-based option indexes.

## Features

Five playable challenges, individual restart and skip controls, unlocked progress navigation, locally saved progress, a customizable SVG bouquet, optional synthesized background music, confetti, floating hearts, another-surprise messages, PNG card downloads, and a locally saved reply with copy controls. Replay resets the adventure while preserving the instructor’s reply. Mini-game rounds restart when the page reloads; the current screen and completed challenges persist. Skipping advances without marking a challenge complete.

Keyboard controls work throughout; letters advance automatically and support pasting. Reduced-motion preferences disable decorative movement. If local storage is unavailable, the adventure still works for the current session and the reply panel explains how to keep a copy. Replies stay in this browser and are never sent automatically.

## Hosting

For GitHub Pages, publish this folder’s contents as the site root. For Vercel, select the folder as the project root, use the Other preset, and leave build commands empty. All paths are relative and work under a GitHub Pages subdirectory.

Canvas Confetti 1.9.3 and html2canvas 1.4.1 are vendored in `assets/` (MIT licenses). Google Fonts is optional; system serif and sans-serif fonts are used offline. No network access is needed for games or PNG export. Music is generated using the Web Audio API; there is no audio file to load.

## Code structure (simplified)

The code is written in the same style taught in IT-WS02 (plain functions, `getElementById()`, `querySelector()`, `addEventListener()`, `classList`, `createElement()` / `appendChild()`, `if / else`, and a little RegEx).

| File | What it does |
| --- | --- |
| `js/config.js` | Names, message, colors, quiz, and answers. |
| `js/storage.js` | `loadSaved()` and `saveData()` using localStorage. |
| `js/animations.js` | `celebrate()` (confetti), `sendHearts()`, and `toggleSound()` (music). |
| `js/challenges.js` | One function per challenge: `startWordChallenge()`, `startMemoryChallenge()`, `startQuizChallenge()`, `startBouquetChallenge()`, `startSecretChallenge()`. |
| `js/main.js` | Screens, progress, and buttons: `go()`, `render()`, `renderWelcome()`, `renderIntro()`, `renderChallenge()`, `renderFinal()`. |

