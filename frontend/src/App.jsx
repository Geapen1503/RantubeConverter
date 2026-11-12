import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { UrlInput } from './components/UrlInput';
import { VideoCard } from './components/VideoCard';
import { QualitySelector } from './components/QualitySelector';
import { ProgressCard } from './components/ProgressCard';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';
import { checkHealth, fetchVideoInfo, startConversion, subscribeToProgress, getJobStatus } from './services/api';
import { AlertCircle, WifiOff } from 'lucide-react';

export function App() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Video search & selection state
  const [videoData, setVideoData] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState('mp3');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Conversion job state
  const [isConverting, setIsConverting] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);

  const unsubscribeRef = useRef(null);
  const pollingRef = useRef(null);

  // Health check on mount and interval
  const verifyBackend = async () => {
    try {
      const res = await checkHealth();
      if (res && res.status === 'ok') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  // Cleanup SSE & Polling on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  // Handle URL Search
  const handleSearch = async (url) => {
    setError(null);
    setIsLoading(true);
    setVideoData(null);
    setCurrentJob(null);

    try {
      const data = await fetchVideoInfo(url);
      setVideoData(data);
    } catch (err) {
      console.error('Fetch video info error:', err);
      setError(err.message || 'Impossible de récupérer la vidéo. Assurez-vous que le lien est valide.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start Conversion
  const handleStartConversion = async ({ format, quality, embedThumbnail }) => {
    if (!videoData) return;
    setError(null);
    setIsConverting(true);

    try {
      const payload = {
        url: videoData.url,
        format,
        quality,
        embedThumbnail,
        videoTitle: videoData.title,
        artist: videoData.uploader,
        thumbnailUrl: videoData.thumbnail
      };

      const res = await startConversion(payload);
      const jobId = res.jobId;

      // Set initial local job state
      setCurrentJob({
        id: jobId,
        status: 'queued',
        progress: 5,
        phase: 'Préparation du téléchargement...',
        format,
        embedThumbnail,
        videoTitle: videoData.title,
        fileName: `${videoData.title}.${format}`
      });

      // Start SSE Progress Listener
      if (unsubscribeRef.current) unsubscribeRef.current();
      if (pollingRef.current) clearInterval(pollingRef.current);

      unsubscribeRef.current = subscribeToProgress(
        jobId,
        (updatedJob) => {
          setCurrentJob(updatedJob);
          if (updatedJob.status === 'completed' || updatedJob.status === 'failed') {
            setIsConverting(false);
          }
        },
        () => {
          // SSE Failed -> Fallback to polling every 1.5s
          console.warn('Falling back to polling for job:', jobId);
          pollingRef.current = setInterval(async () => {
            try {
              const polledJob = await getJobStatus(jobId);
              setCurrentJob(polledJob);
              if (polledJob.status === 'completed' || polledJob.status === 'failed') {
                setIsConverting(false);
                clearInterval(pollingRef.current);
              }
            } catch {
              // ignore transient errors
            }
          }, 1500);
        }
      );

    } catch (err) {
      console.error('Start conversion error:', err);
      setError(err.message || 'Impossible de démarrer la conversion.');
      setIsConverting(false);
    }
  };

  // Reset to convert a new video
  const handleReset = () => {
    if (unsubscribeRef.current) unsubscribeRef.current();
    if (pollingRef.current) clearInterval(pollingRef.current);
    setCurrentJob(null);
    setVideoData(null);
    setError(null);
    setIsConverting(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-dark-950 text-slate-100">
      
      {/* Navigation */}
      <Navbar
        backendStatus={backendStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col">
        
        {/* Offline Warning Banner (if backend is unreachable) */}
        {backendStatus === 'offline' && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <strong>Backend non détecté :</strong> Pour convertir les vidéos YouTube et injecter les couvertures MP3, assurez-vous que le serveur local Node.js est lancé (<code>npm start</code>) ou configurez votre URL distante.
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-1.5 rounded-xl font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shrink-0 transition-colors"
            >
              Paramètres
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg max-w-3xl mx-auto w-full animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <strong>Une erreur est survenue :</strong> {error}
            </div>
          </div>
        )}

        {/* View Flow: Either Conversion Progress OR Video Search & Selection */}
        {currentJob ? (
          <ProgressCard job={currentJob} onReset={handleReset} />
        ) : (
          <>
            {/* Step 1: Input URL */}
            <UrlInput onSearch={handleSearch} isLoading={isLoading} />

            {/* Step 2: Video Card & Format Selector (once searched) */}
            {videoData && (
              <div className="mt-8 space-y-6 animate-fade-in">
                <VideoCard
                  video={videoData}
                  selectedFormat={selectedFormat}
                  onSelectFormat={(fmt) => setSelectedFormat(fmt)}
                />

                {/* Step 3: Available Qualities Selector */}
                <QualitySelector
                  video={videoData}
                  format={selectedFormat}
                  onStartConversion={handleStartConversion}
                  isConverting={isConverting}
                />
              </div>
            )}
          </>
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onBackendUrlChanged={verifyBackend}
      />

      {/* Footer */}
      <Footer />

    </div>
  );
}
export default App;
