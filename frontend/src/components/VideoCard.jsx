import React from 'react';
import { Music, Video } from 'lucide-react';

export function VideoCard({ video, selectedFormat, onSelectFormat }) {
  if (!video) return null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        
        {/* Thumbnail with duration */}
        <div className="relative w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800/80">
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
          <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-medium text-white">
            {video.duration}
          </div>
        </div>

        {/* Video details & format switch */}
        <div className="flex-1 w-full flex flex-col justify-between self-stretch">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-zinc-100 line-clamp-2 leading-snug">
              {video.title}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {video.uploader}
            </p>
          </div>

          {/* Simple format selector */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={() => onSelectFormat('mp3')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                selectedFormat === 'mp3'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>MP3</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectFormat('mp4')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                selectedFormat === 'mp4'
                  ? 'bg-rose-600 text-white'
                  : 'bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>MP4</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
