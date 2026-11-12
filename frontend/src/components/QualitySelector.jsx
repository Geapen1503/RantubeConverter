import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';

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
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mt-3">
      <form onSubmit={handleSubmit}>
        
        {/* Quality Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {availableQualities && availableQualities.map((item) => {
            const isSelected = selectedQuality === item.quality;
            const shortLabel = item.label || item.quality;
            return (
              <button
                type="button"
                key={item.quality}
                onClick={() => setSelectedQuality(item.quality)}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-left flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-rose-500/10 border-rose-500/50 text-rose-300'
                    : 'bg-zinc-850/60 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                }`}
              >
                <span>{shortLabel}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* MP3 Cover Art Toggle */}
        {isMp3 && (
          <div className="flex items-center justify-between py-2.5 px-3 mb-4 rounded-lg bg-zinc-850/60 border border-zinc-800">
            <span className="text-xs text-zinc-300 font-medium">
              Intégrer la pochette YouTube
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={embedThumbnail}
                onChange={(e) => setEmbedThumbnail(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>
        )}

        {/* CTA Button */}
        <button
          type="submit"
          disabled={isConverting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>
            {isMp3 ? `Convertir en MP3 (${selectedQuality})` : `Télécharger en MP4 (${selectedQuality})`}
          </span>
        </button>

      </form>
    </div>
  );
}
