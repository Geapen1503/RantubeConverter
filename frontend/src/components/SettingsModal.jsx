import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { getStoredBackendUrl, saveStoredBackendUrl, checkHealth } from '../services/api';

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
          message: 'Connecté'
        });
      } else {
        setTestResult({
          success: false,
          message: 'Injoignable'
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: 'Erreur de connexion'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5 relative shadow-xl">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-semibold text-zinc-100 mb-3">
          URL Backend
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="http://localhost:5000"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
          />
          <button
            type="button"
            onClick={handleTest}
            disabled={testing}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-750 text-zinc-300 transition-colors shrink-0 disabled:opacity-40"
          >
            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" /> : 'Test'}
          </button>
        </div>

        {testResult && (
          <div className={`mb-3 py-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1.5 ${
            testResult.success
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {testResult.success ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>{testResult.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Défaut
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
