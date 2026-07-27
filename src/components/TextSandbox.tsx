import React, { useState } from 'react';
import { Copy, Trash2, Volume2, Check, Sparkles, AlertCircle } from 'lucide-react';
import { LanguageMode } from '../types';

interface TextSandboxProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  currentBuffer: string;
  languageMode: LanguageMode;
  onToggleLanguageLock: () => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export const TextSandbox: React.FC<TextSandboxProps> = ({
  text,
  setText,
  currentBuffer,
  languageMode,
  onToggleLanguageLock,
  inputRef,
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
    <div className="w-full max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      
      {/* Editor Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="text-sm font-bold text-slate-200">
            Interactive Editor & Test Sandbox
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
            title="Copy typed text to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleSpeak}
            disabled={!text || speaking}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
            title="Read out text using Speech Synthesis"
          >
            <Volume2 className={`w-3.5 h-3.5 ${speaking ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            <span>{speaking ? 'Reading...' : 'Speak'}</span>
          </button>

          <button
            onClick={handleClear}
            disabled={!text}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 disabled:opacity-40 text-slate-300 text-xs font-semibold border border-slate-700 transition-all active:scale-95"
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
              ? '🔒 Amharic Language LOCKED: Type using QWERTY keys according to Windows 10 Amharic Phonetic combinations (e.g., s->ሰ, s+u->ሱ, ch->ቸ)...'
              : 'Type here using physical keyboard or virtual soft keyboard below...'
          }
          className="w-full h-36 sm:h-44 p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 font-serif text-lg sm:text-xl leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/60 transition-all resize-none shadow-inner"
        />

        {/* Live Active Buffer Status Badge */}
        {currentBuffer && (
          <div className="absolute bottom-3 left-3 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-mono font-bold shadow-lg flex items-center space-x-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active Composition Buffer: "{currentBuffer}"</span>
          </div>
        )}
      </div>

      {/* Footer Info & Quick Sample Loader */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
        
        {/* Quick Sample Chips */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500">Quick Test Samples:</span>
          {[
            { label: 'ሰላም (Hello)', value: 'ሰላም' },
            { label: 'ኢትዮጵያ (Ethiopia)', value: 'ኢትዮጵያ' },
            { label: 'አመሰግናለሁ (Thank you)', value: 'አመሰግናለሁ' },
            { label: 'መልካም ቀን (Good day)', value: 'መልካም ቀን' },
          ].map((sample) => (
            <button
              key={sample.label}
              onClick={() => insertSampleText(sample.value)}
              className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-serif transition-all border border-slate-700/80 active:scale-95"
            >
              + {sample.label}
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
