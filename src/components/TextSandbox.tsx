import React, { useState } from 'react';
import { Copy, Trash2, Volume2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { LanguageMode, ThemeMode } from '../types';

interface TextSandboxProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  currentBuffer: string;
  languageMode: LanguageMode;
  onToggleLanguageLock: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  theme?: ThemeMode;
}

export const TextSandbox: React.FC<TextSandboxProps> = ({
  text,
  setText,
  currentBuffer,
  languageMode,
  onToggleLanguageLock,
  inputRef,
  theme = 'light',
}) => {
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSpeak = () => {
    if (!text) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languageMode === 'amharic' ? 'am-ET' : 'en-US';
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setSpeaking(false);
    }
  };

  const insertSampleText = (sample: string) => {
    setText((prev) => prev + (prev ? ' ' : '') + sample);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-2xl p-4 sm:p-6 shadow-xs space-y-4 border transition-colors ${
      theme === 'light'
        ? 'bg-white border-slate-200 text-slate-800'
        : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      
      {/* Editor Header & Actions */}
      <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
        theme === 'light' ? 'border-slate-100' : 'border-slate-800'
      }`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-base shadow-xs">
            አ
          </div>
          <div>
            <h2 className={`text-sm sm:text-base font-semibold ${
              theme === 'light' ? 'text-slate-800' : 'text-slate-100'
            }`}>
              Amharic Notes & Editor
            </h2>
            <p className="text-[10px] text-slate-400">
              Editing now • English & Amharic (Windows 10 Phonetic)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Copy typed text to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleSpeak}
            disabled={!text || speaking}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Read out text using Speech Synthesis"
          >
            <Volume2 className={`w-3.5 h-3.5 ${speaking ? 'text-blue-600 animate-bounce' : 'text-slate-400'}`} />
            <span>{speaking ? 'Reading...' : 'Speak'}</span>
          </button>

          <button
            onClick={handleClear}
            disabled={!text}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 border-slate-200'
                : 'bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border-slate-700'
            }`}
            title="Clear editor contents"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            languageMode === 'amharic'
              ? 'Type here to test phonetic combinations (e.g. h + e = ሀ, s + u = ሱ, c + h = ቸ)...'
              : 'Type here using physical keyboard or virtual soft keyboard below...'
          }
          className={`w-full h-36 sm:h-44 p-4 rounded-xl text-lg sm:text-xl font-serif leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none shadow-xs border ${
            theme === 'light'
              ? 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              : 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
          }`}
        />

        {/* Live Active Buffer Status Badge */}
        {currentBuffer && (
          <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-mono font-bold shadow-md flex items-center space-x-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Composition Buffer: "{currentBuffer}"</span>
          </div>
        )}
      </div>

      {/* Footer Info & Quick Sample Loader */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
        
        {/* Quick Sample Chips */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Quick Test Samples:</span>
          {[
            { label: 'ሰላም', value: 'ሰላም' },
            { label: 'ኢትዮጵያ', value: 'ኢትዮጵያ' },
            { label: 'አመሰግናለሁ', value: 'አመሰግናለሁ' },
            { label: 'እውነት', value: 'እውነት' },
          ].map((sample) => (
            <button
              key={sample.label}
              onClick={() => insertSampleText(sample.value)}
              className={`px-3 py-1 rounded-lg text-xs font-serif transition-all active:scale-95 border ${
                theme === 'light'
                  ? 'bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 border-blue-200/80 shadow-2xs font-medium'
                  : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border-slate-700'
              }`}
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Character Counter */}
        <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
          <span>Characters: {text.length}</span>
          <span>Words: {text.trim() ? text.trim().split(/\s+/).length : 0}</span>
        </div>

      </div>
    </div>
  );
};
