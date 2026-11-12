/**
 * API Service for RanTube Converter
 * Supports dynamic backend URL configuration for GitHub Pages hosting
 */

const STORAGE_KEY = 'rantube_backend_url';

export function getStoredBackendUrl() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function saveStoredBackendUrl(url) {
  if (typeof window === 'undefined') return;
  const clean = url ? url.trim().replace(/\/+$/, '') : '';
  if (clean) {
    localStorage.setItem(STORAGE_KEY, clean);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getBaseApiUrl() {
  const customUrl = getStoredBackendUrl();
  if (customUrl) {
    return customUrl;
  }

  // If hosted on GitHub Pages or file protocol, default to local backend or ask user
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('github.io') || window.location.protocol === 'file:') {
      // GitHub Pages needs an explicit backend host
      return 'http://localhost:5000';
    }
  }

  // Same origin (Node demo or Vite proxy)
  return '';
}

/**
 * Health check
 */
export async function checkHealth(customBaseUrl = null) {
  const base = customBaseUrl !== null ? customBaseUrl : getBaseApiUrl();
  const endpoint = `${base}/api/health`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'error', message: err.message };
  }
}

/**
 * Fetch video details and available qualities
 */
export async function fetchVideoInfo(url) {
  const base = getBaseApiUrl();
  const endpoint = `${base}/api/info`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ url })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Erreur lors de la récupération des informations vidéo.');
  }

  return data;
}

/**
 * Start conversion job
 */
export async function startConversion(params) {
  const base = getBaseApiUrl();
  const endpoint = `${base}/api/convert`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(params)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Impossible de démarrer la conversion.');
  }

  return data;
}

/**
 * Get job status
 */
export async function getJobStatus(jobId) {
  const base = getBaseApiUrl();
  const endpoint = `${base}/api/jobs/${jobId}`;

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error('Tâche introuvable.');
  }
  return await res.json();
}

/**
 * Download URL builder
 */
export function getDownloadUrl(jobId) {
  const base = getBaseApiUrl();
  return `${base}/api/download/${jobId}`;
}

/**
 * Connect to SSE progress stream
 */
export function subscribeToProgress(jobId, onUpdate, onError) {
  const base = getBaseApiUrl();
  const url = `${base}/api/jobs/${jobId}/events`;

  const eventSource = new EventSource(url);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onUpdate(data);
      if (data.status === 'completed' || data.status === 'failed') {
        eventSource.close();
      }
    } catch (e) {
      console.error('SSE parse error:', e);
    }
  };

  eventSource.onerror = (err) => {
    console.warn('SSE connection error, falling back to polling if needed');
    if (onError) onError(err);
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}

