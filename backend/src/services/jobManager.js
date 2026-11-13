import fs from 'fs';
import { EventEmitter } from 'events';
import { config } from '../config.js';

class JobManager extends EventEmitter {
  constructor() {
    super();
    this.jobs = new Map();
    this.sseClients = new Map(); // jobId -> Set of Express response objects

    // Periodic cleanup of expired jobs
    setInterval(() => this.cleanupExpiredJobs(), 5 * 60 * 1000);
  }

  createJob(jobData) {
    const job = {
      id: jobData.id,
      url: jobData.url,
      format: jobData.format, // 'mp4' | 'mp3'
      quality: jobData.quality, // e.g. '1080', '720', '320k', etc.
      embedThumbnail: jobData.embedThumbnail !== false,
      videoTitle: jobData.videoTitle || 'download',
      artist: jobData.artist || 'RanTube',
      thumbnailUrl: jobData.thumbnailUrl || null,
      status: 'queued', // queued | downloading | converting | tagging | completed | failed
      progress: 0,
      phase: 'Initializing request...',
      speed: null,
      eta: null,
      filePath: null,
      fileName: null,
      fileSize: null,
      mimeType: null,
      error: null,
      createdAt: Date.now(),
      completedAt: null
    };

    this.jobs.set(job.id, job);
    return job;
  }

  getJob(jobId) {
    return this.jobs.get(jobId);
  }

  updateJob(jobId, updates) {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    Object.assign(job, updates);

    // Broadcast SSE update
    this.broadcastJobUpdate(job);
    return job;
  }

  failJob(jobId, errorMsg) {
    return this.updateJob(jobId, {
      status: 'failed',
      phase: 'Processing error',
      error: errorMsg || 'An unknown error occurred'
    });
  }

  completeJob(jobId, fileData) {
    return this.updateJob(jobId, {
      status: 'completed',
      progress: 100,
      phase: 'Ready for download!',
      completedAt: Date.now(),
      ...fileData
    });
  }

  // Register an SSE client for real-time progress updates
  registerSseClient(jobId, res) {
    if (!this.sseClients.has(jobId)) {
      this.sseClients.set(jobId, new Set());
    }
    this.sseClients.get(jobId).add(res);

    // Send immediate initial state
    const job = this.jobs.get(jobId);
    if (job) {
      res.write(`data: ${JSON.stringify(job)}\n\n`);
    }

    // Cleanup when client disconnects
    res.on('close', () => {
      const clients = this.sseClients.get(jobId);
      if (clients) {
        clients.delete(res);
        if (clients.size === 0) {
          this.sseClients.delete(jobId);
        }
      }
    });
  }

  broadcastJobUpdate(job) {
    const clients = this.sseClients.get(job.id);
    if (!clients || clients.size === 0) return;

    const data = `data: ${JSON.stringify(job)}\n\n`;
    for (const client of clients) {
      try {
        client.write(data);
      } catch {
        clients.delete(client);
      }
    }
  }

  cleanupExpiredJobs() {
    const now = Date.now();
    for (const [id, job] of this.jobs.entries()) {
      if (now - job.createdAt > config.jobTimeoutMs) {
        if (job.filePath && fs.existsSync(job.filePath)) {
          try {
            fs.unlinkSync(job.filePath);
            console.log(`[JobManager] Cleaned up temporary file: ${job.filePath}`);
          } catch (e) {
            console.error(`[JobManager] Failed to clean up file: ${job.filePath}`, e.message);
          }
        }
        this.jobs.delete(id);
      }
    }
  }
}

export const jobManager = new JobManager();

