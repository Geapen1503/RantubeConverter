import React from 'react';
import { Music, Video, User, Clock, CheckCircle } from 'lucide-react';

export function VideoCard({ video, selectedFormat, onSelectFormat }) {
  if (!video) return null;

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-3xl p-5 sm:p-6 shadow-2xl border border-dark-700/60">
      <div className="flex flex-col sm:flex-row gap-5 items-center">
        
        {/* Thumbnail Preview */}
        <div className="relative group w-full sm:w-60 aspect-video rounded-2xl overflow-hidden shadow-xl bg-dark-900 border border-dark-700 shrink-0">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (video.id && !e.target.src.includes('hqdefault')) {
                e.target.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/70 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-dark-950/90 text-[11px] font-bold text-white border border-dark-700/80 flex items-center gap-1 shadow-md">
            <Clock className="w-3 h-3 text-rose-400" />
            <span>{video.duration}</span>
          </div>
        </div>

        {/* Video Info Details */}
        <div className="flex-1 w-full flex flex-col justify-between self-stretch">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white line-clamp-2 leading-snug">
              {video.title}
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1.5">
              <User className="w-3.5 h-3.5 text-rose-400" />
              <span>{video.uploader}</span>
            </div>
          </div>

          {/* Format Toggle (MP3 vs MP4) */}
          <div className="pt-4 mt-3 border-t border-dark-800">
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              
              <button
                type="button"
                onClick={() => onSelectFormat('mp3')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                  selectedFormat === 'mp3'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white border-rose-400/30 shadow-lg shadow-rose-600/25 scale-[1.02]'
                    : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border-dark-700/80'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Audio (MP3)</span>
                {selectedFormat === 'mp3' && <CheckCircle className="w-3.5 h-3.5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => onSelectFormat('mp4')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                  selectedFormat === 'mp4'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white border-rose-400/30 shadow-lg shadow-rose-600/25 scale-[1.02]'
                    : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border-dark-700/80'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Vidéo (MP4)</span>
                {selectedFormat === 'mp4' && <CheckCircle className="w-3.5 h-3.5 ml-0.5" />}
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
