import React, { useState } from 'react';
import { Smartphone, Copy, Check, Download, ShieldCheck, Zap, Code } from 'lucide-react';
import { ANDROID_FILES } from '../data/androidSourceCode';

export const AndroidProjectView: React.FC = () => {
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              Android Soft Keyboard Project (Android 2.4+ to 15+)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete, well-commented native Java & XML input method source code ready for Android Studio or Gradle compilation.
          </p>
        </div>

        {/* Footprint & Compatibility Badges */}
        <div className="flex items-center space-x-2 flex-wrap text-xs">
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>minSdk 8 (Android 2.4+)</span>
          </div>
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>&lt; 1.2MB Lightweight APK</span>
          </div>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
        {ANDROID_FILES.map((file, idx) => (
          <button
            key={file.filename}
            onClick={() => setActiveFileIndex(idx)}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium transition-all whitespace-nowrap flex items-center space-x-1.5 ${
              activeFileIndex === idx
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
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
          <span className="text-xs font-mono font-bold text-amber-400 block">
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
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownloadFile}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all active:scale-95 shadow-sm"
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
