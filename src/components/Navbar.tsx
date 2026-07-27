import React from 'react';
import { Lock, Unlock, Volume2, VolumeX, Sparkles, Moon, Sun, Smartphone, Code2, Keyboard, BookOpen, Github } from 'lucide-react';
import { LanguageMode, ThemeMode } from '../types';

interface NavbarProps {
  languageMode: LanguageMode;
  onToggleLanguageLock: () => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeTab: 'simulator' | 'guide' | 'android-source' | 'github';
  onTabChange: (tab: 'simulator' | 'guide' | 'android-source' | 'github') => void;
  githubPushed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  languageMode,
  onToggleLanguageLock,
  theme,
  onThemeChange,
  soundEnabled,
  onToggleSound,
  activeTab,
  onTabChange,
  githubPushed,
}) => {
  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-200 shadow-xs ${
      theme === 'light'
        ? 'bg-white/95 border-slate-200 text-slate-800'
        : 'bg-slate-900/90 border-slate-800 text-slate-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* App Title & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-xs">
            አ
          </div>
          <div>
            <h1 className={`text-base sm:text-lg font-bold tracking-tight ${
              theme === 'light' ? 'text-slate-800' : 'text-slate-100'
            }`}>
              Amharic Android Keyboard
            </h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              Android 2.4+ Compatible • Clean Minimalism Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className={`hidden md:flex items-center space-x-1 p-1 rounded-xl border ${
          theme === 'light'
            ? 'bg-slate-100 border-slate-200'
            : 'bg-slate-800/80 border-slate-700/60'
        }`}>
          <button
            id="nav-tab-simulator"
            onClick={() => onTabChange('simulator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Keyboard Demo</span>
          </button>

          <button
            id="nav-tab-guide"
            onClick={() => onTabChange('guide')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Phonetic Guide</span>
          </button>

          <button
            id="nav-tab-android"
            onClick={() => onTabChange('android-source')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'android-source'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Code (API 8+)</span>
          </button>

          <button
            id="nav-tab-github"
            onClick={() => onTabChange('github')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'github'
                ? 'bg-blue-600 text-white font-semibold shadow-xs'
                : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Sync</span>
            {githubPushed && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
        </nav>

        {/* Language Lock Control & Settings */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Dedicated Language Lock Toggle */}
          <button
            id="nav-lang-lock-toggle"
            onClick={onToggleLanguageLock}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-xs active:scale-95 border ${
              languageMode === 'amharic'
                ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/30'
                : theme === 'light'
                  ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750 hover:text-white'
            }`}
            title="Toggle Amharic Windows 10 Language Lock"
          >
            {languageMode === 'amharic' ? (
              <>
                <Lock className="w-3.5 h-3.5 text-white animate-pulse" />
                <span>AMHARIC LOCKED (አማርኛ)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-slate-400" />
                <span>ENGLISH (Default)</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            id="nav-sound-toggle"
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              theme === 'light'
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700/80'
            }`}
            title={soundEnabled ? 'Disable Key Click Audio' : 'Enable Key Click Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Theme Selector */}
          <select
            id="nav-theme-select"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
            className={`border text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'light'
                ? 'bg-slate-100 text-slate-800 border-slate-200'
                : 'bg-slate-800 text-slate-200 border-slate-700'
            }`}
          >
            <option value="light">Clean Minimalism (Light)</option>
            <option value="dark">Dark Theme</option>
            <option value="retro-gingerbread">Gingerbread (Android 2.3/2.4)</option>
            <option value="material-blue">Material Blue</option>
          </select>

        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className={`md:hidden flex items-center justify-around border-t py-2 px-2 text-xs ${
        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-850 border-slate-800'
      }`}>
        <button
          onClick={() => onTabChange('simulator')}
          className={`flex flex-col items-center py-1 ${activeTab === 'simulator' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
        >
          <Keyboard className="w-4 h-4" />
          <span>Keyboard</span>
        </button>
        <button
          onClick={() => onTabChange('guide')}
          className={`flex flex-col items-center py-1 ${activeTab === 'guide' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Guide</span>
        </button>
        <button
          onClick={() => onTabChange('android-source')}
          className={`flex flex-col items-center py-1 ${activeTab === 'android-source' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Source Code</span>
        </button>
        <button
          onClick={() => onTabChange('github')}
          className={`flex flex-col items-center py-1 ${activeTab === 'github' ? 'text-blue-600 font-bold' : 'text-slate-400'}`}
        >
          <Github className="w-4 h-4" />
          <span>GitHub</span>
        </button>
      </div>
    </header>
  );
};
