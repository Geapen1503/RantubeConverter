import React from 'react';

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export function Navbar({ backendStatus }) {
  return (
    <header className="sticky top-0 z-40 border-b border-dark-800/60 bg-dark-950/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 shadow-md shadow-rose-500/20 text-white">
            <YoutubeIcon />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            RanTube
          </span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 text-xs font-medium">
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'online'
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
            }`}
          />
          <span className="text-slate-400 text-[11px]">
            {backendStatus === 'online' ? 'Connecté' : 'En attente'}
          </span>
        </div>

      </div>
    </header>
  );
}
