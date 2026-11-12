import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import { config } from '../config.js';
import { embedMp3Metadata } from './tagger.js';

/**
 * Format duration in seconds to human readable hh:mm:ss or mm:ss
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const hrs = Math.floor(seconds / 360);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Clean filename to be safe on all operating systems
 */
function sanitizeFilename(name) {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'video';
}

/**
 * Run yt-dlp command and return JSON or handle stream
 */
function runYtDlp(args, onData) {
  return new Promise((resolve, reject) => {
    const fullCmd = config.ytdlpCommand.cmd;
    const fullArgs = [...config.ytdlpCommand.baseArgs, ...args];

    const child = spawn(fullCmd, fullArgs, {
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const chunk = data.toString('utf-8');
      stdout += chunk;
      if (onData) onData(chunk, 'stdout');
    });

    child.stderr.on('data', (data) => {
      const chunk = data.toString('utf-8');
      stderr += chunk;
      if (onData) onData(chunk, 'stderr');
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        const errorMsg = stderr.trim() || stdout.trim() || `Process exited with code ${code}`;
        reject(new Error(errorMsg));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Fetch video info and format options
 */
export async function getVideoInfo(url) {
  const args = [
    '--dump-single-json',
    '--no-playlist',
    '--no-warnings',
    '--skip-download',
    '--ffmpeg-location', config.ffmpegPath,
    url
  ];

  const jsonStr = await runYtDlp(args);
  const data = JSON.parse(jsonStr);

  const durationSec = data.duration || 0;

  // Process available video qualities
  const videoQualitiesMap = new Map();
  const rawFormats = data.formats || [];

  for (const fmt of rawFormats) {
    if (fmt.vcodec && fmt.vcodec !== 'none' && fmt.height) {
      const height = fmt.height;
      const fps = fmt.fps || 30;
      const isHdr = fmt.dynamic_range && fmt.dynamic_range.toLowerCase().includes('hdr');
      
      // Calculate estimated file size
      let estimatedBytes = fmt.filesize || fmt.filesize_approx;
      if (!estimatedBytes && fmt.tbr && durationSec > 0) {
        estimatedBytes = Math.round((fmt.tbr * 1024 / 8) * durationSec);
      }

      const existing = videoQualitiesMap.get(height);
      if (!existing || (fps > existing.fps) || (!existing.filesize && estimatedBytes)) {
        videoQualitiesMap.set(height, {
          quality: `${height}p`,
          resolution: height,
          fps,
          isHdr: !!isHdr,
          filesizeBytes: estimatedBytes || null,
          filesizeFormatted: estimatedBytes ? `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB` : null,
          formatId: fmt.format_id,
          ext: 'mp4'
        });
      }
    }
  }

  // Sort video qualities descending (e.g. 2160p down to 144p)
  const videoQualities = Array.from(videoQualitiesMap.values())
    .sort((a, b) => b.resolution - a.resolution)
    .map(q => {
      let label = `${q.resolution}p`;
      if (q.resolution >= 2160) label = `4K (${q.resolution}p)`;
      else if (q.resolution >= 1440) label = `2K (${q.resolution}p)`;
      else if (q.resolution === 1080) label = `1080p Full HD`;
      else if (q.resolution === 720) label = `720p HD`;
      
      if (q.fps && q.fps > 30) label += ` ${q.fps}fps`;
      if (q.isHdr) label += ` HDR`;

      return {
        ...q,
        label
      };
    });

  // Predefined standard MP3 bitrates with estimated size based on duration
  const mp3Bitrates = [
    { bitrate: '320k', label: '320 kbps (Qualité Studio)', note: 'Recommandé pour casques & enceintes Hi-Fi' },
    { bitrate: '256k', label: '256 kbps (Très Haute Qualité)', note: 'Excellent compromis audiophile' },
    { bitrate: '192k', label: '192 kbps (Haute Qualité)', note: 'Recommandé (optimal pour YouTube)' },
    { bitrate: '128k', label: '128 kbps (Qualité Standard)', note: 'Fichiers légers' },
    { bitrate: '64k',  label: '64 kbps (Éco / Podcasts)', note: 'Poids ultra réduit' }
  ];

  const audioQualities = mp3Bitrates.map(q => {
    const kbps = parseInt(q.bitrate, 10);
    const estimatedBytes = durationSec > 0 ? Math.round((kbps * 1000 / 8) * durationSec) : null;
    return {
      quality: q.bitrate,
      bitrate: q.bitrate,
      label: q.label,
      note: q.note,
      filesizeBytes: estimatedBytes,
      filesizeFormatted: estimatedBytes ? `${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB` : null,
      ext: 'mp3'
    };
  });

  // Get best thumbnail
  let bestThumbnail = data.thumbnail;
  if (data.id) {
    bestThumbnail = `https://i.ytimg.com/vi/${data.id}/maxresdefault.jpg`;
  }

  return {
    id: data.id,
    url,
    title: data.title || 'Vidéo YouTube',
    uploader: data.uploader || data.channel || 'Artiste inconnu',
    uploaderUrl: data.uploader_url || data.channel_url || null,
    duration: formatDuration(durationSec),
    durationSeconds: durationSec,
    viewCount: data.view_count || 0,
    uploadDate: data.upload_date || null,
    thumbnail: bestThumbnail,
    videoQualities,
    audioQualities
  };
}

/**
 * Parse yt-dlp stdout line to extract progress percentage, speed, and eta
 */
function parseProgressLine(line) {
  // Example: [download]  45.2% of ~  12.34MiB at    4.50MiB/s ETA 00:02
  const progressMatch = line.match(/\[download\]\s+([\d.]+)%/);
  if (progressMatch) {
    const percent = parseFloat(progressMatch[1]);
    const speedMatch = line.match(/at\s+([\d.]+\s*\S+\/s)/);
    const etaMatch = line.match(/ETA\s+([\d:]+)/);

    return {
      percent,
      speed: speedMatch ? speedMatch[1] : null,
      eta: etaMatch ? etaMatch[1] : null
    };
  }
  return null;
}

/**
 * Download and convert MP4 video
 */
export async function processVideoJob(job, updateProgress) {
  const safeTitle = sanitizeFilename(job.videoTitle);
  const outputTemplate = path.join(config.tempDir, `${job.id}_${safeTitle}.%(ext)s`);

  // Target format specification: best video at or below requested height + best audio
  const requestedHeight = parseInt(job.quality, 10) || 1080;
  const formatSelector = `bestvideo[height<=${requestedHeight}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${requestedHeight}]+bestaudio/best[height<=${requestedHeight}]/best`;

  const args = [
    '--format', formatSelector,
    '--merge-output-format', 'mp4',
    '--ffmpeg-location', config.ffmpegPath,
    '--no-playlist',
    '--newline',
    '--no-warnings',
    '-o', outputTemplate,
    job.url
  ];

  updateProgress({
    status: 'downloading',
    phase: 'Téléchargement du flux vidéo et audio...',
    progress: 10
  });

  await runYtDlp(args, (chunk) => {
    const lines = chunk.split('\n');
    for (const line of lines) {
      const prog = parseProgressLine(line);
      if (prog) {
        // Map 0-100% of download to 10-85% of total job
        const overallProgress = Math.min(85, Math.round(10 + prog.percent * 0.75));
        updateProgress({
          status: 'downloading',
          phase: `Téléchargement du flux (${prog.percent.toFixed(1)}%)...`,
          progress: overallProgress,
          speed: prog.speed,
          eta: prog.eta
        });
      } else if (line.includes('[Merger]') || line.includes('Merging formats')) {
        updateProgress({
          status: 'converting',
          phase: 'Fusion et finalisation du fichier MP4 avec FFmpeg...',
          progress: 88,
          speed: null,
          eta: null
        });
      }
    }
  });

  // Locate the final mp4 file
  const finalFilePath = path.join(config.tempDir, `${job.id}_${safeTitle}.mp4`);
  if (!fs.existsSync(finalFilePath)) {
    // Find matching file in temp directory with job.id prefix
    const files = fs.readdirSync(config.tempDir);
    const matched = files.find(f => f.startsWith(job.id) && f.endsWith('.mp4'));
    if (!matched) {
      throw new Error('Le fichier MP4 final est introuvable après la conversion.');
    }
    return {
      filePath: path.join(config.tempDir, matched),
      fileName: `${safeTitle}.mp4`,
      fileSize: fs.statSync(path.join(config.tempDir, matched)).size,
      mimeType: 'video/mp4'
    };
  }

  const stat = fs.statSync(finalFilePath);
  return {
    filePath: finalFilePath,
    fileName: `${safeTitle}.mp4`,
    fileSize: stat.size,
    mimeType: 'video/mp4'
  };
}

/**
 * Download and convert MP3 audio with cover art
 */
export async function processAudioJob(job, updateProgress) {
  const safeTitle = sanitizeFilename(job.videoTitle);
  const outputTemplate = path.join(config.tempDir, `${job.id}_${safeTitle}.%(ext)s`);

  // Bitrate handling: '320k', '256k', '192k', '128k', etc.
  const bitrate = job.quality || '320k';

  const args = [
    '-x',
    '--audio-format', 'mp3',
    '--audio-quality', bitrate,
    '--ffmpeg-location', config.ffmpegPath,
    '--no-playlist',
    '--newline',
    '--no-warnings',
    '-o', outputTemplate,
    job.url
  ];

  updateProgress({
    status: 'downloading',
    phase: 'Téléchargement de la meilleure piste audio...',
    progress: 10
  });

  await runYtDlp(args, (chunk) => {
    const lines = chunk.split('\n');
    for (const line of lines) {
      const prog = parseProgressLine(line);
      if (prog) {
        // Map download 0-100% to 10-70% of total job
        const overallProgress = Math.min(70, Math.round(10 + prog.percent * 0.60));
        updateProgress({
          status: 'downloading',
          phase: `Téléchargement audio (${prog.percent.toFixed(1)}%)...`,
          progress: overallProgress,
          speed: prog.speed,
          eta: prog.eta
        });
      } else if (line.includes('[ExtractAudio]') || line.includes('Destination')) {
        updateProgress({
          status: 'converting',
          phase: `Conversion en MP3 (${bitrate})...`,
          progress: 75,
          speed: null,
          eta: null
        });
      }
    }
  });

  // Locate final mp3 file
  const expectedMp3 = path.join(config.tempDir, `${job.id}_${safeTitle}.mp3`);
  let finalFilePath = expectedMp3;

  if (!fs.existsSync(expectedMp3)) {
    const files = fs.readdirSync(config.tempDir);
    const matched = files.find(f => f.startsWith(job.id) && f.endsWith('.mp3'));
    if (!matched) {
      throw new Error('Le fichier MP3 converti est introuvable.');
    }
    finalFilePath = path.join(config.tempDir, matched);
  }

  // Embed thumbnail & metadata if requested
  if (job.embedThumbnail !== false) {
    updateProgress({
      status: 'tagging',
      phase: 'Intégration de la miniature YouTube en pochette d’album...',
      progress: 90
    });

    const videoIdMatch = job.url.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/)([^&?#/]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    await embedMp3Metadata(finalFilePath, {
      title: job.videoTitle,
      artist: job.artist,
      thumbnailUrl: job.thumbnailUrl,
      videoId
    });
  }

  const stat = fs.statSync(finalFilePath);
  return {
    filePath: finalFilePath,
    fileName: `${safeTitle}.mp3`,
    fileSize: stat.size,
    mimeType: 'audio/mpeg'
  };
}

