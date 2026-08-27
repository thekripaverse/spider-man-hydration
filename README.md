# 🕷️ Spider-Man Hydration Reminder (Production Desktop App)

A production-ready Windows desktop hydration companion. An animated, photorealistic Spider-Man appears smoothly across your screen from different directions to remind you to stay hydrated while you work, without interrupting your workflow.

---

## 🌟 Key Features

- 🕷️ **Photorealistic Spider-Man Visuals**: High-resolution movie and comic renders with realistic webbing texture, specular lighting, and pose-aware physics.
- 🎯 **8 Unique Dynamic Entrances**:
  1. **Top Upside-Down Drop**: Drops from ceiling on a web line.
  2. **Left Side Wall Crawl**: Crawls along the left monitor border.
  3. **Right Side Swing**: Pendulum web swing in from the right edge.
  4. **From the Bottom**: Climbs up over the taskbar.
  5. **Top-Left Corner Swing**: Diagonally swings across the screen.
  6. **Side Peek**: Playfully peeks from the side edge.
  7. **Ceiling Crawl**: Crawls horizontally across the top border.
  8. **High-Speed Web Zip-In**: Instant web-zip with spring bounce.
- 🎲 **Zero-Repeat Queue**: Cycles through a randomized queue of all 8 poses before reshuffling.
- ⏱️ **Intelligent Hydration Cycles**:
  - **Work Timer**: 25 min default (configurable 5–90 min).
  - **Post-Drink Timer**: 20 min default (configurable 5–60 min).
  - **Snooze Timer**: 5 min default (configurable 1–15 min).
  - **Active Tracking**: Pauses countdown during system idle (> 60s) and computer sleep.
- 🎛️ **Windows System Tray Companion**:
  - Right-click menu with **💧 Drink Water**, **🕷️ Test Reminder**, **⚙️ Settings**, **⏸ Pause / Resume**, and **🚪 Exit**.
  - Closes to tray: closing the settings modal keeps the app running quietly in the background.
- 🚀 **Auto-Start with Windows**: Toggleable Windows startup via `app.setLoginItemSettings`.
- 🎵 **Procedural Audio & Custom Sound Uploads**: High-fidelity Web Audio synthesis with support for custom MP3/WAV uploads stored in `userData`.
- 📊 **Hydration Streak & Daily Stats**: Tracks glasses logged, reminders delivered, and daily streak.

---

## 📦 Production Installer & Executable Outputs

The production binaries are located in the `release/` folder:

| File | Type | Description |
| :--- | :--- | :--- |
| **`release/Spider-Man Hydration Setup 1.0.0.exe`** | **Windows NSIS Installer** | Installs to Windows AppData, adds Start Menu entry, Desktop shortcut, and registers in Windows Settings / Installed Apps for clean uninstall. |
| **`release/Spider-Man Hydration Reminder 1.0.0.exe`** | **Portable Standalone `.exe`** | Single `.exe` file that runs immediately anywhere without installation. |
| **`release/win-unpacked/`** | **Unpacked Executable Folder** | Direct folder distribution with `Spider-Man Hydration Reminder.exe`. |

---

## 🚀 Building from Source

```bash
# 1. Start Development Server (Hot Reload)
npm start

# 2. Build Production Web Assets
npm run build

# 3. Package Unpacked Windows App
npm run pack

# 4. Generate Windows Setup Installer
npx electron-builder --win nsis

# 5. Generate Portable Windows Executable
npm run dist:portable
```

---

## 📂 User Data & Persistence Location

All user configuration, statistics, and uploaded custom sound files are stored safely in the Windows user profile:
`%APPDATA%/spider-man-hydration-reminder/` (`app.getPath('userData')`)
- `settings.json` — User preferences and intervals.
- `sounds/` — Uploaded custom audio files.
- `app.log` — Production operational logs.
