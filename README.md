# dial-up-loader

[![npm version](https://img.shields.io/npm/v/dial-up-loader.svg)](https://www.npmjs.com/package/dial-up-loader)
[![license](https://img.shields.io/npm/l/dial-up-loader.svg)](./LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/dial-up-loader)](https://bundlephobia.com/package/dial-up-loader)

A retro React loader that renders an old-school modem terminal and synthesises dial-up handshake sounds with the Web Audio API.

## Installation

```bash
npm install dial-up-loader
```

**Peer dependencies**

- `react >= 16.8`

## Quick Start

```tsx
import { DialUpLoader } from 'dial-up-loader';

export function App() {
  return <DialUpLoader autoPlay={false} />;
}
```

## Props

### `DialUpLoaderProps`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `sound` | `boolean` | `true` | Enables synthesized modem audio. |
| `autoPlay` | `boolean` | `false` | Automatically starts the sequence on mount. |
| `message` | `string` | stage message | Overrides the default status text. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Controls font and modem art sizing. |
| `theme` | `'dark' \| 'light'` | `'dark'` | Selects dark or light terminal styling. |
| `className` | `string` | — | Additional root class name. |
| `style` | `React.CSSProperties` | — | Inline styles merged onto the root element. |
| `speed` | `number` | `1` | Playback speed multiplier. |
| `active` | `boolean` | `true` | Stops playback and marks the loader idle when false. |
| `onConnect` | `() => void` | — | Called after the full connection sequence completes. |
| `onStop` | `() => void` | — | Called when the loader is deactivated. |
| `loop` | `boolean` | `false` | Replays the whole sequence after completion. |
| `showModem` | `boolean` | `true` | Shows ASCII modem art. |
| `showProgress` | `boolean` | `true` | Shows the terminal-style progress bar. |
| `showLeds` | `boolean` | `true` | Shows animated modem LEDs. |
| `aria-label` | `string` | computed | Accessible status label for assistive tech. |

### `useDialUpSound(options)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `enabled` | `boolean` | `true` | Enables sound playback. |
| `speed` | `number` | `1` | Playback speed multiplier. |
| `onComplete` | `() => void` | — | Called after the full modem sequence finishes. |

### `UseDialUpSoundReturn`

| Field | Type | Description |
| --- | --- | --- |
| `play` | `() => Promise<void>` | Starts the dial-up sequence. |
| `stop` | `() => void` | Stops playback and resets the hook. |
| `isPlaying` | `boolean` | Indicates whether the sequence is active. |
| `stage` | `ConnectionStage` | Current stage: `idle`, `dialing`, `ringing`, `negotiating`, `connected`, or `error`. |
| `progress` | `number` | Current progress from `0` to `100`. |

## Browser autoplay note

Modern browsers often block audio playback until the user interacts with the page. If `autoPlay` is enabled, visuals may start immediately, but sound can still require a click or tap depending on browser policy.

## Next.js / SSR

Built files already include `"use client"` via the bundler banner, so the package works cleanly in the Next.js App Router. Style injection only runs in the browser.

## Examples

## Demo

```bash
npm install
npm run demo:dev
```

For a static bundle:

```bash
npm run demo:build
```

The raw `demo\index.html` file is not meant to be opened directly from disk. Use the scripts above so the package build exists and the demo is served with the correct module handling.

### Auto play

```tsx
<DialUpLoader autoPlay />
```

### Looping playback

```tsx
<DialUpLoader autoPlay loop />
```

### Light theme

```tsx
<DialUpLoader theme="light" />
```

### Custom message

```tsx
<DialUpLoader message="Negotiating with the mothership..." />
```

### Headless hook

```tsx
import { useDialUpSound } from 'dial-up-loader';

export function HeadlessDialer() {
  const { play, stop, stage, progress, isPlaying } = useDialUpSound({
    enabled: true,
    speed: 1.25,
  });

  return (
    <div>
      <button onClick={() => void play()} disabled={isPlaying}>
        Start
      </button>
      <button onClick={stop}>Stop</button>
      <p>{stage}</p>
      <p>{progress}%</p>
    </div>
  );
}
```

## Publishing

```bash
npm version patch
npm publish
```

Helpful release commands:

```bash
npm run release:patch
npm run release:minor
npm run release:major
```

## Contributing

Issues and pull requests are welcome. Please run install, build, lint, and test locally before opening a PR.

## License

MIT © 2025
