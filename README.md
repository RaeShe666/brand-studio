# Brand Studio

Brand Studio is the SYL.AILABS desktop recorder and video editor. It is distributed as a desktop application rather than deployed as part of the Chirp website.

The app is built with Electron, React, Vite, and electron-builder. Its recording and editing foundation is derived from OpenScreen; see `LICENSE` and `THIRD_PARTY_NOTICES.md`.

## Core Scope

- Record a screen, window, or region.
- Capture cursor movement, clicks, system audio, microphone, and webcam.
- Edit recordings with zoom, backgrounds, annotations, crop, speed, and blur tools.
- Export MP4 or GIF.

## Download And Install

### Windows

The current Windows release is available from GitHub:

- [Download Brand Studio v0.1.0 for Windows](https://github.com/RaeShe666/brand-studio/releases/download/v0.1.0/Brand.Studio-Windows-0.1.0-Setup.exe)
- [View all releases](https://github.com/RaeShe666/brand-studio/releases)

To install:

1. Download `Brand.Studio-Windows-0.1.0-Setup.exe`.
2. Open the downloaded installer.
3. Choose an installation folder and complete the setup.
4. Launch Brand Studio from the Start menu or its shortcut.

The Windows installer is currently unsigned. If Windows SmartScreen shows an
unknown publisher warning, confirm that the installer was downloaded from the
official GitHub Release link above, then choose **More info** and **Run
anyway** to continue.

### macOS

A macOS installer is not published yet. The project contains macOS packaging
configuration, but there is currently no downloadable `.dmg` release for
Intel or Apple Silicon Macs.

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

### Authentication

Brand Studio uses the same Supabase authentication as the SYL.AILABS website.
For Google sign-in, add this URL to the Supabase Auth redirect allow list:

```txt
brandstudio://auth/callback
```

Google sign-in opens in the user's default browser and returns to the desktop
app through this registered protocol.

Windows release builds require these GitHub repository secrets:

```txt
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

They must match the public Supabase frontend configuration used by the
SYL.AILABS website. The release workflow supplies
`VITE_API_URL=https://api.sylailabs.com` automatically.

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

GitHub Actions publishes the unsigned Windows setup installer when a version
tag is pushed:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow uploads only `Brand Studio-Windows-<version>-Setup.exe` to the
matching GitHub Release. It can also be triggered manually with a
`release_tag` value to attach an installer to an existing release. Code
signing should be configured before broader public distribution to avoid
Windows trust warnings.

## Compatibility Notes

Brand Studio intentionally retains the `.openscreen` project extension and several `OPENSCREEN_*` diagnostic environment variables so recordings and native helper tooling inherited from the upstream editor remain compatible.
