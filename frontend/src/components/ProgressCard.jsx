import React from 'react';
import { Download, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Disc, Volume2 } from 'lucide-react';
import { getDownloadUrl } from '../services/api';

export function ProgressCard({ job, onReset }) {
  if (!job) return null;

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const downloadUrl = isCompleted ? getDownloadUrl(job.id) : null;

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-dark-700/60 mt-4 animate-fade-in">
      
      {/* Status Header */}
      <div className="flex items-center gap-3.5 mb-5">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
          isCompleted
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : isFailed
            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
        }`}>
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : isFailed ? (
            <AlertCircle className="w-6 h-6" />
          ) : (
            <Loader2 className="w-5 h-5 animate-spin" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">
            {isCompleted
              ? 'Prêt pour le téléchargement'
              : isFailed
              ? 'Échec de la conversion'
              : job.videoTitle || 'Conversion en cours...'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {job.phase}
          </p>
        </div>

        {!isCompleted && !isFailed && (
          <span className="text-xs font-bold text-rose-400">
            {job.progress || 0}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {!isCompleted && !isFailed && (
        <div className="mb-5">
          <div className="w-full h-2.5 bg-dark-900 rounded-full overflow-hidden p-0.5 border border-dark-750">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-400 rounded-full transition-all duration-300 shadow-md shadow-rose-600/30"
              style={{ width: `${Math.max(5, job.progress || 0)}%` }}
            />
          </div>

          {(job.speed || job.eta) && (
            <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5">
              {job.speed && <span>Vitesse : {job.speed}</span>}
              {job.eta && <span>Temps restant : {job.eta}</span>}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {isFailed && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
          {job.error || 'Une erreur inattendue est survenue.'}
        </div>
      )}

      {/* Completed Success View */}
      {isCompleted && (
        <div className="space-y-4">
          
          <div className="p-3.5 rounded-2xl bg-dark-850/80 border border-dark-750 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-dark-800 text-rose-400 border border-dark-700 shrink-0">
                <Disc className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-white truncate">{job.fileName}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <span className="uppercase font-semibold text-rose-400">{job.format}</span>
                  {job.fileSize && (
                    <>
                      <span>•</span>
                      <span>{(job.fileSize / (1024 * 1024)).toFixed(1)} Mo</span>
                    </>
                  )}
                  {job.embedThumbnail && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Pochette intégrée ✓</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Preview if MP3 */}
          {job.format === 'mp3' && downloadUrl && (
            <div className="p-3 rounded-2xl bg-dark-900 border border-dark-750 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Aperçu audio :</span>
              </div>
              <audio controls className="w-full h-8 rounded">
                <source src={downloadUrl} type="audio/mpeg" />
              </audio>
            </div>
          )}

          {/* Download Button */}
          <a
            href={downloadUrl}
            download={job.fileName}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/25 transition-all transform active:scale-[0.99]"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger le fichier</span>
          </a>

        </div>
      )}

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-dark-800 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl hover:bg-dark-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Convertir une autre vidéo</span>
        </button>
      </div>

    </div>
  );
}
