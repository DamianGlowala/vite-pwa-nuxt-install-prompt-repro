# `showInstallPrompt` stays `false` because `beforeinstallprompt` fires before the plugin listens

Minimal reproduction for `@vite-pwa/nuxt` 2.0.4 (Nuxt 4.6.4, Chrome).

The install prompt plugin (`dist/runtime/plugins/pwa-install.client.js`) registers its `beforeinstallprompt` listener during plugin setup. Chrome can fire the event before the client entry has finished loading, so the event is never received, `showInstallPrompt` stays `false` for that page load, and the install UI is never shown.

## Steps

```bash
pnpm install
pnpm dev
```

1. Open `http://localhost:3000` in Chrome (a fresh profile, or one where the app is not installed) with the console open.
2. Reload the page.

`app/composables/pwaPrompt.ts` exposes `isInstallPromptShown` (`!pwa.isPWAInstalled && pwa.showInstallPrompt`), and `app/app.vue` renders an install button when it is `true`.

## Expected

The page shows "Install prompt is available." and an Install button, and the console logs `[composable] showInstallPrompt true`.

## Actual

The page shows "Install prompt is not available." Chrome itself offers to install the app (address bar icon), but `showInstallPrompt` never becomes `true`.

An inline `<head>` script (added in `nuxt.config.ts`) logs when the browser fires the event, so the order is visible in the console:

```
[head] beforeinstallprompt fired 158.1
[composable] showInstallPrompt false 321.2
```

## Measurements

Headless Chrome, fresh profile, times are `performance.now()` in ms. The `[plugin]` column comes from a temporary `console.log` placed right before `window.addEventListener('beforeinstallprompt', ...)` in the plugin.

| Setup                                       | Load   | Event fired | Plugin listener added | Prompt shown |
| ------------------------------------------- | ------ | ----------- | --------------------- | ------------ |
| `nuxt dev`, 2.0.4                           | first  | 158         | 311                   | no           |
| `nuxt dev`, 2.0.4                           | reload | 42          | 117                   | no           |
| `nuxt dev`, 2.0.4 + `order: -25, parallel`  | first  | 136         | 287                   | no           |
| `nuxt dev`, 2.0.4 + `order: -25, parallel`  | reload | 40          | 112                   | no           |
| `nuxt build`, 2.0.4                         | first  | 163         | before 151            | yes          |
| `nuxt build`, 2.0.4, throttled (Slow 4G)    | first  | 2738        | before 2134           | yes          |

- In dev, the listener is added after the event on every load, even in this minimal app. In a larger app the gap grows (we measured the event at ~1.5 s and the listener at ~3.6 s).
- `order: -25` with `parallel: true` moves the listener only slightly earlier here, because most of the delay is the client entry's import graph loading before any plugin runs, not other plugins.
- In this production build the listener wins, by ~13 ms without throttling.

## Possible fix

Capture the event before the app loads and let the plugin adopt it:

1. When `client.installPrompt` is enabled, the module adds an inline `<head>` script (`tagPosition: 'head'`) that, unless the `installPrompt` storage key is `'true'`, listens for `beforeinstallprompt`, calls `preventDefault()` and stores the event on `window`.
2. In plugin setup, if a stored event exists, use it as `deferredPrompt`, set `showInstallPrompt` to `true` and remove it from `window`. Keep the existing listener for events fired later.
