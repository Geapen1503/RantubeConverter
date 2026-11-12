import React, { useState, useEffect } from 'react';
import { X, Server, Check, AlertTriangle, RefreshCw, Globe, HelpCircle } from 'lucide-react';
import { getStoredBackendUrl, saveStoredBackendUrl, checkHealth, getBaseApiUrl } from '../services/api';

export function SettingsModal({ isOpen, onClose, onBackendUrlChanged }) {
  const [url, setUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(getStoredBackendUrl());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const targetUrl = url.trim().replace(/\/+$/, '');
      const res = await checkHealth(targetUrl || null);
      if (res && res.status === 'ok') {
        setTestResult({
          success: true,
          message: `Connecté avec succès à l'API v${res.version} ! FFmpeg : ${res.ffmpegReady ? 'Prêt' : 'Non détecté'}`
        });
      } else {
        setTestResult({
          success: false,
          message: 'Impossible de joindre le backend à cette adresse.'
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Erreur de connexion : ${err.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    saveStoredBackendUrl(url);
    if (onBackendUrlChanged) onBackendUrlChanged();
    onClose();
  };

  const handleReset = () => {
    setUrl('');
    saveStoredBackendUrl('');
    if (onBackendUrlChanged) onBackendUrlChanged();
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-dark-700 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Paramètres d'Architecture</h3>
            <p className="text-xs text-slate-400">Configuration Backend & GitHub Pages</p>
          </div>
        </div>

        {/* Architecture Note */}
        <div className="mb-5 p-3.5 rounded-2xl bg-dark-850/90 border border-dark-750 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <Globe className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white block mb-0.5">Compatibilité GitHub Pages :</strong>
            GitHub Pages héberge le frontend statique. Pour télécharger et convertir les vidéos YouTube avec FFmpeg et les pochettes ID3, un backend Node.js actif est nécessaire (en local sur votre PC ou hébergé gratuitement sur Render/Railway).
          </div>
        </div>

        {/* Input Field */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            URL de l'API Backend :
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Ex : http://localhost:5000 (ou URL distante Render/Railway)"
              className="w-full bg-dark-900 border border-dark-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-dark-800 hover:bg-dark-750 text-slate-200 border border-dark-700 flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-rose-400' : ''}`} />
              <span>Tester</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Laissez vide pour utiliser la détection automatique locale (<code>http://localhost:5000</code>).
          </p>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2 ${
            testResult.success
              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
          }`}>
            {testResult.success ? <Check className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-dark-800">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Rétablir par défaut
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:bg-dark-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all"
            >
              Enregistrer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
