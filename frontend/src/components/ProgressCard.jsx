import React from 'react';
import { Download, CheckCircle2, AlertCircle, Loader2, ArrowLeft, Disc, Volume2 } from 'lucide-react';
import { getDownloadUrl } from '../services/api';

export function ProgressCard({ job, onReset }) {
  if (!job) return null;

  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const downloadUrl = isCompleted ? getDownloadUrl(job.id) : null;

  return (
    <div className="w-full max-w-3xl mx-auto glass-panel rounded-3xl p-6 sm:p-9 shadow-2xl border border-dark-700/60 mt-6 animate-fade-in">
      
      {/* Status Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
          isCompleted
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : isFailed
            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
        }`}>
          {isCompleted ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : isFailed ? (
            <AlertCircle className="w-7 h-7" />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin" />
          )}
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white">
            {isCompleted
              ? 'Conversion terminée avec succès !'
              : isFailed
              ? 'Échec de la conversion'
              : 'Conversion en cours...'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {job.phase || 'Traitement du fichier multimédia...'}
          </p>
        </div>
      </div>

      {/* Progress Bar (while running) */}
      {!isCompleted && !isFailed && (
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-300 mb-2">
            <span>{job.phase}</span>
            <span className="font-bold text-rose-400 text-sm">{job.progress || 0}%</span>
          </div>

          <div className="w-full h-3 bg-dark-900 rounded-full overflow-hidden p-0.5 border border-dark-750">
            <div
              className="h-full bg-gradient-to-r from-rose-600 via-brand-500 to-amber-400 rounded-full transition-all duration-300 shadow-lg shadow-rose-600/30"
              style={{ width: `${Math.max(5, job.progress || 0)}%` }}
            />
          </div>

          {(job.speed || job.eta) && (
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
              {job.speed && <span>Vitesse : {job.speed}</span>}
              {job.eta && <span>Temps restant : {job.eta}</span>}
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {isFailed && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm leading-relaxed">
          <strong>Erreur :</strong> {job.error || 'Une erreur inattendue est survenue.'}
        </div>
      )}

      {/* Completed Success View */}
      {isCompleted && (
        <div className="space-y-6">
          
          {/* File details card */}
          <div className="p-4 rounded-2xl bg-dark-850/80 border border-dark-750 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-dark-800 text-rose-400 border border-dark-700">
                <Disc className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-white line-clamp-1">{job.fileName}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="uppercase font-semibold text-rose-400">{job.format}</span>
                  <span>•</span>
                  <span>
                    {job.fileSize
                      ? `${(job.fileSize / (1024 * 1024)).toFixed(2)} Mo`
                      : 'Prêt'}
                  </span>
                  {job.embedThumbnail && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-400 font-medium">Pochette ID3 intégrée ✓</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Preview if MP3 */}
          {job.format === 'mp3' && downloadUrl && (
            <div className="p-4 rounded-2xl bg-dark-900 border border-dark-750 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Volume2 className="w-4 h-4 text-rose-400" />
                <span>Prévisualiser l'audio dans le navigateur :</span>
              </div>
              <audio controls className="w-full h-10 rounded-lg">
                <source src={downloadUrl} type="audio/mpeg" />
                Votre navigateur ne prend pas en charge l'élément audio.
              </audio>
            </div>
          )}

          {/* Big Download Button */}
          <a
            href={downloadUrl}
            download={job.fileName}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-extrabold text-base bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/25 transition-all transform active:scale-[0.99]"
          >
            <Download className="w-5 h-5" />
            <span>Télécharger le fichier ({job.format.toUpperCase()})</span>
          </a>

        </div>
      )}

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-dark-800 flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-dark-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Convertir une autre vidéo</span>
        </button>
      </div>

    </div>
  );
}
