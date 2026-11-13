import React from 'react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-dark-800/80 bg-dark-950/60 py-8 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4">
        {/* Bottom Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left text-slate-500 flex items-center gap-1">
            <span className="inline-block transform scale-x-[-1] text-sm select-none" title="Copyleft">&copy;</span>
            <span>{new Date().getFullYear()} <strong className="text-slate-300 font-semibold">RanTube Converter</strong>. Designed for personal and private use.</span>
          </p>
          <div className="flex items-center gap-4 text-slate-400 font-medium">
            <span className="text-slate-300">GringoDeck</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
