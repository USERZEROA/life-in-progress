# Life in Progress

A compact, installable personal time tracker. One card shows progress through today, this month, this year, an **editable lifespan estimate**, or a saved personal event alongside three meal ideas.

## Run locally

Node.js 20 or later is enough. No package install is needed.

```sh
npm start
```

Open `http://127.0.0.1:4173/`. Run `npm test` and `npm run check` for the included checks.

For presentations, opening this local preview starts a blank three-step setup. Refreshing the same page after finishing setup keeps that tab's demo data, so persistence can still be shown. Opening the address again starts a new demo in that tab. Each demo tab uses separate browser storage; the regular app's saved profile is not erased.

## Using it

- First launch guides you through your birthday, the age you plan to live to, zodiac sign, MBTI type, food preferences, and important moments. Use the settings button to edit them later. Life progress ends at that birthday; it is only a personal estimate.
- Choose a period to update the elapsed percentage and progress bar, then choose a unit for the remaining time. For a personal event, progress runs from when you add it to the start of its date. Editing an event keeps its original start time. Older saved events without a start time begin when first opened or imported after this update.
- Meal ideas use food preferences first; zodiac and MBTI add a playful nudge to the order. The main card shows only the meal names.
- Use the window button to open a compact view with its own period and unit controls.
- Use your browser's install or **Add to Home Screen** option for app-like access. A phone home-screen **icon** opens this PWA. An actual iOS or Android home-screen widget requires a native app and widget extension/provider.

The app saves profile details, moments, and display preferences in this browser's local storage. There is no account or cross-device synchronization. Use **Export JSON** in settings to keep a backup, and **Import JSON** to move it to another browser or device. Importing replaces data on the destination device.

## Project

`dist/` is the static site. `server.mjs` is a small local preview server. The service worker caches app files for offline use after they have loaded once. When updating these files, bump the asset URL version in both HTML pages, module imports, and the service worker's precache list, plus the service worker cache name, so an older worker cannot serve stale code with new markup. The Sites manifest lives in `.openai/hosting.json`.
