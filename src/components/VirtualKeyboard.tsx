import React, { useState } from 'react';
import { Lock, Unlock, Delete, CornerDownLeft, Space, ArrowUp } from 'lucide-react';
import { LanguageMode, ThemeMode } from '../types';
import { getAmharicKeycapPreview } from '../engine/amharicPhoneticEngine';

interface VirtualKeyboardProps {
  languageMode: LanguageMode;
  onToggleLanguageLock: () => void;
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onSpace: () => void;
  currentBuffer: string;
  theme: ThemeMode;
  soundEnabled: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  languageMode,
  onToggleLanguageLock,
  onKeyPress,
  onBackspace,
  onEnter,
  onSpace,
  currentBuffer,
  theme,
  soundEnabled,
}) => {
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isSymbolMode, setIsSymbolMode] = useState(false);

  // Play subtle keypress audio via Web Audio API if enabled
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // Ignore audio context autoplay restriction
    }
  };

  const handleKeyClick = (key: string) => {
    playClickSound();
    let charToSend = key;
    if (isShiftActive && key.length === 1 && /[a-z]/i.test(key)) {
      charToSend = key.toUpperCase();
      setIsShiftActive(false); // Reset single shift
    }
    onKeyPress(charToSend);
  };

  const handleShiftClick = () => {
    playClickSound();
    setIsShiftActive(!isShiftActive);
  };

  const handleBackspaceClick = () => {
    playClickSound();
    onBackspace();
  };

  const handleSpaceClick = () => {
    playClickSound();
    onSpace();
  };

  const handleEnterClick = () => {
    playClickSound();
    onEnter();
  };

  const handleLangLockClick = () => {
    playClickSound();
    onToggleLanguageLock();
  };

  // Keyboard Rows definition
  const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
  const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

  const numRow1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const numRow2 = ['@', '#', '$', '%', '&', '-', '+', '(', ')'];
  const numRow3 = ['*', '"', "'", ':', ';', '!', '?'];

  // Theme-specific CSS classes
  const getThemeContainerStyle = () => {
    switch (theme) {
      case 'light':
        return 'bg-slate-200 border-slate-300 text-slate-800';
      case 'retro-gingerbread':
        return 'bg-zinc-900 border-amber-600/40 text-amber-100 shadow-[0_0_15px_rgba(217,119,6,0.15)]';
      case 'material-blue':
        return 'bg-slate-900 border-blue-500/40 text-blue-100';
      case 'dark':
      default:
        return 'bg-slate-900/95 border-slate-800 text-slate-100';
    }
  };

  const getKeycapStyle = (isSpecial = false, isAccent = false, isVowel = false) => {
    if (isAccent) {
      return 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold shadow-md';
    }
    if (isSpecial) {
      return theme === 'light'
        ? 'bg-slate-300 hover:bg-slate-350 active:bg-slate-400 text-slate-700 font-bold shadow-xs'
        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700/60 shadow-sm';
    }
    return theme === 'light'
      ? `bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200/80 shadow-xs ${isVowel ? 'text-blue-600 font-bold' : 'text-slate-700 font-medium'}`
      : `bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/80 shadow-sm ${isVowel ? 'text-amber-300 font-bold' : 'text-slate-100 font-medium'}`;
  };

  const isVowelKey = (key: string) => ['e', 't', 'u', 'i', 'o', 'a'].includes(key.toLowerCase());

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-2xl p-2.5 sm:p-4 border transition-all ${
      theme === 'light'
        ? 'bg-slate-200 border-slate-300 text-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]'
        : getThemeContainerStyle()
    }`}>
      
      {/* Candidates & Suggestions Bar */}
      <div className={`h-10 flex gap-2 sm:gap-4 items-center justify-between px-3 sm:px-4 mb-2 rounded-xl border ${
        theme === 'light' ? 'bg-white/80 border-slate-250 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono opacity-60 uppercase tracking-wider hidden xs:inline">Suggestions:</span>
          <div className="flex gap-3 sm:gap-6 items-center text-xs sm:text-sm">
            <span
              onClick={() => handleKeyClick('ሰላም')}
              className="hover:text-blue-600 cursor-pointer font-serif transition-colors"
            >
              ሰላም
            </span>
            <span
              onClick={() => handleKeyClick('እውነት')}
              className="font-bold border-x border-slate-300 dark:border-slate-700 px-4 sm:px-6 cursor-pointer hover:text-blue-600 transition-colors font-serif"
            >
              እውነት
            </span>
            <span
              onClick={() => handleKeyClick('ኢትዮጵያ')}
              className="hover:text-blue-600 cursor-pointer font-serif transition-colors hidden xs:inline"
            >
              ኢትዮጵያ
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {currentBuffer ? (
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[11px] font-mono font-bold shadow-xs animate-pulse">
              Buffer: "{currentBuffer}"
            </span>
          ) : (
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
              languageMode === 'amharic' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {languageMode === 'amharic' ? 'Locked (Phonetic)' : 'English'}
            </span>
          )}
        </div>
      </div>

      {/* Ethiopic Quick Punctuation Bar (When Amharic Active) */}
      {languageMode === 'amharic' && (
        <div className="flex items-center justify-between mb-2 px-2 text-xs">
          <span className="text-[10px] text-slate-500 font-mono">Ethiopic Punctuation:</span>
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {['፡', '።', '፥', '፤', '፧'].map((p) => (
              <button
                key={p}
                onClick={() => handleKeyClick(p)}
                className={`px-2.5 py-1 rounded font-serif font-bold text-sm border transition-all active:scale-95 ${
                  theme === 'light'
                    ? 'bg-white hover:bg-blue-600 hover:text-white text-slate-800 border-slate-300 shadow-xs'
                    : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border-slate-700'
                }`}
                title={`Insert Amharic punctuation ${p}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Keys Container */}
      <div className="flex flex-col space-y-1.5 sm:space-y-2 select-none">
        
        {/* ROW 1 */}
        <div className="flex justify-center space-x-1 sm:space-x-1.5">
          {(isSymbolMode ? numRow1 : row1).map((key) => {
            const displayLetter = isShiftActive ? key.toUpperCase() : key;
            const amharicPreview = languageMode === 'amharic' ? getAmharicKeycapPreview(key, isShiftActive) : '';
            const isVowel = isVowelKey(key);

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`flex-1 max-w-[44px] h-12 sm:h-14 rounded-lg sm:rounded-xl flex flex-col items-center justify-center relative transition-all duration-75 active:scale-95 ${getKeycapStyle(false, false, isVowel)}`}
              >
                <span className={`text-sm sm:text-lg font-medium leading-tight ${
                  isVowel && theme === 'light' ? 'text-blue-600 font-bold' : ''
                }`}>
                  {displayLetter}
                </span>
                {amharicPreview && (
                  <span className={`text-[10px] font-serif font-bold leading-none -mt-0.5 ${
                    theme === 'light' ? 'text-blue-600' : 'text-amber-400'
                  }`}>
                    {amharicPreview}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ROW 2 */}
        <div className="flex justify-center space-x-1 sm:space-x-1.5 px-1 sm:px-2">
          {(isSymbolMode ? numRow2 : row2).map((key) => {
            const displayLetter = isShiftActive ? key.toUpperCase() : key;
            const amharicPreview = languageMode === 'amharic' ? getAmharicKeycapPreview(key, isShiftActive) : '';
            const isVowel = isVowelKey(key);

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`flex-1 max-w-[44px] h-12 sm:h-14 rounded-lg sm:rounded-xl flex flex-col items-center justify-center relative transition-all duration-75 active:scale-95 ${getKeycapStyle(false, false, isVowel)}`}
              >
                <span className={`text-sm sm:text-lg font-medium leading-tight ${
                  isVowel && theme === 'light' ? 'text-blue-600 font-bold' : ''
                }`}>
                  {displayLetter}
                </span>
                {amharicPreview && (
                  <span className={`text-[10px] font-serif font-bold leading-none -mt-0.5 ${
                    theme === 'light' ? 'text-blue-600' : 'text-amber-400'
                  }`}>
                    {amharicPreview}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ROW 3 (Shift + Z-M + Backspace) */}
        <div className="flex justify-center space-x-1 sm:space-x-1.5">
          {/* Shift Button */}
          <button
            onClick={handleShiftClick}
            className={`w-14 sm:w-20 h-12 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-75 active:scale-95 ${
              isShiftActive
                ? 'bg-blue-600 text-white font-bold shadow-md border-2 border-blue-400'
                : getKeycapStyle(true)
            }`}
            title="Toggle Shift / Uppercase / Alternate Amharic"
          >
            <span className="text-xs font-bold uppercase tracking-tighter sm:inline hidden">Shift</span>
            <ArrowUp className={`w-4 h-4 sm:ml-1 ${isShiftActive ? 'stroke-[3]' : ''}`} />
          </button>

          {(isSymbolMode ? numRow3 : row3).map((key) => {
            const displayLetter = isShiftActive ? key.toUpperCase() : key;
            const amharicPreview = languageMode === 'amharic' ? getAmharicKeycapPreview(key, isShiftActive) : '';
            const isVowel = isVowelKey(key);

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`flex-1 max-w-[44px] h-12 sm:h-14 rounded-lg sm:rounded-xl flex flex-col items-center justify-center relative transition-all duration-75 active:scale-95 ${getKeycapStyle(false, false, isVowel)}`}
              >
                <span className={`text-sm sm:text-lg font-medium leading-tight ${
                  isVowel && theme === 'light' ? 'text-blue-600 font-bold' : ''
                }`}>
                  {displayLetter}
                </span>
                {amharicPreview && (
                  <span className={`text-[10px] font-serif font-bold leading-none -mt-0.5 ${
                    theme === 'light' ? 'text-blue-600' : 'text-amber-400'
                  }`}>
                    {amharicPreview}
                  </span>
                )}
              </button>
            );
          })}

          {/* Backspace Button */}
          <button
            onClick={handleBackspaceClick}
            className={`w-14 sm:w-20 h-12 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-75 active:scale-95 ${getKeycapStyle(true)}`}
            title="Backspace"
          >
            <span className="text-xl">⌫</span>
          </button>
        </div>

        {/* ROW 4 (Function Row: ?123 | LANGUAGE LOCK BUTTON | SPACE | RETURN) */}
        <div className="flex justify-center space-x-1.5 sm:space-x-2 pt-1">
          
          {/* Symbol Mode Toggle */}
          <button
            onClick={() => setIsSymbolMode(!isSymbolMode)}
            className={`w-16 sm:w-20 h-12 sm:h-14 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all duration-75 active:scale-95 ${getKeycapStyle(true)}`}
          >
            {isSymbolMode ? 'ABC' : '?123'}
          </button>

          {/* DEDICATED LANGUAGE LOCKING BUTTON (Clean Minimalism Mockup Style) */}
          <button
            id="virtual-keyboard-lang-lock-btn"
            onClick={handleLangLockClick}
            className={`w-20 sm:w-28 h-12 sm:h-14 rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all duration-100 active:scale-95 shadow-md border-2 cursor-pointer ${
              languageMode === 'amharic'
                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-400'
                : 'bg-slate-300 hover:bg-slate-400 text-slate-700 border-slate-400'
            }`}
            title="Dedicated Language Lock Toggle Button"
          >
            <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider leading-none opacity-90">
              {languageMode === 'amharic' ? 'Locked' : 'Unlocked'}
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-tight mt-0.5">
              {languageMode === 'amharic' ? 'አማርኛ' : 'English'}
            </span>
          </button>

          {/* Spacebar */}
          <button
            onClick={handleSpaceClick}
            className={`flex-1 h-12 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-75 active:scale-98 ${
              theme === 'light'
                ? 'bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shadow-sm'
            }`}
          >
            <Space className="w-4 h-4 opacity-40 mr-1 hidden sm:inline" />
            <span>Space</span>
          </button>

          {/* Return / Enter Button */}
          <button
            onClick={handleEnterClick}
            className={`w-20 sm:w-32 h-12 sm:h-14 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center space-x-1 transition-all duration-75 active:scale-95 ${
              theme === 'light'
                ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-xs'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
            }`}
          >
            <CornerDownLeft className="w-4 h-4 mr-1 hidden sm:inline" />
            <span>Return</span>
          </button>

        </div>
      </div>
    </div>
  );
};
