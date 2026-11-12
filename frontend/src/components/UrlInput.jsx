import React, { useState } from 'react';
import { Clipboard, X, ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto pt-6 pb-2">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 focus-within:border-zinc-700 transition-colors">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Lien YouTube..."
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm px-3 py-2 focus:outline-none"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1">
            {url ? (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePaste}
                className="text-xs font-medium px-2.5 py-1.5 text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Coller</span>
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Analyser</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
