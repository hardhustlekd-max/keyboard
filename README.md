# Amharic Phonetic Keyboard for Android (Native Kotlin)

A native Android Input Method Service (IME) built entirely in **Kotlin** following the exact **Windows 10 Amharic Phonetic Keyboard layout specification**.

## 🚀 Automated APK Compilation (GitHub Actions)

This repository includes a GitHub Actions CI pipeline (`.github/workflows/build.yml`) that compiles valid native Android APKs directly from source using JDK 17, Android SDK, and Gradle.

### Download Compiled APKs:
- Go to the **[GitHub Actions Workflows Tab](https://github.com/hardhustlekd-max/keyboard/actions)**.
- Select the latest build run on `main`.
- Download `AmharicKeyboard-Debug-APK` or `AmharicKeyboard-Release-APK` from the **Artifacts** section at the bottom of the run page.

---

## 📱 Features

- **Native Android IME Service**: Registers seamlessly in Android System Settings as a full input method (`InputMethodService`).
- **Windows 10 Phonetic Deterministic Engine**: Implements the 7 Fidel order transformations (`ä`, `u`, `i`, `a`, `e`, `ə`, `o`), labialized combinations, punctuation, and numerals.
- **Pure Native Kotlin Architecture**: Clean, zero-dependency codebase ready for compilation in Android Studio or GitHub Actions.

## 📁 Repository Structure

```
.
├── .github/workflows/build.yml               # GitHub Actions CI build workflow
├── build.gradle.kts                          # Root Gradle build configuration
├── settings.gradle.kts                       # Project Gradle settings
├── gradle.properties                         # Gradle options
├── app/
│   ├── build.gradle.kts                      # App module build script
│   └── src/main/
│       ├── AndroidManifest.xml               # Android Manifest with IME service
│       ├── java/com/amharic/keyboard/        # Native Kotlin source code
│       │   ├── AmharicIME.kt                 # InputMethodService implementation
│       │   ├── PhoneticEngine.kt             # Phonetic lookup transformation
│       │   └── SettingsActivity.kt           # Setup Activity
│       └── res/                              # Layouts, themes, and keymaps
└── README.md
```

## 🛠️ How to Build in Android Studio

1. Clone this repository:
   ```bash
   git clone https://github.com/hardhustlekd-max/keyboard.git
   ```
2. Open the project in **Android Studio** (Giraffe, Hedgehog, or newer).
3. Allow Gradle to sync dependencies.
4. Select **Build > Build Bundle(s) / APK(s) > Build APK(s)** or run on an Android device (`Shift + F10`).
