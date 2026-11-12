import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import axios from 'axios';
import { config } from '../config.js';
import { jobManager } from '../services/jobManager.js';
import { getVideoInfo, processVideoJob, processAudioJob } from '../services/ytdlp.js';

export const apiRouter = express.Router();

/**
 * YouTube URL Validator regex
 */
const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com|youtu\.be)\/.+$/;

/**
 * GET /api/health
 */
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'RanTube Converter API',
    ffmpegReady: !!config.ffmpegPath && fs.existsSync(config.ffmpegPath),
    ytdlpCommand: config.ytdlpCommand.cmd
  });
});

/**
 * POST /api/info
 * Fetch metadata and available qualities for a YouTube video
 */
apiRouter.post('/info', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL manquante ou invalide.' });
    }

    const trimmedUrl = url.trim();
    if (!YOUTUBE_URL_REGEX.test(trimmedUrl)) {
      return res.status(400).json({ error: 'Veuillez fournir un lien YouTube valide (youtube.com ou youtu.be).' });
    }

    console.log(`[API] Fetching info for: ${trimmedUrl}`);
    const info = await getVideoInfo(trimmedUrl);
    res.json(info);
  } catch (error) {
    console.error('[API] /info error:', error.message);
    res.status(500).json({
      error: 'Impossible de récupérer les informations de la vidéo. Vérifiez le lien ou réessayez.',
      details: error.message
    });
  }
});

/**
 * POST /api/convert
 * Start conversion job
 */
apiRouter.post('/convert', async (req, res) => {
  try {
    const {
      url,
      format = 'mp3',
      quality = '320k',
      embedThumbnail = true,
      videoTitle,
      artist,
      thumbnailUrl
    } = req.body;

    if (!url || !YOUTUBE_URL_REGEX.test(url.trim())) {
      return res.status(400).json({ error: 'Lien YouTube invalide.' });
    }

    const cleanFormat = format.toLowerCase() === 'mp4' ? 'mp4' : 'mp3';
    const jobId = uuidv4();

    const job = jobManager.createJob({
      id: jobId,
      url: url.trim(),
      format: cleanFormat,
      quality: quality || (cleanFormat === 'mp4' ? '1080' : '320k'),
      embedThumbnail: embedThumbnail !== false,
      videoTitle,
      artist,
      thumbnailUrl
    });

    console.log(`[API] Created job ${jobId} (${cleanFormat.toUpperCase()} - ${job.quality})`);

    // Run conversion asynchronously in background
    (async () => {
      try {
        let result;
        if (cleanFormat === 'mp4') {
          result = await processVideoJob(job, (updates) => jobManager.updateJob(jobId, updates));
        } else {
          result = await processAudioJob(job, (updates) => jobManager.updateJob(jobId, updates));
        }

        jobManager.completeJob(jobId, result);
        console.log(`[API] Job ${jobId} completed successfully: ${result.fileName}`);
      } catch (err) {
        console.error(`[API] Job ${jobId} failed:`, err.message);
        jobManager.failJob(jobId, err.message);
      }
    })();

    res.json({
      jobId,
      message: 'Conversion démarrée avec succès.'
    });
  } catch (error) {
    console.error('[API] /convert error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/jobs/:id
 * Get current status of a job
 */
apiRouter.get('/jobs/:id', (req, res) => {
  const job = jobManager.getJob(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Tâche introuvable ou expirée.' });
  }
  res.json(job);
});

/**
 * GET /api/jobs/:id/events
 * Real-time SSE stream for job progress
 */
apiRouter.get('/jobs/:id/events', (req, res) => {
  const jobId = req.params.id;
  const job = jobManager.getJob(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Tâche introuvable.' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  jobManager.registerSseClient(jobId, res);
});

/**
 * GET /api/download/:id
 * Download the converted file
 */
apiRouter.get('/download/:id', (req, res) => {
  const job = jobManager.getJob(req.params.id);
  if (!job) {
    return res.status(404).send('Fichier introuvable ou lien expiré.');
  }

  if (job.status !== 'completed' || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(400).send('Le fichier n\'est pas encore prêt ou a été supprimé.');
  }

  const stat = fs.statSync(job.filePath);
  const encodedFilename = encodeURIComponent(job.fileName).replace(/['()]/g, escape).replace(/\*/g, '%2A');

  res.setHeader('Content-Type', job.mimeType || 'application/octet-stream');
  res.setHeader('Content-Length', stat.size);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${job.fileName}"; filename*=UTF-8''${encodedFilename}`
  );

  const readStream = fs.createReadStream(job.filePath);
  readStream.pipe(res);
});

/**
 * GET /api/thumbnail-proxy
 * Proxies thumbnail images to avoid CORS restrictions in frontend
 */
apiRouter.get('/thumbnail-proxy', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('URL manquante');
  }

  try {
    const response = await axios.get(url, { responseType: 'stream', timeout: 5000 });
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch {
    res.status(404).send('Image indisponible');
  }
});

