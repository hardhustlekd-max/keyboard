# Amharic Phonetic Keyboard for Android (Native Kotlin)

A native Android Input Method Service (IME) built entirely in **Kotlin** following the exact **Windows 10 Amharic Phonetic Keyboard layout specification**.

## 🚀 Direct APK Download Links

Download the pre-compiled, signed **3.9 MB Android APK** directly from GitHub:

- 📦 **[Download AmharicKeyboard.apk (Root Path)](https://github.com/hardhustlekd-max/keyboard/raw/main/AmharicKeyboard.apk)**
- 📁 **[Download Releases/AmharicKeyboard.apk](https://github.com/hardhustlekd-max/keyboard/raw/main/releases/AmharicKeyboard.apk)**
- 🛠️ **[Download app-release.apk (Gradle Build Output Path)](https://github.com/hardhustlekd-max/keyboard/raw/main/app/build/outputs/apk/release/app-release.apk)**

---

## 📱 Features

- **Native Android IME Service**: Registers seamlessly in Android System Settings as a full input method.
- **Windows 10 Phonetic Deterministic Engine**: Implements the 7 Fidel order transformations (`ä`, `u`, `i`, `a`, `e`, `ə`, `o`), labialized combinations, punctuation, and numerals.
- **2048-bit RSA Self-Signed APK**: Signed with a cryptographically valid v1 (JAR) PKCS7 signature block for direct installation on Android devices.
- **Full Asset & Ethiopic Font Package**: Includes complete Phonetic lookup database, Noto Sans Ethiopic typography, and AndroidX layout runtime.

## 📁 Repository Structure

```
.
├── AmharicKeyboard.apk                       # Direct Installable Signed APK (3.9 MB)
├── releases/
│   └── AmharicKeyboard.apk                   # Releases folder copy
├── app/
│   ├── build/outputs/apk/release/
│   │   ├── app-release.apk                   # Standard Android Studio Gradle output path
│   │   └── AmharicKeyboard.apk
│   ├── build.gradle.kts                      # App module build script
│   └── src/main/
│       ├── AndroidManifest.xml               # Android Manifest with IME service
│       └── java/com/amharic/keyboard/        # Native Kotlin source code
├── build.gradle.kts                          # Root Gradle build configuration
├── settings.gradle.kts                       # Project Gradle settings
└── README.md
```

## 🛠️ How to Build in Android Studio

1. Clone this repository:
   ```bash
   git clone https://github.com/hardhustlekd-max/keyboard.git
   ```
2. Open the project in **Android Studio** (Giraffe, Hedgehog, or newer).
3. Allow Gradle to sync dependencies.
4. Run on an Android device or emulator (`Shift + F10`).

## 📲 How to Install the APK Directly

1. Download `AmharicKeyboard.apk` from the root of this repository.
2. Open `AmharicKeyboard.apk` on your Android device (Android 5.0+).
3. Allow "Install from Unknown Sources" if prompted.
4. Launch "Amharic Keyboard Setup" app and tap:
   - **Step 1:** Enable Keyboard in System Settings.
   - **Step 2:** Switch Input Method to Amharic.
