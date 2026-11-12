import React from 'react';
import { Download, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { getDownloadUrl } from '../services/api';

export function ProgressCard({ job, onReset }) {
  if (!job) return null;

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const downloadUrl = isCompleted ? getDownloadUrl(job.id) : null;

  return (
    <div className="w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      
      {/* Status Bar */}
      <div className="flex items-center gap-3 mb-4">
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        ) : isFailed ? (
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        ) : (
          <Loader2 className="w-5 h-5 text-rose-400 animate-spin shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-zinc-200 truncate">
            {job.fileName || job.videoTitle}
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            {job.phase}
          </p>
        </div>

        {!isCompleted && !isFailed && (
          <span className="text-xs font-semibold text-rose-400">
            {job.progress || 0}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {!isCompleted && !isFailed && (
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-rose-500 rounded-full transition-all duration-200"
            style={{ width: `${Math.max(5, job.progress || 0)}%` }}
          />
        </div>
      )}

      {/* Error */}
      {isFailed && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 mb-4">
          {job.error || 'Erreur lors de la conversion.'}
        </div>
      )}

      {/* Completed Actions */}
      {isCompleted && (
        <div className="space-y-3 mb-2">
          {job.format === 'mp3' && downloadUrl && (
            <audio controls className="w-full h-8 rounded">
              <source src={downloadUrl} type="audio/mpeg" />
            </audio>
          )}

          <a
            href={downloadUrl}
            download={job.fileName}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger ({job.format.toUpperCase()})</span>
          </a>
        </div>
      )}

      {/* Reset */}
      <div className="pt-3 border-t border-zinc-800/80 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Nouvelle conversion</span>
        </button>
      </div>

    </div>
  );
}
