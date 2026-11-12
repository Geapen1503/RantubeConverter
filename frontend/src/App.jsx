import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { UrlInput } from './components/UrlInput';
import { VideoCard } from './components/VideoCard';
import { QualitySelector } from './components/QualitySelector';
import { ProgressCard } from './components/ProgressCard';
import { checkHealth, fetchVideoInfo, startConversion, subscribeToProgress, getJobStatus } from './services/api';
import { AlertCircle } from 'lucide-react';

export function App() {
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  
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
      setError(err.message || 'Lien invalide ou introuvable.');
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

      setCurrentJob({
        id: jobId,
        status: 'queued',
        progress: 5,
        phase: 'Préparation...',
        format,
        embedThumbnail,
        videoTitle: videoData.title,
        fileName: `${videoData.title}.${format}`
      });

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
          pollingRef.current = setInterval(async () => {
            try {
              const polledJob = await getJobStatus(jobId);
              setCurrentJob(polledJob);
              if (polledJob.status === 'completed' || polledJob.status === 'failed') {
                setIsConverting(false);
                clearInterval(pollingRef.current);
              }
            } catch {
              // ignore
            }
          }, 1500);
        }
      );

    } catch (err) {
      console.error('Start conversion error:', err);
      setError(err.message || 'Erreur lors du démarrage de la conversion.');
      setIsConverting(false);
    }
  };

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
      <Navbar backendStatus={backendStatus} />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 max-w-3xl mx-auto w-full">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Content */}
        {currentJob ? (
          <ProgressCard job={currentJob} onReset={handleReset} />
        ) : (
          <div className="space-y-4">
            <UrlInput onSearch={handleSearch} isLoading={isLoading} />

            {videoData && (
              <div className="space-y-4 animate-fade-in">
                <VideoCard
                  video={videoData}
                  selectedFormat={selectedFormat}
                  onSelectFormat={(fmt) => setSelectedFormat(fmt)}
                />

                <QualitySelector
                  video={videoData}
                  format={selectedFormat}
                  onStartConversion={handleStartConversion}
                  isConverting={isConverting}
                />
              </div>
            )}
          </div>
        )}

      </main>

    </div>
  );
}
export default App;
