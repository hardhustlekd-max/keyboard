import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { TextSandbox } from './components/TextSandbox';
import { KeyCombinationGuide } from './components/KeyCombinationGuide';
import { AndroidProjectView } from './components/AndroidProjectView';
import { GithubSync } from './components/GithubSync';
import { LanguageMode, ThemeMode } from './types';
import { processAmharicKey } from './engine/amharicPhoneticEngine';
import { Lock, Sparkles, Smartphone, ShieldCheck, Zap } from 'lucide-react';

export default function App() {
  const [languageMode, setLanguageMode] = useState<LanguageMode>('english');
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'simulator' | 'guide' | 'android-source' | 'github'>('simulator');
  
  // Editor State
  const [text, setText] = useState<string>('');
  const [currentBuffer, setCurrentBuffer] = useState<string>('');
  
  // GitHub Push State
  const [githubPushed, setGithubPushed] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Toggle Language Locking state
  const handleToggleLanguageLock = () => {
    setLanguageMode((prev) => {
      const next = prev === 'english' ? 'amharic' : 'english';
      setCurrentBuffer(''); // Clear buffer on mode switch
      return next;
    });
  };

  // Handle Keypress from Virtual Soft Keyboard or Physical Hardware Keyboard
  const handleKeyPress = (key: string) => {
    if (languageMode === 'amharic') {
      // Process key using Windows 10 Amharic Phonetic composition engine
      const res = processAmharicKey(key, currentBuffer);
      
      setText((prevText) => {
        // If there was an uncommitted buffer, replace the trailing characters
        const base = res.replaceLength > 0 ? prevText.slice(0, -res.replaceLength) : prevText;
        return base + res.outputChar;
      });

      setCurrentBuffer(res.newBuffer);
    } else {
      // Standard English typing
      setText((prevText) => prevText + key);
      setCurrentBuffer('');
    }
  };

  const handleBackspace = () => {
    if (currentBuffer.length > 0) {
      setCurrentBuffer('');
    }
    setText((prev) => prev.slice(0, -1));
  };

  const handleEnter = () => {
    setCurrentBuffer('');
    setText((prev) => prev + '\n');
  };

  const handleSpace = () => {
    setCurrentBuffer('');
    setText((prev) => prev + ' ');
  };

  // Listen to physical hardware keyboard typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore control/alt/meta/function keys
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) {
        if (e.key === 'Backspace') {
          // Allow normal backspace behavior
          return;
        }
        if (e.key === 'Enter') {
          return;
        }
        return;
      }

      // If user is focused inside a search input or another form field, ignore
      const activeElement = document.activeElement;
      if (activeElement && activeElement.tagName === 'INPUT') {
        return;
      }

      // If in Amharic mode, intercept physical key typing for Windows 10 Amharic Phonetic composition
      if (languageMode === 'amharic') {
        e.preventDefault();
        handleKeyPress(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [languageMode, currentBuffer]);

  // Trigger GitHub push API call
  const handleSyncGithub = async () => {
    setIsPushing(true);
    setPushError(null);
    try {
      const response = await fetch('/api/github-push', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setGithubPushed(true);
      } else {
        setPushError(data.error || 'Failed to push to GitHub');
      }
    } catch (err: any) {
      setPushError(err.message || 'Error connecting to server for GitHub push');
    } finally {
      setIsPushing(false);
    }
  };

  // Auto push to GitHub on initial load
  useEffect(() => {
    handleSyncGithub();
  }, []);

  // Theme container styling
  const getAppThemeStyle = () => {
    switch (theme) {
      case 'light':
        return 'bg-slate-100 text-slate-900';
      case 'retro-gingerbread':
        return 'bg-zinc-950 text-amber-100 font-sans';
      case 'material-blue':
        return 'bg-slate-950 text-slate-100';
      case 'dark':
      default:
        return 'bg-slate-950 text-slate-100';
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${getAppThemeStyle()}`}>
      
      {/* Top Header Navigation */}
      <Navbar
        languageMode={languageMode}
        onToggleLanguageLock={handleToggleLanguageLock}
        theme={theme}
        onThemeChange={setTheme}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        githubPushed={githubPushed}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Banner: Language Lock Indicator & Quick Overview */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xl transition-all shadow-md ${
              languageMode === 'amharic'
                ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 ring-2 ring-amber-400/40'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {languageMode === 'amharic' ? <Lock className="w-5 h-5 text-slate-950" /> : 'EN'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  {languageMode === 'amharic'
                    ? '🔒 Amharic Writing Mode (Windows 10 Phonetic)'
                    : '🔓 English Writing Mode (Default)'}
                </h2>
                <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
                  Android 2.4+ API 8 Capable
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Click the dedicated <span className="text-amber-400 font-bold">🔒 LANG LOCK</span> button on the keyboard or header to toggle between English & Windows 10 Amharic Phonetic composition.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <button
              onClick={handleToggleLanguageLock}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 border ${
                languageMode === 'amharic'
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {languageMode === 'amharic' ? 'Switch to English' : '🔒 Lock Amharic Mode'}
            </button>
          </div>
        </div>

        {/* TAB 1: KEYBOARD SIMULATOR & TEXT EDITOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <TextSandbox
              text={text}
              setText={setText}
              currentBuffer={currentBuffer}
              languageMode={languageMode}
              onToggleLanguageLock={handleToggleLanguageLock}
              inputRef={textareaRef}
            />

            <VirtualKeyboard
              languageMode={languageMode}
              onToggleLanguageLock={handleToggleLanguageLock}
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
              onEnter={handleEnter}
              onSpace={handleSpace}
              currentBuffer={currentBuffer}
              theme={theme}
              soundEnabled={soundEnabled}
            />
          </div>
        )}

        {/* TAB 2: KEY COMBINATION GUIDE */}
        {activeTab === 'guide' && <KeyCombinationGuide />}

        {/* TAB 3: ANDROID SOURCE CODE (API 8+) */}
        {activeTab === 'android-source' && <AndroidProjectView />}

        {/* TAB 4: GITHUB SYNC */}
        {activeTab === 'github' && (
          <GithubSync
            githubPushed={githubPushed}
            onSyncGithub={handleSyncGithub}
            isPushing={isPushing}
            pushError={pushError}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 text-center text-xs text-slate-500 font-mono">
        <p>Amharic Android Soft Keyboard (IME) Engine • Supporting Android 2.4 (API 8) to Android 15 (API 35)</p>
      </footer>

    </div>
  );
}
