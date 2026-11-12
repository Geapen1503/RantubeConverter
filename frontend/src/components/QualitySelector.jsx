import React, { useState } from 'react';
import { Download, Image, Check, Film, Music2 } from 'lucide-react';

export function QualitySelector({
  video,
  format, // 'mp3' | 'mp4'
  onStartConversion,
  isConverting
}) {
  if (!video) return null;

  const isMp3 = format === 'mp3';
  const availableQualities = isMp3 ? video.audioQualities : video.videoQualities;

  const defaultQuality = isMp3
    ? '320k'
    : (availableQualities && availableQualities.length > 0 ? availableQualities[0].quality : '1080');

  const [selectedQuality, setSelectedQuality] = useState(defaultQuality);
  const [embedThumbnail, setEmbedThumbnail] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartConversion({
      format,
      quality: selectedQuality,
      embedThumbnail: isMp3 ? embedThumbnail : false
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-3xl p-6 shadow-2xl border border-dark-700/60 mt-4">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-800 mb-5">
        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
          {isMp3 ? (
            <>
              <Music2 className="w-4 h-4 text-rose-400" />
              <span>Qualité Audio (MP3)</span>
            </>
          ) : (
            <>
              <Film className="w-4 h-4 text-rose-400" />
              <span>Résolution Vidéo (MP4)</span>
            </>
          )}
        </h3>

        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-dark-800 text-slate-300 border border-dark-700">
          {availableQualities ? availableQualities.length : 0} options
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Quality Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
          {availableQualities && availableQualities.map((item) => {
            const isSelected = selectedQuality === item.quality;
            return (
              <div
                key={item.quality}
                onClick={() => setSelectedQuality(item.quality)}
                className={`cursor-pointer p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500/60 shadow-lg shadow-rose-500/10'
                    : 'bg-dark-850 hover:bg-dark-800 border-dark-750 hover:border-dark-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-sm text-white flex items-center gap-1.5">
                    <span>{item.label || item.quality}</span>
                    {isSelected && (
                      <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-rose-500 text-white">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1">
                    {item.fps && item.fps > 30 && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.fps} FPS
                      </span>
                    )}
                    {item.isHdr && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        HDR
                      </span>
                    )}
                  </div>
                </div>

                {item.filesizeFormatted && (
                  <div className="mt-2 pt-2 border-t border-dark-800 text-[11px] text-slate-400 flex justify-between">
                    <span>Taille :</span>
                    <span className="font-semibold text-slate-300">{item.filesizeFormatted}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MP3 Cover Art Toggle */}
        {isMp3 && (
          <div className="mb-5 p-3.5 rounded-2xl bg-dark-850/90 border border-dark-700/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                <Image className="w-4 h-4" />
              </div>
              <span className="font-semibold text-xs sm:text-sm text-white">
                Intégrer la pochette YouTube dans le MP3 (Cover ID3v2)
              </span>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={embedThumbnail}
                onChange={(e) => setEmbedThumbnail(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5.5 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="submit"
          disabled={isConverting}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:opacity-95 text-white shadow-xl shadow-rose-600/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          <span>
            {isMp3
              ? `Télécharger en MP3 (${selectedQuality.toUpperCase()})`
              : `Télécharger en MP4 (${selectedQuality})`}
          </span>
        </button>

      </form>

    </div>
  );
}
