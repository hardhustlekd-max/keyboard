import React from 'react';
import { Github, CheckCircle2, GitCommit, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react';

interface GithubSyncProps {
  githubPushed: boolean;
  onSyncGithub: () => void;
  isPushing: boolean;
  pushError: string | null;
}

export const GithubSync: React.FC<GithubSyncProps> = ({
  githubPushed,
  onSyncGithub,
  isPushing,
  pushError,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              GitHub Repository Sync
            </h2>
            <p className="text-xs text-slate-400">
              Target Repository: <span className="font-mono text-emerald-400 font-semibold">hardhustlekd-max/keyboard</span>
            </p>
          </div>
        </div>

        <button
          onClick={onSyncGithub}
          disabled={isPushing}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isPushing ? 'animate-spin' : ''}`} />
          <span>{isPushing ? 'Pushing to GitHub...' : 'Push / Sync to GitHub'}</span>
        </button>
      </div>

      {/* Status Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Repo Status Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Repository:</span>
            <a
              href="https://github.com/hardhustlekd-max/keyboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 font-bold hover:underline flex items-center space-x-1"
            >
              <span>hardhustlekd-max/keyboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Access Token:</span>
            <span className="text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              ghp_SYIh...3kBmQB
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Push Status:</span>
            {githubPushed ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Pushed Successfully</span>
              </span>
            ) : (
              <span className="text-amber-400 font-bold">Pending Push</span>
            )}
          </div>
        </div>

        {/* Sync Info */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs text-slate-300">
          <div className="font-bold text-slate-200 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Repository Integration Guarantee:</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            All React Web App source code, Windows 10 Amharic Phonetic composition engine logic, and lightweight Android 2.4+ (minSdk 8) Java IME files are committed and pushed directly to your GitHub repository with complete comments for future maintenance.
          </p>
        </div>

      </div>

      {pushError && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-mono">
          Push Error: {pushError}
        </div>
      )}

    </div>
  );
};
