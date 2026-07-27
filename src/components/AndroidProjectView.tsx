import React, { useState } from 'react';
import { Smartphone, Copy, Check, Download, Code, PackageCheck, FileArchive } from 'lucide-react';
import JSZip from 'jszip';
import { ANDROID_FILES } from '../data/androidSourceCode';

export const AndroidProjectView: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);

  const currentFile = ANDROID_FILES[activeFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([currentFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    setZipping(true);
    try {
      const zip = new JSZip();

      // Add all project files into zip structure
      ANDROID_FILES.forEach(file => {
        zip.file(file.path, file.content);
      });

      // Add settings.gradle
      zip.file('settings.gradle', 'rootProject.name = "AmharicKeyboard"');

      // Add README.md
      const readmeContent = `# Amharic Windows Phonetic Android Keyboard (Native Kotlin & Java IME)

This is a complete Native Android Soft Keyboard (InputMethodService) project written in Kotlin and Java, compatible with Android 2.4+ (API 8) through Android 15+ (API 35).

## Included Source Files
- Native Kotlin \`InputMethodService\` (\`AmharicIME.kt\`)
- Pure Kotlin Windows 10 Amharic Phonetic Composition Engine (\`PhoneticEngineKt.kt\`)
- Native Java \`InputMethodService\` (\`AmharicIME.java\`)
- Pure Java Windows 10 Amharic Phonetic Composition Engine (\`PhoneticEngine.java\`)
- Dedicated Language Locking Button (Key Code -101)
- Ultra-lightweight APK size (< 1.2 MB)

## How to Build APK in Android Studio
1. Open Android Studio -> Select "Open an existing project".
2. Select this unzipped project folder.
3. Wait for Gradle sync to complete.
4. Click "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)".
5. The compiled \`app-debug.apk\` will be located in \`app/build/outputs/apk/debug/\`.
6. Install on any Android phone or emulator (\`adb install app-debug.apk\`)!
`;
      zip.file('README.md', readmeContent);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Amharic_Android_Keyboard_Project.zip';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create project ZIP:', err);
    } finally {
      setZipping(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Native Android Keyboard Source Code (Kotlin & Java)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete Native Kotlin, Java & XML <code className="text-blue-400">InputMethodService</code> for building real Android <code className="text-blue-400">.apk</code> installables in Android Studio.
          </p>
        </div>

        {/* Action: Zip Download */}
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={handleDownloadZip}
            disabled={zipping}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <FileArchive className="w-4 h-4" />
            <span>{zipping ? 'Packaging ZIP...' : 'Download Android Studio Project (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-4 text-xs text-blue-200 space-y-2">
        <div className="flex items-center space-x-2 font-bold text-blue-300">
          <PackageCheck className="w-4 h-4 text-blue-400" />
          <span>How to build your real Native Android Keyboard APK:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-300 leading-relaxed pl-1">
          <li>Click <strong className="text-white">"Download Android Studio Project (.zip)"</strong> above to download the full Kotlin/Java + XML source repository.</li>
          <li>Unzip the archive on your computer and open it in <strong className="text-white">Android Studio</strong> (or VS Code with Gradle plugin).</li>
          <li>In Android Studio, click <strong className="text-white">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>.</li>
          <li>Transfer the output <code className="text-blue-300">app-debug.apk</code> file to your Android phone to install the real system keyboard!</li>
        </ol>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
        {ANDROID_FILES.map((file, idx) => (
          <button
            key={file.filename}
            onClick={() => setActiveFileIndex(idx)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeFileIndex === idx
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{file.filename}</span>
          </button>
        ))}
      </div>

      {/* Current File Description & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="text-xs font-mono font-bold text-blue-400 block">
            {currentFile.path}
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentFile.description}
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {currentFile.filename}</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed select-text">
          <code>{currentFile.content}</code>
        </pre>
      </div>

    </div>
  );
};
