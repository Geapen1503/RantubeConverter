import React from 'react';
import { Music, Video, User, Clock, Eye, Calendar, Disc, CheckCircle } from 'lucide-react';

export function VideoCard({ video, selectedFormat, onSelectFormat }) {
  if (!video) return null;

  // Format view count
  const formattedViews = new Intl.NumberFormat('en-US').format(video.viewCount);

  // Format date if YYYYMMDD
  let formattedDate = video.uploadDate;
  if (video.uploadDate && video.uploadDate.length === 8) {
    const y = video.uploadDate.substring(0, 4);
    const m = video.uploadDate.substring(4, 6);
    const d = video.uploadDate.substring(6, 8);
    formattedDate = `${y}-${m}-${d}`;
  }

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl border border-dark-700/60 transition-all">
      <div className="flex flex-col lg:flex-row gap-6 items-center">
        
        {/* Thumbnail Preview with Duration */}
        <div className="relative group w-full lg:w-72 aspect-video rounded-2xl overflow-hidden shadow-xl bg-dark-900 border border-dark-700 shrink-0">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback to hqdefault if maxresdefault 404s
              if (video.id && !e.target.src.includes('hqdefault')) {
                e.target.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent pointer-events-none" />
          
          {/* Duration Badge */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-dark-950/90 text-[11px] font-bold text-white border border-dark-700/80 flex items-center gap-1 shadow-md">
            <Clock className="w-3 h-3 text-rose-400" />
            <span>{video.duration}</span>
          </div>

          {/* Square Cover Preview Pill */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-600/90 text-[10px] font-bold text-white shadow-md flex items-center gap-1 backdrop-blur-sm">
            <Disc className="w-3 h-3" />
            <span>HD Cover</span>
          </div>
        </div>

        {/* Video Info Details */}
        <div className="flex-1 w-full flex flex-col justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-2 leading-snug mb-3 hover:text-rose-400 transition-colors">
              {video.title}
            </h2>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-400 mb-5">
              <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                <User className="w-4 h-4 text-rose-400" />
                <span>{video.uploader}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-500" />
                <span>{formattedViews} views</span>
              </div>
              {formattedDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Format Toggle (MP3 vs MP4) */}
          <div className="pt-3 border-t border-dark-800">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Select Output Format:
            </label>
            <div className="grid grid-cols-2 gap-3 max-w-sm">
              
              {/* MP3 Audio Button */}
              <button
                type="button"
                onClick={() => onSelectFormat('mp3')}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                  selectedFormat === 'mp3'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white border-rose-400/30 shadow-lg shadow-rose-600/25 scale-[1.02]'
                    : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border-dark-700/80'
                }`}
              >
                <Music className="w-4 h-4" />
                <span>Audio (MP3)</span>
                {selectedFormat === 'mp3' && <CheckCircle className="w-3.5 h-3.5 ml-1" />}
              </button>

              {/* MP4 Video Button */}
              <button
                type="button"
                onClick={() => onSelectFormat('mp4')}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
                  selectedFormat === 'mp4'
                    ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white border-rose-400/30 shadow-lg shadow-rose-600/25 scale-[1.02]'
                    : 'bg-dark-850 hover:bg-dark-800 text-slate-300 border-dark-700/80'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video (MP4)</span>
                {selectedFormat === 'mp4' && <CheckCircle className="w-3.5 h-3.5 ml-1" />}
              </button>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
