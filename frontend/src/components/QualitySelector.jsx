import React, { useState } from 'react';
import { Download, Sparkles, Image, Check, Info, ShieldCheck, Film, Music2 } from 'lucide-react';

export function QualitySelector({
  video,
  format, // 'mp3' | 'mp4'
  onStartConversion,
  isConverting
}) {
  if (!video) return null;

  const isMp3 = format === 'mp3';
  const availableQualities = isMp3 ? video.audioQualities : video.videoQualities;

  // Default selection
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
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl border border-dark-700/60 mt-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-dark-800 gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {isMp3 ? (
              <>
                <Music2 className="w-5 h-5 text-rose-400" />
                <span>Sélectionnez le débit audio (MP3)</span>
              </>
            ) : (
              <>
                <Film className="w-5 h-5 text-rose-400" />
                <span>Sélectionnez la résolution vidéo (MP4)</span>
              </>
            )}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isMp3
              ? 'Toutes les qualités MP3 sont encodées avec le codec audio LAME haute fidélité.'
              : 'Toutes les résolutions disponibles pour cette vidéo sont listées ci-dessous.'}
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-dark-800 text-slate-300 border border-dark-700 w-fit">
          {availableQualities ? availableQualities.length : 0} options disponibles
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Quality Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {availableQualities && availableQualities.map((item) => {
            const isSelected = selectedQuality === item.quality;
            return (
              <div
                key={item.quality}
                onClick={() => setSelectedQuality(item.quality)}
                className={`relative cursor-pointer p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500/60 shadow-lg shadow-rose-500/10'
                    : 'bg-dark-850 hover:bg-dark-800 border-dark-750 hover:border-dark-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                      <span>{item.label || item.quality}</span>
                      {isSelected && (
                        <span className="flex items-center justify-center w-4 h-4 rounded-full bg-rose-500 text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    {item.note && (
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{item.note}</p>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1">
                    {item.fps && item.fps > 30 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.fps} FPS
                      </span>
                    )}
                    {item.isHdr && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        HDR
                      </span>
                    )}
                  </div>
                </div>

                {/* File size estimate */}
                {item.filesizeFormatted && (
                  <div className="mt-3 pt-2 border-t border-dark-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Taille estimée :</span>
                    <span className="font-semibold text-slate-300">{item.filesizeFormatted}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* MP3 Cover Art Toggle Option */}
        {isMp3 && (
          <div className="mb-6 p-4 rounded-2xl bg-dark-850/90 border border-dark-700/80 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">
                    Intégrer la pochette de la vidéo dans le MP3
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ID3v2 Cover
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  La miniature YouTube est recadrée au format carré HD et injectée dans les métadonnées. Elle s'affichera sur votre lecteur MP3, smartphone, CarPlay, etc.
                </p>
              </div>
            </div>

            {/* Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={embedThumbnail}
                onChange={(e) => setEmbedThumbnail(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-dark-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="submit"
          disabled={isConverting}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-extrabold text-base bg-gradient-to-r from-rose-600 via-brand-500 to-rose-600 hover:opacity-95 text-white shadow-xl shadow-rose-600/25 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5" />
          <span>
            {isMp3
              ? `Convertir en MP3 (${selectedQuality.toUpperCase()}) avec pochette`
              : `Télécharger la vidéo en MP4 (${selectedQuality})`}
          </span>
        </button>

      </form>

    </div>
  );
}
