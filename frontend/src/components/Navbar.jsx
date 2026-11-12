import React from 'react';
import { Settings, Wifi, WifiOff, Sparkles } from 'lucide-react';

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function Navbar({ backendStatus, onOpenSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-dark-800/80 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-brand-500 to-amber-500 shadow-lg shadow-rose-500/25">
            <YoutubeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                RanTube
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wide">Convertisseur MP4 & MP3 HD</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Backend Status Pill */}
          <button
            onClick={onOpenSettings}
            className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              backendStatus === 'online'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : backendStatus === 'offline'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20 animate-pulse'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
            title="Cliquez pour configurer le serveur backend"
          >
            {backendStatus === 'online' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Backend actif</span>
              </>
            ) : backendStatus === 'offline' ? (
              <>
                <WifiOff className="w-3.5 h-3.5" />
                <span>Backend hors-ligne</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Connexion...</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-dark-800 rounded-lg transition-colors border border-transparent hover:border-dark-700"
            title="Paramètres API & GitHub Pages"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

      </div>
    </header>
  );
}
