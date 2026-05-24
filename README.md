# Brand Studio

Brand Studio is the SYL.AILABS desktop recorder and video editor. It is distributed as a desktop application rather than deployed as part of the Chirp website.

The app is built with Electron, React, Vite, and electron-builder. Its recording and editing foundation is derived from OpenScreen; see `LICENSE` and `THIRD_PARTY_NOTICES.md`.

## Core Scope

- Record a screen, window, or region.
- Capture cursor movement, clicks, system audio, microphone, and webcam.
- Edit recordings with zoom, backgrounds, annotations, crop, speed, and blur tools.
- Export MP4 or GIF.

## Development

Required runtime:

- Node.js 22.22.1
- npm 10.9.4

Install dependencies:

```bash
npm ci --include=optional
```

Start the desktop app:

```bash
npm run dev
```

## Windows Build

The Windows recorder uses a native WGC helper generated during the packaged build. Building locally requires Visual Studio Build Tools 2022 with C++ tools and the CMake component.

```bash
npm run build:win
```

The NSIS installer is written to:

```txt
release/<version>/Brand Studio-Windows-<version>-Setup.exe
```

## Release

GitHub Actions publishes an unsigned Windows installer when a version tag is pushed:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow uploads the installer to the matching GitHub Release. Code signing should be configured before public distribution to avoid Windows trust warnings.

## Compatibility Notes

Brand Studio intentionally retains the `.openscreen` project extension and several `OPENSCREEN_*` diagnostic environment variables so recordings and native helper tooling inherited from the upstream editor remain compatible.
