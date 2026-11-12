import React, { useState } from 'react';
import { Link2, Clipboard, X, ArrowRight, Loader2 } from 'lucide-react';

export function UrlInput({ onSearch, isLoading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSearch(url.trim());
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        if (text.includes('youtube.com') || text.includes('youtu.be')) {
          onSearch(text.trim());
        }
      }
    } catch {
      // Fallback
    }
  };

  const handleClear = () => {
    setUrl('');
  };

  return (
    <div className="w-full max-w-3xl mx-auto pt-4 pb-2">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center rounded-2xl glass-panel p-2 shadow-xl transition-all duration-300 focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/20 glow-rose">
          
          <div className="pl-3 pr-2 text-slate-400">
            <Link2 className="w-5 h-5 text-rose-400" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Collez l'URL de la vidéo YouTube..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base px-2 py-2 focus:outline-none"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1.5 pr-1">
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-dark-800 rounded-lg transition-colors"
                title="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 text-slate-300 hover:text-white bg-dark-800/80 hover:bg-dark-700 rounded-lg transition-colors border border-dark-700"
                title="Coller depuis le presse-papier"
              >
                <Clipboard className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Coller</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg shadow-rose-600/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Analyse...</span>
                </>
              ) : (
                <>
                  <span>Analyser</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
