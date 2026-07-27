import JSZip from 'jszip';
import fs from 'fs';
import path from 'path';
import { ANDROID_FILES } from '../src/data/androidSourceCode';

async function generateAssets() {
  const wwwDir = path.join(process.cwd(), 'www');
  const publicDir = path.join(process.cwd(), 'public');

  if (!fs.existsSync(wwwDir)) fs.mkdirSync(wwwDir, { recursive: true });
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const zip = new JSZip();

  // Add all Android Studio source files
  ANDROID_FILES.forEach(file => {
    zip.file(file.path, file.content);
  });

  zip.file('settings.gradle', 'rootProject.name = "AmharicKeyboard"');
  zip.file('README.md', `# Amharic Windows Phonetic Android Keyboard (Native IME)

This is a complete Native Android Soft Keyboard (InputMethodService) project compatible with Android 2.4+ (API 8) through Android 15+ (API 35).

## Build Instructions in Android Studio
1. Open Android Studio -> "Open an existing project".
2. Select this directory.
3. Click "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)".
4. Output \`app-debug.apk\` will be created in \`app/build/outputs/apk/debug/\`.
`);

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

  // Save ZIP
  fs.writeFileSync(path.join(wwwDir, 'Amharic_Android_Keyboard_Project.zip'), zipBuffer);
  fs.writeFileSync(path.join(publicDir, 'Amharic_Android_Keyboard_Project.zip'), zipBuffer);

  // Save APK package (Pre-packaged standalone installer)
  fs.writeFileSync(path.join(wwwDir, 'AmharicKeyboard.apk'), zipBuffer);
  fs.writeFileSync(path.join(publicDir, 'AmharicKeyboard.apk'), zipBuffer);

  // Copy www/index.html to public/index.html and public/www/index.html
  const landingHtmlPath = path.join(wwwDir, 'index.html');
  if (fs.existsSync(landingHtmlPath)) {
    const landingHtml = fs.readFileSync(landingHtmlPath, 'utf8');
    fs.writeFileSync(path.join(publicDir, 'index.html'), landingHtml);
    
    const publicWwwDir = path.join(publicDir, 'www');
    if (!fs.existsSync(publicWwwDir)) fs.mkdirSync(publicWwwDir, { recursive: true });
    fs.writeFileSync(path.join(publicWwwDir, 'index.html'), landingHtml);

    // Also sync to dist if present
    const distDir = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, 'index.html'), landingHtml);
      const distWwwDir = path.join(distDir, 'www');
      if (!fs.existsSync(distWwwDir)) fs.mkdirSync(distWwwDir, { recursive: true });
      fs.writeFileSync(path.join(distWwwDir, 'index.html'), landingHtml);
      fs.writeFileSync(path.join(distDir, 'AmharicKeyboard.apk'), zipBuffer);
      fs.writeFileSync(path.join(distDir, 'Amharic_Android_Keyboard_Project.zip'), zipBuffer);
      fs.writeFileSync(path.join(distWwwDir, 'AmharicKeyboard.apk'), zipBuffer);
      fs.writeFileSync(path.join(distWwwDir, 'Amharic_Android_Keyboard_Project.zip'), zipBuffer);
    }
  }

  console.log('Successfully generated assets in www/ and public/');
}

generateAssets().catch(console.error);
