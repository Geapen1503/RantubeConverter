import React from 'react';
import { Shield, Sparkles, Music, Video, Image } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-dark-800/80 bg-dark-950/60 py-12 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Features row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-dark-800/60 text-slate-300">
          
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">MP4 jusqu'en 4K</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Toutes les résolutions avec flux audio et vidéo fusionnés à la volée.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <Music className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">MP3 Haute Fidélité</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">320kbps, 256kbps, 192kbps encodés avec FFmpeg LAME.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <Image className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Pochette ID3 intégrée</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Vignette carrée HD injectée pour tous vos lecteurs MP3 et smartphones.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs">Prêt pour GitHub Pages</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Frontend 100% statique avec backend modulaire et évolutif.</p>
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-center sm:text-left text-slate-500">
            &copy; {new Date().getFullYear()} <strong className="text-slate-300">RanTube Converter</strong>. Conçu pour un usage personnel et privé.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Architecture Scalable SPA + Node.js / FFmpeg</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
