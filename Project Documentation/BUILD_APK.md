# Akonta APK — Full Build Guide

Complete reference for everything installed, configured, and run to produce **`Akonta.apk`**.

Akonta is **not** a single “APK library.” It is an **Expo + React Native** app compiled to native Android with **Gradle** (local) or **EAS Build** (cloud).

---

## Table of contents

1. [Stack overview](#1-stack-overview)
2. [System requirements (install on your Mac)](#2-system-requirements-install-on-your-mac)
3. [npm packages (installed by the project)](#3-npm-packages-installed-by-the-project)
4. [Expo config & native plugins](#4-expo-config--native-plugins)
5. [Environment & build-time config](#5-environment--build-time-config)
6. [One-time project setup](#6-one-time-project-setup)
7. [Build the APK — local (recommended)](#7-build-the-apk--local-recommended)
8. [Build the APK — EAS cloud](#8-build-the-apk--eas-cloud)
9. [When to run `expo prebuild`](#9-when-to-run-expo-prebuild)
10. [Post-build verification](#10-post-build-verification)
11. [Install & smoke test on phone](#11-install--smoke-test-on-phone)
12. [Expo Go vs release APK](#12-expo-go-vs-release-apk)
13. [Voice / API proxy (separate from APK)](#13-voice--api-proxy-separate-from-apk)
14. [Troubleshooting](#14-troubleshooting)
15. [File map](#15-file-map)

---

## 1. Stack overview

| Layer | Technology | Version (project) |
|-------|------------|-------------------|
| App framework | **Expo SDK** | ~56.0.8 |
| UI runtime | **React Native** | 0.85.3 |
| UI library | **React** | 19.2.3 |
| Language | **TypeScript** | ~6.0.3 |
| State | **Zustand** | ^5.0.14 |
| Navigation | **React Navigation** | v7 |
| Local DB | **expo-sqlite** | ^56.0.4 |
| Android compile | **Gradle** + **Android SDK** | via prebuild |
| Cloud build (optional) | **EAS CLI** | eas.json profiles |

**Output artifact:** `Akonta.apk` (release, ARM phones only — no x86 emulator libs).

**Package ID:** `com.ismart.marketapp`

---

## 2. System requirements (install on your Mac)

Install these **once** on the machine that builds the APK.

### Required

| Tool | Version | Purpose | How to install |
|------|---------|---------|----------------|
| **Node.js** | 18+ (20 LTS recommended) | Runs Metro, npm, Expo CLI | [nodejs.org](https://nodejs.org) or `brew install node` |
| **npm** | Comes with Node | Installs JS dependencies | — |
| **Java JDK** | **21** (Temurin) | Android Gradle Plugin | `brew install --cask temurin@21` |
| **Android SDK** | API 34+ typical | Compiles native Android | [Android Studio](https://developer.android.com/studio) → SDK Manager |
| **Android SDK Build-Tools** | Latest stable | APK packaging | Android Studio SDK Manager |
| **Android NDK** | As required by RN 0.85 | Native module builds | SDK Manager (optional until prebuild asks) |

### Environment variables (add to `~/.zshrc` or export before build)

```bash
# Java 21 — required for React Native 0.85 + Gradle 9
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"

# Android SDK (adjust path if yours differs)
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools"
```

Verify:

```bash
node -v          # v18+ or v20+
java -version    # openjdk 21
echo $ANDROID_HOME
```

### Optional (cloud build only)

| Tool | Purpose |
|------|---------|
| **EAS CLI** | `npm install -g eas-cli` — cloud APK builds |
| **Expo account** | `eas login` — free tier available |

### Not used for APK

- Flutter, Capacitor, Cordova
- Python (only for `server/` voice deploy scripts, not APK)
- Hugging Face CLI (voice Spaces deploy only)

---

## 3. npm packages (installed by the project)

From the project root:

```bash
cd ismart-market-app
npm install
```

`npm install` also runs **`postinstall`**: `node scripts/patch-foojay-gradle.js` (Gradle 9 compatibility fix).

### Production dependencies (`package.json`)

| Package | Role in Akonta |
|---------|----------------|
| `expo` | App shell, native modules, prebuild |
| `react` / `react-native` | UI runtime |
| `expo-audio` | Voice recording |
| `expo-speech-recognition` | On-device English STT |
| `expo-sqlite` | Local ledger / settings DB |
| `expo-file-system` | Temp audio files, exports |
| `expo-secure-store` | PIN hashes (encrypted keystore) |
| `expo-crypto` | SHA-256 PIN hashing |
| `expo-notifications` | Low-stock / reminders |
| `expo-image-picker` | Product photos |
| `expo-sharing` / `expo-print` | Share sheet, PDF export |
| `expo-font` + `@expo-google-fonts/nunito` | Nunito typography |
| `expo-localization` | Locale |
| `expo-status-bar` | Status bar |
| `@react-navigation/*` | Tab + stack navigation |
| `@react-native-community/netinfo` | Offline banner |
| `react-native-gesture-handler` | Gestures |
| `react-native-safe-area-context` | Safe areas |
| `react-native-screens` | Native screens |
| `react-native-svg` | Icons / graphics |
| `zustand` | App state |
| `i18next` / `react-i18next` | English + Twi UI strings |
| `@expo/vector-icons` | Ionicons |

### Dev dependencies

| Package | Role |
|---------|------|
| `typescript` | Type checking |
| `@types/react` | React types |

### npm scripts (build-related)

| Script | Command | What it does |
|--------|---------|--------------|
| `postinstall` | auto | Patches Gradle foojay resolver |
| `start` | `expo start --go` | Dev server (**Expo Go — no full voice**) |
| `android` | `expo run:android` | Debug build on device/emulator |
| **`build:apk:local`** | see below | **Release APK → `Akonta.apk`** |
| `build:apk` | `eas build -p android --profile preview` | Cloud release APK |
| `icons:launcher` | generate launcher PNGs | After icon art changes |
| `check:copy` | UI string lint | Before release |

---

## 4. Expo config & native plugins

Config files:

| File | Purpose |
|------|---------|
| `app.json` | App name, permissions, plugins, Android package |
| `app.config.js` | Merges `app.json` + loads `.env.local` into `extra` |

### Expo plugins (generate native Android code on prebuild)

| Plugin | Native capability |
|--------|-------------------|
| `expo-notifications` | Push / local notifications |
| `expo-speech-recognition` | Google on-device English voice |
| `expo-sharing` | Share sales reports |
| `expo-image-picker` | Camera + gallery |
| `expo-audio` | Microphone recording |
| `expo-secure-store` | Encrypted PIN storage |

### Android permissions (from `app.json`)

- `RECORD_AUDIO` — voice sales
- `CAMERA` — product photos
- `POST_NOTIFICATIONS` — alerts
- `RECEIVE_BOOT_COMPLETED`, `VIBRATE` — notifications

### Android security flags

- `allowBackup: false` — blocks automatic Android backup of app data
- `package: com.ismart.marketapp`

---

## 5. Environment & build-time config

Copy the example env file (optional — only if overriding defaults):

```bash
cp .env.example .env.local
```

**`.env.local` is gitignored.** It is read by `app.config.js` at build time.

### Current build-time variables

| Variable | Required? | Baked into APK? | Purpose |
|----------|-----------|-----------------|---------|
| `AKONTA_PROXY_URL` | No (has default) | Yes — public URL only | Groq + HF Ga API proxy (keys stay on HF Space) |

Default proxy URL in app:

```
https://ELiOkine-akonta-api-proxy.hf.space
```

**Groq and HF tokens are no longer put in the APK.** They live in the Hugging Face Space secrets (`server/_hf_proxy_space/`). See [§13](#13-voice--api-proxy-separate-from-apk).

Example `.env.local`:

```bash
# Optional — override default proxy URL
AKONTA_PROXY_URL=https://ELiOkine-akonta-api-proxy.hf.space
```

---

## 6. One-time project setup

```bash
cd ismart-market-app

# 1. Install JS dependencies (+ Gradle patch)
npm install

# 2. Set Java (every new terminal session, or add to ~/.zshrc)
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"

# 3. Generate native android/ folder (first time OR after native config change)
npx expo prebuild --platform android --no-install
node scripts/patch-foojay-gradle.js
```

The `android/` folder is **generated** by Expo prebuild. It may not be committed to git — regenerate if missing.

---

## 7. Build the APK — local (recommended)

This is the usual workflow on a Mac with Android SDK installed.

```bash
cd ismart-market-app
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"
npm install
npm run build:apk:local
```

### What `build:apk:local` runs

```bash
node scripts/patch-foojay-gradle.js \
  && cd android \
  && ./gradlew assembleRelease \
  && cp app/build/outputs/apk/release/Akonta.apk ../Akonta.apk \
  && node ../scripts/verify-apk.js ../Akonta.apk
```

| Step | Tool | Result |
|------|------|--------|
| 1 | `patch-foojay-gradle.js` | Fixes RN Gradle plugin for Gradle 9 |
| 2 | `./gradlew assembleRelease` | Compiles JS bundle + native code → APK |
| 3 | `cp … Akonta.apk` | Copies to project root for easy sharing |
| 4 | `verify-apk.js` | Checks ARM libs, bundle, no x86 junk |

**Output:** `ismart-market-app/Akonta.apk` (~50–60 MB)

Gradle also writes:

```
android/app/build/outputs/apk/release/Akonta.apk
```

### Manual equivalent (if script fails)

```bash
cd ismart-market-app
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"

npm install
node scripts/patch-foojay-gradle.js

# If android/ missing:
# npx expo prebuild --platform android --no-install

cd android
./gradlew assembleRelease
cp app/build/outputs/apk/release/Akonta.apk ../Akonta.apk
cd ..
node scripts/verify-apk.js Akonta.apk
```

### Debug on a connected phone (not release APK)

```bash
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"
npm run android
# Runs: EXPO_USE_COMMUNITY_AUTOLINKING=1 expo run:android
```

---

## 8. Build the APK — EAS cloud

Use when the local machine has no Android SDK, or you want Expo-hosted builds.

```bash
npm install -g eas-cli
eas login
cd ismart-market-app
npm run build:apk
# same as: eas build -p android --profile preview
```

Profiles in `eas.json`:

| Profile | Output | Use |
|---------|--------|-----|
| `preview` | APK | Internal testing (default script) |
| `production` | APK | Release |
| `development` | APK + dev client | Debugging |

Download the APK from the terminal link or [expo.dev](https://expo.dev).

---

## 9. When to run `expo prebuild`

| Change type | Rebuild command |
|-------------|-----------------|
| **JS/TS only** (screens, logic, i18n) | `npm run build:apk:local` — **no prebuild** |
| **New Expo native module** (e.g. added `expo-secure-store`) | **prebuild required** |
| **`app.json` plugins / permissions** | **prebuild required** |
| **App icon / splash / package name** | **prebuild required** |
| **Voice server code on Hugging Face** | **No APK rebuild** |

Prebuild + build:

```bash
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"
npx expo prebuild --platform android --no-install
node scripts/patch-foojay-gradle.js
npm run build:apk:local
```

After changing launcher artwork:

```bash
npm run icons:launcher
npx expo prebuild --platform android --no-install
npm run build:apk:local
```

---

## 10. Post-build verification

`scripts/verify-apk.js` checks:

| Check | Why |
|-------|-----|
| JS bundle embedded (`index.android.bundle` or `.hbc`) | App code is inside APK |
| ARM64 + ARM32 native libs | Real phones (not emulator x86) |
| No `lib/x86/` | Smaller APK, no emulator libs |
| `resources.arsc` | Compiled Android resources |

Run manually:

```bash
node scripts/verify-apk.js Akonta.apk
```

TypeScript check (before building):

```bash
npx tsc --noEmit
npm run check:copy
```

---

## 11. Install & smoke test on phone

1. Copy `Akonta.apk` to the phone (WhatsApp, USB, Drive, AirDrop).
2. Enable **Install from unknown sources** for the file app used.
3. Install (overwrites previous Akonta if same signing key).
4. Grant **Microphone** when prompted.

### Smoke test checklist

- [ ] PIN set / unlock / re-lock after leaving app (background)
- [ ] Add product in Stock, record a button sale
- [ ] Voice sale — English (Google on phone / HF cloud / Groq via proxy)
- [ ] Voice sale — Twi (needs internet + HF Twi Space awake)
- [ ] Multi-item voice (*"one bread, two plantain"*)
- [ ] Edit past sale in History
- [ ] PDF / text export from Settings
- [ ] Dark mode toggle (Settings → Appearance)

### Forgot PIN

Lock screen → **Forgot PIN** → shop name + recovery word set when PIN was enabled.

---

## 12. Expo Go vs release APK

| Feature | Expo Go | Release APK |
|---------|---------|-------------|
| Tap / button sales | Yes | Yes |
| Product photos | Yes | Yes |
| SQLite ledger | Yes | Yes |
| English voice (Google on phone) | **No** | Yes |
| English / Groq cloud voice | **No** | Yes (via API proxy) |
| Twi / Ga cloud voice | **No** | Yes |
| Secure PIN (SecureStore) | **No** | Yes |
| PDF export | Yes | Yes |

**Always test voice on a real release APK**, not Expo Go.

---

## 13. Voice / API proxy (separate from APK)

These run on **Hugging Face Spaces** — deploy independently of the APK.

| Space | Folder | Purpose |
|-------|--------|---------|
| `akonta-twi-asr` | `server/_hf_twi_space/` | Twi MMS speech-to-text |
| `akonta-en-asr` | `server/_hf_en_space/` | English Whisper STT |
| `akonta-ga-asr` | `server/_hf_ga_space/` | Ga STT (fallback) |
| **`akonta-api-proxy`** | `server/_hf_proxy_space/` | **Groq AI + Groq STT + HF Ga** (keys off APK) |

Deploy docs:

- [server/DEPLOY.md](./server/DEPLOY.md) — Twi + English Spaces
- [server/_hf_proxy_space/README.md](./server/_hf_proxy_space/README.md) — API proxy

**Before shipping a new APK after security update:**

1. Deploy `akonta-api-proxy` Space with fresh `GROQ_API_KEY` + `HF_TOKEN` secrets
2. Rotate/revoke old keys that were in previous APK builds
3. Test: `GET https://ELiOkine-akonta-api-proxy.hf.space/health`
4. Build and ship new `Akonta.apk`

Voice Space URL changes on HF **do not** require APK rebuild (except proxy URL if you change the default in `app.config.js`).

---

## 14. Troubleshooting

### Gradle / Java errors

- Use **Java 21** (`JAVA_HOME` must point at Temurin 21).
- Run `node scripts/patch-foojay-gradle.js` after every `npm install` (auto via postinstall).
- Clean build: `cd android && ./gradlew clean && ./gradlew assembleRelease`

### `android/` folder missing

```bash
npx expo prebuild --platform android --no-install
node scripts/patch-foojay-gradle.js
```

### APK won't install on phone

- Uninstall old Akonta first.
- Use a **real ARM phone** (APK has no x86 libs).
- Local release builds use the debug/release keystore in `android/app/` — keep the same keystore for upgrades.

### Voice / Groq not working after new APK

- Confirm API proxy Space is running: `/health` shows `groq_configured: true`
- HF Spaces sleep — first request may take 30–60 s
- Phone needs internet for cloud voice

### Metro / dev issues

```bash
npx expo start --clear
```

---

## 15. File map

| Path | Purpose |
|------|---------|
| **`Akonta.apk`** | **Ship this file** to testers / traders |
| `android/` | Generated native Android project (Gradle) |
| `app.json` | Expo manifest (permissions, plugins) |
| `app.config.js` | Dynamic config + `.env.local` → `extra` |
| `eas.json` | EAS cloud build profiles |
| `package.json` | npm deps + build scripts |
| `.env.example` | Env var template |
| `.env.local` | Your local overrides (gitignored) |
| `scripts/patch-foojay-gradle.js` | Gradle 9 / RN 0.85 fix |
| `scripts/verify-apk.js` | Post-build APK checks |
| `scripts/generate-akonta-launcher-icons.js` | Adaptive icon PNGs |
| `assets/` | Icon, splash, launcher foreground/background |
| `server/` | Voice ASR + API proxy (HF deploy, not APK) |

---

## Quick reference (copy-paste)

```bash
# Full local release build
cd ismart-market-app
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"
npm install
npm run build:apk:local
# → Akonta.apk

# After adding expo-secure-store or changing app.json plugins
npx expo prebuild --platform android --no-install
node scripts/patch-foojay-gradle.js
npm run build:apk:local
```

**Powered by iSMART · Akonta Market App**
