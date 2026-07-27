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

  const getKeycapStyle = (isSpecial = false, isAccent = false) => {
    if (isAccent) {
      return 'bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold shadow-md';
    }
    if (isSpecial) {
      return theme === 'light'
        ? 'bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold shadow-sm'
        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium border border-slate-700/60 shadow-sm';
    }
    return theme === 'light'
      ? 'bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 border border-slate-300/80 shadow-sm'
      : 'bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 text-slate-100 border border-slate-700/80 shadow-sm';
  };

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-2xl p-2.5 sm:p-4 border shadow-2xl transition-all ${getThemeContainerStyle()}`}>
      
      {/* Top Status Bar & Ethiopic Quick Punctuation Bar */}
      <div className="flex items-center justify-between mb-2.5 px-2 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-mono text-[11px]">
            Mode:
          </span>
          <span
            className={`px-2 py-0.5 rounded-md font-bold text-[11px] flex items-center space-x-1 ${
              languageMode === 'amharic'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {languageMode === 'amharic' ? (
              <>
                <Lock className="w-3 h-3" />
                <span>AMHARIC (Windows 10 Phonetic)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3" />
                <span>ENGLISH</span>
              </>
            )}
          </span>

          {currentBuffer && (
            <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[11px] font-mono border border-amber-500/30 animate-pulse">
              Buffer: "{currentBuffer}"
            </span>
          )}
        </div>

        {/* Amharic Punctuation Bar */}
        {languageMode === 'amharic' && (
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-slate-400 mr-1 hidden sm:inline">Punctuation:</span>
            {['፡', '።', '፥', '፤', '፧'].map((p) => (
              <button
                key={p}
                onClick={() => handleKeyClick(p)}
                className="px-2 py-1 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 rounded font-serif font-bold text-sm border border-slate-700 transition-all active:scale-95"
                title={`Insert Amharic punctuation ${p}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Keys Container */}
      <div className="flex flex-col space-y-1.5 sm:space-y-2 select-none">
        
        {/* ROW 1 */}
        <div className="flex justify-center space-x-1 sm:space-x-1.5">
          {(isSymbolMode ? numRow1 : row1).map((key) => {
            const displayLetter = isShiftActive ? key.toUpperCase() : key;
            const amharicPreview = languageMode === 'amharic' ? getAmharicKeycapPreview(key, isShiftActive) : '';
            
            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`flex-1 max-w-[44px] h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all duration-75 active:scale-95 ${getKeycapStyle()}`}
              >
                <span className="text-sm sm:text-base font-semibold leading-tight">
                  {displayLetter}
                </span>
                {amharicPreview && (
                  <span className="text-[10px] text-amber-400 font-serif font-bold leading-none -mt-0.5">
                    {amharicPreview}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ROW 2 */}
        <div className="flex justify-center space-x-1 sm:space-x-1.5 px-2 sm:px-4">
          {(isSymbolMode ? numRow2 : row2).map((key) => {
            const displayLetter = isShiftActive ? key.toUpperCase() : key;
            const amharicPreview = languageMode === 'amharic' ? getAmharicKeycapPreview(key, isShiftActive) : '';

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`flex-1 max-w-[44px] h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all duration-75 active:scale-95 ${getKeycapStyle()}`}
              >
                <span className="text-sm sm:text-base font-semibold leading-tight">
                  {displayLetter}
                </span>
                {amharicPreview && (
                  <span className="text-[10px] text-amber-400 font-serif font-bold leading-none -mt-0.5">
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
            className={`w-12 sm:w-16 h-11 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-75 active:scale-95 ${
              isShiftActive
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md ring-2 ring-amber-400/50'
                : getKeycapStyle(true)
            }`}
            title="Toggle Shift / Uppercase / Alternate Amharic"
          >
            <ArrowUp className={`w-4 h-4 ${isShiftActive ? 'stroke-[3]' : ''}`} />
          </button>

          {(isSymbolMode ? numRow3 : row3).map((key) => {
            const displayLetter = isShiftActive ? key.toUpperCase() : key;
            const amharicPreview = languageMode === 'amharic' ? getAmharicKeycapPreview(key, isShiftActive) : '';

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                className={`flex-1 max-w-[44px] h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center relative transition-all duration-75 active:scale-95 ${getKeycapStyle()}`}
              >
                <span className="text-sm sm:text-base font-semibold leading-tight">
                  {displayLetter}
                </span>
                {amharicPreview && (
                  <span className="text-[10px] text-amber-400 font-serif font-bold leading-none -mt-0.5">
                    {amharicPreview}
                  </span>
                )}
              </button>
            );
          })}

          {/* Backspace Button */}
          <button
            onClick={handleBackspaceClick}
            className={`w-12 sm:w-16 h-11 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-75 active:scale-95 ${getKeycapStyle(true)}`}
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* ROW 4 (Bottom Action Row: 123 | DEDICATED LANG LOCK | SPACE | ENTER) */}
        <div className="flex justify-center space-x-1.5 sm:space-x-2 pt-1">
          
          {/* Symbol Mode Toggle */}
          <button
            onClick={() => setIsSymbolMode(!isSymbolMode)}
            className={`w-14 sm:w-16 h-11 sm:h-12 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center transition-all duration-75 active:scale-95 ${getKeycapStyle(true)}`}
          >
            {isSymbolMode ? 'ABC' : '?123'}
          </button>

          {/* DEDICATED LANGUAGE LOCKING BUTTON */}
          <button
            id="virtual-keyboard-lang-lock-btn"
            onClick={handleLangLockClick}
            className={`px-3 sm:px-4 h-11 sm:h-12 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all duration-100 active:scale-95 shadow-md border ${
              languageMode === 'amharic'
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/40 font-extrabold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Dedicated Language Lock Toggle Button"
          >
            {languageMode === 'amharic' ? (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden xs:inline">🔒 AMHARIC LOCKED</span>
                <span className="xs:hidden">🔒 AM</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden xs:inline">🔓 LANG LOCK</span>
                <span className="xs:hidden">🔓 EN</span>
              </>
            )}
          </button>

          {/* Spacebar */}
          <button
            onClick={handleSpaceClick}
            className={`flex-1 h-11 sm:h-12 rounded-xl flex items-center justify-center space-x-1 text-xs font-medium transition-all duration-75 active:scale-98 ${getKeycapStyle()}`}
          >
            <Space className="w-4 h-4 opacity-40" />
            <span className="text-xs text-slate-400">
              {languageMode === 'amharic' ? 'አማርኛ (Space)' : 'English (Space)'}
            </span>
          </button>

          {/* Enter Button */}
          <button
            onClick={handleEnterClick}
            className={`w-14 sm:w-20 h-11 sm:h-12 rounded-xl font-bold text-xs flex items-center justify-center space-x-1 transition-all duration-75 active:scale-95 ${getKeycapStyle(false, true)}`}
          >
            <CornerDownLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Enter</span>
          </button>

        </div>
      </div>
    </div>
  );
};
