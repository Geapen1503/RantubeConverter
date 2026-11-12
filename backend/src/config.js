import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMP_DIR = path.join(ROOT_DIR, 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// 1. Detect FFmpeg Path
let ffmpegPath = ffmpegStatic;
if (!ffmpegPath || !fs.existsSync(ffmpegPath)) {
  try {
    const sysFfmpeg = execSync('where ffmpeg', { encoding: 'utf-8' }).trim().split('\n')[0].trim();
    if (sysFfmpeg && fs.existsSync(sysFfmpeg)) {
      ffmpegPath = sysFfmpeg;
    }
  } catch {
    // fallback if not in path
  }
}

// 2. Detect yt-dlp Path / Command
let ytdlpCommand = {
  cmd: 'python',
  baseArgs: ['-m', 'yt_dlp']
};

const userScriptPath = path.join(
  process.env.APPDATA || '',
  'Python',
  'Python311',
  'Scripts',
  'yt-dlp.exe'
);

const localBinPath = path.join(ROOT_DIR, 'bin', 'yt-dlp.exe');

if (fs.existsSync(localBinPath)) {
  ytdlpCommand = { cmd: localBinPath, baseArgs: [] };
} else if (fs.existsSync(userScriptPath)) {
  ytdlpCommand = { cmd: userScriptPath, baseArgs: [] };
} else {
  try {
    const sysYtDlp = execSync('where yt-dlp', { encoding: 'utf-8' }).trim().split('\n')[0].trim();
    if (sysYtDlp && fs.existsSync(sysYtDlp)) {
      ytdlpCommand = { cmd: sysYtDlp, baseArgs: [] };
    }
  } catch {
    // Keep python -m yt_dlp default
  }
}

export const config = {
  port: process.env.PORT || 5000,
  rootDir: ROOT_DIR,
  tempDir: TEMP_DIR,
  ffmpegPath,
  ytdlpCommand,
  jobTimeoutMs: 30 * 60 * 1000, // 30 minutes before cleaning up temporary files
  maxDurationSeconds: 14400 // 4 hours limit
};

