# Haki APK — Local Gradle Build Guide

Complete reference for building the **Haki** APK locally using Gradle on Windows.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Project Configuration](#3-project-configuration)
4. [Build Steps](#4-build-steps)
5. [CMake/Ninja Fix (Windows)](#5-cmakeninja-fix-windows)
6. [Troubleshooting](#6-troubleshooting)
7. [Output](#7-output)

---

## 1. Prerequisites

### Installed Tools

| Tool | Version | Path | Status |
|------|---------|------|--------|
| **Java JDK** | 17.0.19 (Temurin) | `C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot` | ✅ Installed via `winget install EclipseAdoptium.Temurin.17.JDK` |
| **Android SDK** | API 34 + Build-Tools 34.0.0 | `C:\Android\android-sdk` | ✅ Installed via `sdkmanager` |
| **Android NDK** | 26.1.10909125 | `C:\Android\android-sdk\ndk\26.1.10909125` | ✅ Installed via `sdkmanager` |
| **CMake** | 3.22.1 | `C:\Android\android-sdk\cmake\3.22.1` | ✅ Bundled with SDK |
| **Node.js** | 18+ | System default | ✅ Pre-installed |
| **npm** | With Node | — | ✅ Pre-installed |

### Environment Variables

```powershell
# Set these in PowerShell before building:
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "C:\Android\android-sdk"
```

To make them permanent:
```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot", "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\android-sdk", "User")
```

---

## 2. Environment Setup

### Step 1: Install Java JDK 17

```powershell
winget install EclipseAdoptium.Temurin.17.JDK --accept-source-agreements --accept-package-agreements
```

Verify:
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:Path += ";$env:JAVA_HOME\bin"
java -version
# Should show: openjdk version "17.0.19"
```

### Step 2: Install Android SDK Command-Line Tools

```powershell
# Create SDK directory
New-Item -ItemType Directory -Force -Path "C:\Android\android-sdk\cmdline-tools"

# Download command-line tools
Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile "$env:TEMP\cmdline-tools.zip" -UseBasicParsing

# Extract
Expand-Archive -Path "$env:TEMP\cmdline-tools.zip" -DestinationPath "C:\Android\android-sdk\cmdline-tools" -Force

# Move to 'latest' directory (required by sdkmanager)
Move-Item "C:\Android\android-sdk\cmdline-tools\cmdline-tools" "C:\Android\android-sdk\cmdline-tools\latest"
```

### Step 3: Install SDK Platform, Build-Tools, and NDK

```powershell
$sdkmanager = "C:\Android\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat"

# Install platform and build-tools
& $sdkmanager "platforms;android-34" "build-tools;34.0.0" --sdk_root="C:\Android\android-sdk"

# Install NDK (required for expo-av native module)
& $sdkmanager "ndk;26.1.10909125" --sdk_root="C:\Android\android-sdk"
```

### Step 4: Set Environment Variables

```powershell
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot", "User")
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Android\android-sdk", "User")
```

---

## 3. Project Configuration

### App Details

| Property | Value |
|----------|-------|
| **App Name** | Haki |
| **Package ID** | `com.ajawhary.haki` |
| **Expo SDK** | ~51.0.0 |
| **React Native** | 0.74.5 |
| **React** | 18.2.0 |

### Files Modified for Rebranding

- `mobile/app.json` — name: "Haki", slug: "haki-audio-transcriber", android.package: "com.ajawhary.haki"
- `mobile/package.json` — name: "haki-audio-transcriber"
- `mobile/src/screens/HomeScreen.js` — header title: "Haki"
- `mobile/src/screens/SettingsScreen.js` — about section: "Haki"

### Generate Native Android Project

```powershell
cd mobile
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "C:\Android\android-sdk"
npx expo prebuild --platform android --no-install
```

This creates the `mobile/android/` folder with the Gradle project.

### Create local.properties

Create `mobile/android/local.properties`:
```properties
sdk.dir=C\:\\Android\\android-sdk
```

---

## 4. Build Steps

### Standard Build

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "C:\Android\android-sdk"
cd mobile\android
.\gradlew assembleRelease --no-daemon
```

### Clean Build

```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "C:\Android\android-sdk"
cd mobile\android
.\gradlew --stop
.\gradlew clean
.\gradlew assembleRelease --no-daemon
```

---

## 5. CMake/Ninja Fix (Windows)

### The Problem

On Windows, the `expo-av` module's CMake build enters an infinite regeneration loop:

```
ninja: error: manifest 'build.ninja' still dirty after 100 tries
```

This is a **known Windows-specific bug** with CMake + Ninja. It does not occur on macOS or Linux.

### The Fix

**Option A: Suppress CMake Regeneration**

Manually configure CMake with `CMAKE_SUPPRESS_REGENERATION=ON`:

```powershell
$env:ANDROID_HOME = "C:\Android\android-sdk"
$CMAKE = "$env:ANDROID_HOME\cmake\3.22.1\bin\cmake.exe"
$NINJA = "$env:ANDROID_HOME\cmake\3.22.1\bin\ninja.exe"
$NDK = "$env:ANDROID_HOME\ndk\26.1.10909125"

$SRC_DIR = "mobile\node_modules\expo-av\android"
$BUILD_DIR = "$SRC_DIR\.cxx\RelWithDebInfo\4o2t6971\arm64-v8a"

# Clean cache
Remove-Item -Recurse -Force $BUILD_DIR -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $BUILD_DIR | Out-Null

# Configure CMake with suppression flag
& $CMAKE -H"$SRC_DIR" -B"$BUILD_DIR" `
  -DANDROID_ABI=arm64-v8a `
  -DANDROID_PLATFORM=24 `
  -DCMAKE_BUILD_TYPE=RelWithDebInfo `
  -DCMAKE_TOOLCHAIN_FILE="$NDK\build\cmake\android.toolchain.cmake" `
  -DCMAKE_MAKE_PROGRAM="$NINJA" `
  -DCMAKE_SUPPRESS_REGENERATION=ON `
  -G"Ninja"

# Build with Ninja
& $NINJA -C "$BUILD_DIR"
```

**Option B: Build in Debug Mode**

If release build fails, try debug:
```powershell
.\gradlew assembleDebug --no-daemon
```

**Option C: Remove expo-av (if CMake can't be fixed)**

Remove the audio recording module that requires CMake:
```powershell
cd mobile
npm uninstall expo-av
npx expo prebuild --platform android --no-install
cd android
.\gradlew assembleRelease --no-daemon
```

Note: This removes audio recording functionality. File upload still works.

---

## 6. Troubleshooting

### "JAVA_HOME is set to an invalid directory"

Make sure the path has no trailing slash and exists:
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
Test-Path $env:JAVA_HOME  # Should return True
```

### "Unable to delete directory" (Gradle clean fails)

Kill the Gradle daemon first:
```powershell
.\gradlew --stop
Remove-Item -Recurse -Force "mobile\android\app\build" -ErrorAction SilentlyContinue
```

### "SDK not found"

Check `mobile/android/local.properties`:
```properties
sdk.dir=C\:\\Android\\android-sdk
```

### CMake "find_package" error

The NDK must be installed:
```powershell
& "C:\Android\android-sdk\cmdline-tools\latest\bin\sdkmanager.bat" "ndk;26.1.10909125" --sdk_root="C:\Android\android-sdk"
```

---

## 7. Output

### APK Location

```
mobile/android/app/build/outputs/apk/release/app-release.apk
```

### Install on Phone

1. Copy the APK to your phone (USB, WhatsApp, Drive)
2. Enable "Install from unknown sources" in Android settings
3. Open the APK file to install
4. Grant microphone permission when prompted

### Run the Backend

```powershell
cd backend
python main.py
```

The app connects to the backend at `http://192.168.4.136:8000` (configured in `mobile/src/config.js`).

---

## Build Status

| Step | Status | Notes |
|------|--------|-------|
| Java JDK 17 | ✅ Complete | Installed via winget |
| Android SDK | ✅ Complete | Platform 34, Build-Tools 34.0.0 |
| Android NDK | ✅ Complete | 26.1.10909125 |
| Environment Variables | ✅ Complete | JAVA_HOME, ANDROID_HOME set |
| App Rebranded | ✅ Complete | "Haki", package: com.ajawhary.haki |
| Expo Prebuild | ✅ Complete | android/ folder generated |
| local.properties | ✅ Complete | sdk.dir set |
| CMake/Ninja Fix | ✅ Complete | Added CMAKE_SUPPRESS_REGENERATION=ON to expo-av, expo-modules-core, react-native-screens |
| Project Moved from OneDrive | ✅ Complete | Moved to C:\Projects\AI-Twi-Audio-Transcriber to avoid file locking issues |
| APK Build | ✅ Complete | BUILD SUCCESSFUL in 8m 41s |
| APK Location | ✅ Complete | C:\Projects\AI-Twi-Audio-Transcriber\Haki.apk (66.5 MB) |

---

## Important Notes

### OneDrive Issue
**Problem:** The project was originally in OneDrive, which caused:
- File locking errors ("Unable to delete directory")
- Gradle cache corruption (metadata.bin missing)
- CMake/ninja infinite regeneration loops

**Solution:** Move the project to a local directory (e.g., `C:\Projects\`)

### CMake/Ninja Fix
Added `-DCMAKE_SUPPRESS_REGENERATION=ON` to the CMake arguments in:
- `mobile/node_modules/expo-av/android/build.gradle`
- `mobile/node_modules/expo-modules-core/android/build.gradle`
- `mobile/node_modules/react-native-screens/android/build.gradle`

This prevents the infinite regeneration loop on Windows.

---

*Last Updated: July 31, 2026*
*App: Haki — Twi Audio Transcriber*
