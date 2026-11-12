import React from 'react';
import { Settings } from 'lucide-react';

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function Navbar({ backendStatus, onOpenSettings }) {
  return (
    <header className="border-b border-zinc-850 bg-zinc-950/40 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        
        {/* Minimal Brand */}
        <div className="flex items-center gap-2.5">
          <div className="text-rose-500">
            <YoutubeIcon />
          </div>
          <span className="font-semibold text-base text-zinc-100 tracking-tight">
            RanTube
          </span>
        </div>

        {/* Status dot & Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded-lg hover:bg-zinc-900 transition-colors"
            title="Paramètres de connexion"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
